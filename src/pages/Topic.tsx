import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Common/Breadcrumb';
import { Chapter, LessonSection, TopicData } from '../types';
import { Play, Video, CheckCircle } from 'lucide-react';
import { fetchChapterById, fetchLessonSectionsByChapter } from '../services/data';
import { supabase } from '../services/supabase';
import { progressService } from '../services/progress';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { HTMLRenderer } from '../components/Lesson';
import TestConfiguration from '../components/Test/TestConfiguration';
import TestInterface from '../components/Test/TestInterface';
import TestResults from '../components/Test/TestResults';
import { TestConfiguration as TestConfigType, TestSession } from '../types/test';
import { TestService } from '../services/testService';

const Topic: React.FC = () => {
  const { chapterId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'lesson' | 'video' | 'test'>('lesson');
  const [activeVideoTab, setActiveVideoTab] = useState<1 | 2 | 3>(1);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [lessonSections, setLessonSections] = useState<LessonSection[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<number[]>([]);
  const [allVideos, setAllVideos] = useState<Array<{
    id: number;
    title: string;
    description: string;
    duration: number;
    youtube_url: string;
    youtube_id: string;
    thumbnail_url?: string;
    order_index: number;
  }>>([]);

  // Test state management
  const [testState, setTestState] = useState<'config' | 'test' | 'results'>('config');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [currentTestSession, setCurrentTestSession] = useState<TestSession | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const convertYouTubeUrl = (url: string, videoId: string): string => {
    // Convert various YouTube URL formats to embed URL
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    // Fallback to video ID
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getVideosForChapter = useCallback(async (id: number) => {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('id, title, description, duration, youtube_url, youtube_id, thumbnail_url, order_index')
        .eq('chapter_id', id)
        .order('order_index');
      if (error) throw error;
      return videos || [];
    } catch (e) {
      console.error('Error fetching videos:', e);
      return [];
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const id = chapterId ? parseInt(chapterId) : NaN;
      if (Number.isNaN(id)) return;

      const ch = await fetchChapterById(id);
      setChapterData(ch);

      // Load user progress first to get the real progress percentage
      let realProgress = 0;
      if (user) {
        const completedSecs = await progressService.getCompletedSections(id);
        const watchedVids = await progressService.getWatchedVideos(id);
        setCompletedSections(completedSecs);
        setWatchedVideos(watchedVids);
        
        // Calculate real progress: each chapter has 7 sections + 3 videos = 10 total
        const totalItems = 10;
        const completedItems = completedSecs.length + watchedVids.length;
        realProgress = Math.round((completedItems / totalItems) * 100);
        
      }

      setTopicData({ 
        id, 
        title: ch?.title || 'Topic', 
        chapter: ch?.title || 'Chapter', 
        description: ch?.description || '', 
        progress: realProgress, // Use real progress instead of hardcoded 0
        lessonContent: '', 
        questions: [] 
      });

      const secs = await fetchLessonSectionsByChapter(id);
      if (secs.length) {
        setLessonSections(secs);
      } else {
        const titles = [
          'Conceptual Introduction',
          'Core Definitions and Laws',
          'Solved Example Problems',
          'Key Formulae + Derivations + Additional Concepts',
          'Common Mistakes and Misconceptions',
          'Real-Life Applications',
          'Summary and Formula Sheet',
        ];
        setLessonSections(
          titles.map((t, i) => ({ id: i + 1, chapterId: id, orderIndex: i + 1, title: t, contentHtml: `<h3>${t}</h3><p>Content coming soon. Add details in '${import.meta.env.VITE_LESSON_SECTIONS_TABLE || 'lesson_sections'}'.</p>` }))
        );
      }
      setCurrentSectionIndex(0);

      const videos = await getVideosForChapter(id);
      setAllVideos(videos);

      // Note: Auto-start session logic moved to separate useEffect to avoid dependency issues
    };
    load();
  }, [chapterId, getVideosForChapter, user]);

  // Test handler functions
  const handleStartTest = async (config: TestConfigType) => {
    setIsTestLoading(true);
    setTestError(null);

    try {
      // Generate questions using TestService
      const questions = await TestService.generateQuestions({
<<<<<<< HEAD
        topic: config.topic,
        questionCount: config.questionCount,
=======
        chapterTitle: config.topic,
        count: config.questionCount,
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
        difficulty: config.difficulty,
        questionType: config.questionType
      });

      // Create new test session
      const session: TestSession = {
        id: `session-${Date.now()}`,
        configuration: config,
        questions,
        answers: {},
        startTime: new Date(),
        totalQuestions: config.questionCount,
        correctAnswers: 0,
        wrongAnswers: 0
      };

      setCurrentTestSession(session);
      setTestState('test');
    } catch (err) {
      console.error('Error generating questions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setTestError(errorMessage);
      
      // If it's a parsing error, provide more helpful message
      if (errorMessage.includes('parse')) {
        setTestError('Question generation completed with sample questions. The AI response format was unexpected, but you can still take the test.');
      }
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleCompleteTest = (session: TestSession) => {
    console.log('handleCompleteTest called with session:', session);
    setCurrentTestSession(session);
    setTestState('results');
    console.log('Test state changed to results');
  };

  const handleRetakeTest = () => {
    if (currentTestSession) {
      // Reset answers and start time for retake
      const retakeSession: TestSession = {
        ...currentTestSession,
        answers: {},
        startTime: new Date(),
        endTime: undefined,
        score: undefined,
        correctAnswers: 0,
        wrongAnswers: 0
      };
      setCurrentTestSession(retakeSession);
      setTestState('test');
    }
  };

  const handleNewTest = () => {
    setCurrentTestSession(null);
    setTestState('config');
  };

  const handleExitTest = () => {
    if (window.confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
      setCurrentTestSession(null);
      setTestState('config');
    }
  };

  if (!topicData) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Chapters', path: '/chapters' },
    { label: topicData?.title || 'Topic' },
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 transition-colors duration-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide mb-3">
                {chapterData?.title || topicData.chapter}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {topicData.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{topicData.description}</p>
            </div>
            <div className="text-center lg:text-right min-w-48">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-blue-600 to-teal-600 rounded-full transition-all duration-1000" style={{ width: `${topicData.progress}%` }} />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{topicData.progress}% Complete</p>
              
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
          <div className="flex bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            {[
              { id: 'lesson' as const, label: '📖 Lesson', shortLabel: '📖 L' },
              { id: 'video' as const, label: '🎥 Video', shortLabel: '🎥 V' },
              { id: 'test' as const, label: '📝 Test', shortLabel: '📝 T' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 font-medium transition-all duration-200 ${
                  activeTab === t.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600'
                }`}
              >
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.shortLabel}</span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6 lg:p-8 min-h-96">
            {activeTab === 'lesson' && (
              <div className="max-w-5xl mx-auto">
                <div className="space-y-8">
                  <div className="text-center sm:text-left">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 shadow-sm border border-blue-200 dark:border-blue-700">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {lessonSections[currentSectionIndex]?.title || 'Lesson'}
                      </h3>
                      <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Physics Lesson
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Interactive Content
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="lesson-content-wrapper bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
                    <HTMLRenderer 
                      content={lessonSections[currentSectionIndex]?.contentHtml || ''} 
                      className="text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-600">
                  <button 
                    onClick={() => setCurrentSectionIndex((i) => Math.max(0, i - 1))} 
                    disabled={currentSectionIndex === 0} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">← Previous Lesson</span>
                    <span className="sm:hidden">← Previous</span>
                  </button>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {user && lessonSections[currentSectionIndex] && (
                      <button
                        onClick={async () => {
                          try {
                            const sectionId = lessonSections[currentSectionIndex].id;
                            const chId = parseInt(chapterId || '0');
                            
                            // Use simple 5-minute study time
                            const studyTimeMinutes = 5;
                            
                            await progressService.markSectionCompleted(chId, sectionId, studyTimeMinutes);
                            setCompletedSections(prev => [...prev, sectionId]);
                            
                            // Update progress bar in real-time
                            const totalItems = 10;
                            const completedItems = completedSections.length + 1 + watchedVideos.length; // +1 for the newly completed section
                            const newProgress = Math.round((completedItems / totalItems) * 100);
                            setTopicData(prev => prev ? { ...prev, progress: newProgress } : null);
                            
                            showToast(`Section completed! 🎉 (${studyTimeMinutes}m study time)`, 'success');
                          } catch (error) {
                            console.error('Error marking section complete:', error);
                            showToast('Failed to save progress', 'error');
                          }
                        }}
                        disabled={completedSections.includes(lessonSections[currentSectionIndex]?.id)}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
                          completedSections.includes(lessonSections[currentSectionIndex]?.id)
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {completedSections.includes(lessonSections[currentSectionIndex]?.id) ? 'Completed' : 'Mark Complete'}
                        </span>
                        <span className="sm:hidden">
                          {completedSections.includes(lessonSections[currentSectionIndex]?.id) ? '✓ Done' : '✓ Complete'}
                        </span>
                      </button>
                    )}

                    <button 
                      onClick={() => setCurrentSectionIndex((i) => Math.min(lessonSections.length - 1, i + 1))} 
                      disabled={currentSectionIndex === lessonSections.length - 1} 
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Next Lesson →</span>
                      <span className="sm:hidden">Next →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="max-w-4xl mx-auto">
                {/* Video Sub-tabs */}
                <div className="flex justify-center mb-8">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {[1, 2, 3].map((videoNum) => (
                      <button
                        key={videoNum}
                        onClick={() => setActiveVideoTab(videoNum as 1 | 2 | 3)}
                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                          activeVideoTab === videoNum
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        Video {videoNum}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const currentVideo = allVideos.find(v => v.order_index === activeVideoTab);
                  const embedUrl = currentVideo ? convertYouTubeUrl(currentVideo.youtube_url, currentVideo.youtube_id) : null;
                  
                  return (
                    <>
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          {currentVideo?.title || `Video ${activeVideoTab} Coming Soon`}
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          {currentVideo?.description || "We're preparing high-quality video content for this section"}
                        </p>
                      </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
                        <div className="aspect-video bg-gray-900 relative">
                          {embedUrl ? (
                            <iframe 
                              className="w-full h-full"
                              src={embedUrl} 
                              title={currentVideo?.title || `Video ${activeVideoTab}`} 
                              frameBorder={0} 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-60" />
                                <h4 className="text-xl font-semibold mb-2">Video {activeVideoTab} Coming Soon</h4>
                                <p className="text-gray-300 mb-6">We're preparing high-quality video content for this section</p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Notify When Available
                      </button>
                    </div>
                            </div>
                          )}
                  </div>
                  
                        {currentVideo && (
                          <div className="p-6 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                  {currentVideo.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Duration: {formatDuration(currentVideo.duration)} • Quality: HD
                                </p>
                              </div>
                              
                              {user && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const chId = parseInt(chapterId || '0');
                                      
                                      // Use video duration as study time
                                      const studyTimeMinutes = Math.max(1, Math.ceil(currentVideo.duration / 60));
                                      
                                      await progressService.markVideoWatched(chId, currentVideo.id, studyTimeMinutes);
                                      setWatchedVideos(prev => [...prev, currentVideo.id]);
                                      
                                      // Update progress bar in real-time
                                      const totalItems = 10;
                                      const completedItems = completedSections.length + watchedVideos.length + 1; // +1 for the newly watched video
                                      const newProgress = Math.round((completedItems / totalItems) * 100);
                                      setTopicData(prev => prev ? { ...prev, progress: newProgress } : null);
                                      
                                      showToast(`Video marked as watched! 🎬 (${studyTimeMinutes}m watch time)`, 'success');
                                    } catch (error) {
                                      console.error('Error marking video watched:', error);
                                      showToast('Failed to save progress', 'error');
                                    }
                                  }}
                                  disabled={watchedVideos.includes(currentVideo.id)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    watchedVideos.includes(currentVideo.id)
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {watchedVideos.includes(currentVideo.id) ? 'Watched' : 'Mark Watched'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                </div>
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab === 'test' && (
              <div className="max-w-4xl mx-auto">
                {/* Error Message */}
                {testError && (
                  <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{testError}</p>
                      </div>
                      <button
                        onClick={() => setTestError(null)}
                        className="ml-4 text-white hover:text-gray-200"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* Test Content */}
                {testState === 'config' && (
                  <TestConfiguration
                    onStartTest={handleStartTest}
                    isLoading={isTestLoading}
                    chapterTitle={chapterData?.title}
                  />
                )}

                {testState === 'test' && currentTestSession && (
                  <TestInterface
                    session={currentTestSession}
                    onCompleteTest={handleCompleteTest}
                    onExitTest={handleExitTest}
                  />
                )}

                {testState === 'results' && currentTestSession && (
                  <TestResults
                    session={currentTestSession}
                    onRetakeTest={handleRetakeTest}
                    onNewTest={handleNewTest}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Topic;


