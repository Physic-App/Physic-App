import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import ProgressRing from '../components/Common/ProgressRing';
import { 
  Clock, 
  Target, 
  Award, 
  BookOpen, 
  Calendar,
  TrendingUp,
  Play,
  HelpCircle
} from 'lucide-react';

interface DashboardProps {
  userData: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userData }) => {
  const [currentQuote, setCurrentQuote] = useState<{text: string; author: string} | null>(null);

  const motivationalQuotes = [
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
  ];

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overallProgress = (userData.completedChapters / userData.totalChapters) * 100;

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
                  Welcome back, {userData.name.split(' ')[0]}! 👋
                </h2>
                <p className="text-xl opacity-90">
                  Ready to continue your math journey today?
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
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.studyTime}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Hours This Month</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.averageScore}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Quiz Score</div>
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
                to={`/chapters/1`}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/chapters"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-600"
            >
              <div className="text-4xl mb-4">📚</div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Browse Chapters
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Explore all available topics</p>
            </Link>

            <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-green-200 dark:hover:border-green-600 cursor-pointer">
              <div className="text-4xl mb-4">🧮</div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400">
                Practice Quiz
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Test your knowledge</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-yellow-200 dark:hover:border-yellow-600 cursor-pointer">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400">
                View Progress
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track your learning journey</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-600 cursor-pointer">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Chatbot
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Need assistance?</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;