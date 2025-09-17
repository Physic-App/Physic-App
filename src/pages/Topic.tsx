import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Common/Breadcrumb';
import { Chapter, LessonSection, TopicData } from '../types';
import { Play, Video } from 'lucide-react';
import { fetchChapterById, fetchLessonSectionsByChapter } from '../services/data';
import { supabase } from '../services/supabase';

const Topic: React.FC = () => {
  const { chapterId } = useParams();
  const [activeTab, setActiveTab] = useState<'lesson' | 'video'>('lesson');
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [lessonSections, setLessonSections] = useState<LessonSection[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [videoData, setVideoData] = useState<{ title: string; description: string; duration: string; thumbnail: string | null; videoUrl: string | null; topics: string[]; allVideos: unknown[] } | null>(null);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVideoDataForChapter = useCallback(async (id: number) => {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('id, title, description, duration, youtube_url, youtube_id, thumbnail_url, order_index')
        .eq('chapter_id', id)
        .order('order_index');
      if (error) throw error;
      if (videos && videos.length > 0) {
        const v = videos[0];
        return {
          title: v.title,
          description: v.description,
          duration: formatDuration(v.duration),
          thumbnail: v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/maxresdefault.jpg`,
          videoUrl: v.youtube_url || `https://www.youtube.com/embed/${v.youtube_id}`,
          topics: [],
          allVideos: videos,
        };
      }
      return {
        title: 'Video Coming Soon',
        description: "We're preparing high-quality video content for this topic",
        duration: '00:00',
        thumbnail: null,
        videoUrl: null,
        topics: [],
        allVideos: [],
      };
    } catch (e) {
      console.error('Error fetching video:', e);
      return null;
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const id = chapterId ? parseInt(chapterId) : NaN;
      if (Number.isNaN(id)) return;

      const ch = await fetchChapterById(id);
      setChapterData(ch);
      setTopicData({ id, title: ch?.title || 'Topic', chapter: ch?.title || 'Chapter', description: ch?.description || '', progress: ch?.progress ?? 0, lessonContent: '', questions: [] });

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

      const vd = await getVideoDataForChapter(id);
      setVideoData(vd);
    };
    load();
  }, [chapterId, getVideoDataForChapter]);

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
              { id: 'lesson' as const, label: '📖 Lesson' },
              { id: 'video' as const, label: '🎥 Video' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
                  activeTab === t.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-8 min-h-96">
            {activeTab === 'lesson' && (
              <div className="max-w-3xl mx-auto">
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 pb-2 border-b border-gray-200 dark:border-gray-600">{lessonSections[currentSectionIndex]?.title || 'Lesson'}</h3>
                  <div className="prose max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: lessonSections[currentSectionIndex]?.contentHtml || '' }} />
                </div>
                <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-600">
                  <button onClick={() => setCurrentSectionIndex((i) => Math.max(0, i - 1))} disabled={currentSectionIndex === 0} className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">← Previous Lesson</button>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Preview</button>
                    <button onClick={() => setCurrentSectionIndex((i) => Math.min(lessonSections.length - 1, i + 1))} disabled={currentSectionIndex === lessonSections.length - 1} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next Lesson →</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Video Lesson: {videoData?.title || topicData?.title || 'Loading...'}</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{videoData?.description || 'Watch our comprehensive video explanation of this topic'}</p>
                      </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
                        <div className="aspect-video bg-gray-900 relative">
                          {videoData?.videoUrl ? (
                      <iframe className="w-full h-full" src={videoData.videoUrl} title={videoData.title || 'Lesson Video'} frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-60" />
                          <h4 className="text-xl font-semibold mb-2">{videoData?.title || 'Video Coming Soon'}</h4>
                          <p className="text-gray-300 mb-6">{videoData?.description || "We're preparing high-quality video content for this topic"}</p>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"><Play className="w-4 h-4" />Notify When Available</button>
                        </div>
              </div>
            )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Topic;


