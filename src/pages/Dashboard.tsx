import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { progressService } from '../services/progress';
import { activityService } from '../services/activity';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import ProgressRing from '../components/Common/ProgressRing';
import { 
  Award, 
  BookOpen, 
  Play,
  Clock,
} from 'lucide-react';

interface DashboardProps {
  userData: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userData: propUserData }) => {
  const { user } = useAuth();
  const [currentQuote, setCurrentQuote] = useState<{text: string; author: string} | null>(null);
  const [lastChapterId, setLastChapterId] = useState<number | null>(null);
  const [lastTopicId, setLastTopicId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<{name: string; isNewUser: boolean} | null>(null);
  const [realUserData, setRealUserData] = useState<User | null>(null);

  const motivationalQuotes = useMemo(() => ([
    {
      text: "Mathematics is not about numbers, equations, or algorithms: it is about understanding.",
      author: "William Paul Thurston"
    },
    {
      text: "Pure mathematics is, in its way, the poetry of logical ideas.",
      author: "Albert Einstein"
    },
    {
      text: "The only way to learn mathematics is to do mathematics.",
      author: "Paul Halmos"
    },
    {
      text: "Success is the sum of small efforts repeated day in and day out.",
      author: "Robert Collier"
    }
  ]), []);

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
  }, [motivationalQuotes]);

  // Load real user data based on authentication and progress
  useEffect(() => {
    const loadRealUserData = async () => {
      if (!user) {
        console.log('No authenticated user, using demo data');
        setRealUserData(propUserData); // Use fallback data if not authenticated
        return;
      }

      try {
        console.log('Loading real user data for authenticated user');
        // Get user stats from progress service
        const userStats = await progressService.getUserStats();
        const allChaptersProgress = await progressService.getAllChaptersProgress();
        
        // Calculate overall progress
        const totalChapters = 10; // You have 10 physics chapters
        const completedChapters = Object.values(allChaptersProgress).filter(progress => progress === 100).length;
        
        // Find last studied topic (chapter with highest progress that's not 100%)
        let lastChapter = 'Force and Pressure';
        const lastTopic = 'Conceptual Introduction';
        let lastProgress = 0;
        
        const chapterNames = [
          'Force and Pressure', 'Friction', 'Electric Current and Its Effects', 'Motion',
          'Force and Laws of Motion', 'Gravitation', 'Light: Reflection and Refraction', 
          'Electricity', 'Magnetic Effects of Electric Current', 'Work and Energy'
        ];
        
        // Find the most recently progressed chapter
        Object.entries(allChaptersProgress).forEach(([chapterId, progress]) => {
          if (progress > 0 && progress < 100) {
            const chapterIndex = parseInt(chapterId) - 1;
            if (chapterIndex >= 0 && chapterIndex < chapterNames.length) {
              lastChapter = chapterNames[chapterIndex];
              lastProgress = progress;
            }
          }
        });

        // Get real streak and total study time from activity service
        const streakStats = await activityService.getStreakStats();
        const totalStudyTimeMinutes = await activityService.getTotalStudyTime();

        // Build real user data
        const userData: User = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Physics Student',
          email: user.email || 'student@example.com',
          streak: streakStats.currentStreak, // Real streak from activity data
          completedChapters,
          totalChapters,
          studyTime: totalStudyTimeMinutes,
          averageScore: 0, // Quiz scoring not yet implemented
          achievements: Math.floor((completedChapters / totalChapters) * 15), // Rough calculation
          lastTopic: {
            chapter: lastChapter,
            topic: lastTopic,
            progress: lastProgress,
          },
        };

        setRealUserData(userData);
        
      } catch (error) {
        console.error('Failed to load real user data:', error);
        setRealUserData(propUserData); // Fallback to prop data
      }
    };

    loadRealUserData();
  }, [user, propUserData]);

  // Load user profile for personalized greeting
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // Check if user has any progress data
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        // Check if user has any activity data
        const { data: activityData } = await supabase
          .from('daily_activity')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner';
        
        // User is new if: 
        // 1. No profile exists OR profile exists but onboarding not completed
        // 2. AND no progress data exists
        // 3. AND no activity data exists
        const isNewUser = (!profile || !profile.onboarding_completed) && 
                         (!progressData || progressData.length === 0) && 
                         (!activityData || activityData.length === 0);
        
        setUserProfile({ name, isNewUser });
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile({ 
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner', 
          isNewUser: true // Default to new user if there's an error
        });
      }
    };
    
    loadUserProfile();
  }, [user]);

  // Resolve real chapter/topic IDs for the Continue link
  useEffect(() => {
    const resolveIds = async () => {
      if (!realUserData?.lastTopic?.chapter) return;
      // Find chapter id by title
      const { data: chapter, error: chErr } = await supabase
        .from('chapters')
        .select('id')
        .eq('title', realUserData.lastTopic.chapter)
        .maybeSingle();
      if (chErr || !chapter) return;
      setLastChapterId(chapter.id as number);

      // Find topic id by title within chapter
      if (realUserData.lastTopic.topic) {
        const { data: topic, error: tpErr } = await supabase
          .from('topics')
          .select('id')
          .eq('chapter_id', chapter.id)
          .eq('title', realUserData.lastTopic.topic)
          .maybeSingle();
        if (!tpErr && topic) {
          setLastTopicId(topic.id as number);
        }
      }
    };
    resolveIds();
  }, [realUserData?.lastTopic?.chapter, realUserData?.lastTopic?.topic]);

  // Use realUserData if available, otherwise fallback to propUserData
  const userData = realUserData || propUserData;

  if (!userData) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overallProgress = userData.totalChapters > 0
    ? (userData.completedChapters / userData.totalChapters) * 100
    : 0;

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-teal-600 dark:from-blue-700 dark:to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  {userProfile?.isNewUser 
                    ? `Welcome to Physics, ${userProfile.name}! 🎉`
                    : `Welcome back, ${userProfile?.name || userData?.name?.split(' ')[0] || 'Learner'}! 👋`
                  }
                  {!user && (
                    <span className="text-sm font-normal opacity-75 block mt-1">
                      (Demo Mode - No authentication required)
                    </span>
                  )}
                </h2>
                <p className="text-xl opacity-90">
                  {userProfile?.isNewUser 
                    ? "Let's start your physics learning journey!"
                    : "Ready to continue your physics journey today?"
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md rounded-xl p-6">
                <div className="text-4xl animate-pulse">🔥</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userData.streak}</div>
                  <div className="text-sm opacity-90">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Progress Ring */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center transition-colors duration-300">
              <ProgressRing progress={overallProgress} size={140} className="mb-6" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Chapter Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">Keep up the great work!</p>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.completedChapters}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Chapters Completed</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activityService.formatStudyTime(userData.studyTime)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Study Time</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.achievements}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Continue Learning */}
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center transition-colors duration-300">
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Continue Learning</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Pick up where you left off</p>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                  {userData.lastTopic.chapter}
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {userData.lastTopic.topic}
                </span>
              </div>

              <Link 
                to={
                  lastChapterId && lastTopicId
                    ? `/app/chapters/${lastChapterId}/topics/${lastTopicId}`
                    : lastChapterId
                    ? `/app/chapters/${lastChapterId}`
                    : '/app/chapters'
                }
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Continue Learning
              </Link>
            </div>

            <div className="text-center lg:text-right">
              <div className="bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-2xl p-8">
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 font-mono">
                  ax² + bx + c = 0
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Motivational Quote */}
        {currentQuote && (
          <section className="mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-yellow-500 dark:from-orange-600 dark:to-yellow-600 rounded-2xl p-8 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4 opacity-90">💡</div>
                <blockquote className="text-xl font-medium leading-relaxed mb-4 italic">
                  "{currentQuote.text}"
                </blockquote>
                <cite className="text-sm opacity-90">
                  - {currentQuote.author}
                </cite>
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-900 dark:text-gray-100">Quick Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              to="/app/chapters"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-600"
            >
              <div className="text-4xl mb-4">📚</div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Browse Chapters
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Explore all available topics</p>
            </Link>

            <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-green-200 dark:hover:border-green-600 cursor-pointer">
              <div className="text-4xl mb-4">⚗️</div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400">
                Simulators
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interactive physics experiments</p>
            </div>

            <Link 
              to="/app/test-features"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-600"
            >
              <div className="text-4xl mb-4">🧪</div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Test Features
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Try new interactive features</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;