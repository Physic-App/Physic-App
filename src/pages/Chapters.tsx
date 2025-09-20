import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chapter } from '../types';
import Breadcrumb from '../components/Common/Breadcrumb';
import { Clock, Award, Play, Lock } from 'lucide-react';
import { fetchChaptersWithTopics } from '../services/data';
import { progressService } from '../services/progress';
import { activityService } from '../services/activity';
import { useAuth } from '../hooks/useAuth';

const Chapters: React.FC = () => {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersProgress, setChaptersProgress] = useState<Record<number, number>>({});
  const [chaptersStudyTime, setChaptersStudyTime] = useState<Record<number, number>>({});

  // Removed fallback sample data - using database only

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await fetchChaptersWithTopics();
        console.log('Chapters loaded:', data);
        if (!isMounted) return;
        setChapters(data);

        // Load progress and study time for all chapters if user is logged in
        if (user) {
          const progress = await progressService.getAllChaptersProgress();
          const studyTime = await activityService.getStudyTimePerChapter();
          console.log('Chapters progress loaded:', progress);
          console.log('Chapters study time loaded:', studyTime);
          if (isMounted) {
            setChaptersProgress(progress);
            setChaptersStudyTime(studyTime);
          }
        }
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user]);

  const filteredChapters = chapters;

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Chapters' }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <section className="flex flex-col lg:flex-row justify-between items-center mb-8 py-8 gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Choose Your Subject</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Master fundamentals step by step</p>
          </div>
          
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-md">
            <button className="px-5 py-3 rounded-md font-medium bg-blue-600 dark:bg-blue-700 text-white shadow-sm">
              Physics
              </button>
          </div>
        </section>

        {/* Breadcrumb - moved below header */}
        <div className="flex justify-center mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Chapters Grid */}
        <section>
          {filteredChapters.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No chapters found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Check browser console for errors.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
                  !chapter.isUnlocked ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-blue-600 to-teal-600 dark:from-blue-700 dark:to-teal-700 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative z-10">
                    <div className="text-3xl mb-3">{chapter.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{chapter.title}</h3>
                    <p className="text-sm opacity-90">{chapter.description}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold z-20">
                    {(() => {
                      const realProgress = chaptersProgress[chapter.id] || 0;
                      if (realProgress === 100) return '✓';
                      if (chapter.isUnlocked) return realProgress + '%';
                      return <Lock className="w-4 h-4" />;
                    })()}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {activityService.formatStudyTime(chaptersStudyTime[chapter.id] || 0)}
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{chaptersProgress[chapter.id] || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-teal-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${chaptersProgress[chapter.id] || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Topics</div>
                    <div className="flex flex-wrap gap-2">
                      {chapter.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                          {topic}
                        </span>
                      ))}
                      {chapter.topics.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                          +{chapter.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {chapter.isUnlocked ? (
                      <Link
                        to={`/chapters/${chapter.id}`}
                        className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        {chapter.progress > 0 ? 'Continue' : 'Start'}
                      </Link>
                    ) : (
                      <button className="w-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed">
                        Complete Previous Chapters
                      </button>
                    )}
                  </div>
                </div>
                {!chapter.isUnlocked && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <Lock className="w-12 h-12 text-gray-400 mb-4" />
                    <div className="text-center px-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Chapter Locked</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Complete previous chapters to unlock</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chapters;