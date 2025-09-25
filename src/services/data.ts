import { supabase } from './supabase';
import { Chapter, User, LessonSection } from '../types';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('your-project-ref') && !key.includes('your-anon-key');
};

// Helper to convert plain text to basic HTML
function convertTextToHtml(text: string): string {
  if (!text) return '';
  
  return text
    .split('\n\n')
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';
      
      // Convert **bold** to <strong>
      const html = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Convert bullet points
      if (html.startsWith('- ')) {
        const items = html.split('\n').filter(line => line.trim().startsWith('- '));
        const listItems = items.map(item => `<li>${item.substring(2).trim()}</li>`).join('');
        return `<ul>${listItems}</ul>`;
      }
      
      // Regular paragraph
      return `<p>${html}</p>`;
    })
    .join('');
}

// const USER_TABLE = (
//   import.meta.env.VITE_USER_TABLE as string
// ) || '';
const CHAPTERS_TABLE = (
  import.meta.env.VITE_CHAPTERS_TABLE as string
) || 'chapters';
const TOPICS_TABLE = (
  import.meta.env.VITE_TOPICS_TABLE as string
) || 'topics';
// Removed LESSON_SECTIONS_TABLE - using topics table only

export async function fetchUserData(): Promise<User | null> {
  // Return null if Supabase is not configured - app will use fallback data
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // Only try the user_profiles table which we know exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      // Map flexible shapes into the app's User type with safe fallbacks
      const user: User = {
        id: String(data.id ?? data.user_id ?? '1'),
        name: String(data.name ?? data.full_name ?? data.username ?? 'Learner'),
        email: String(data.email ?? 'student@example.com'),
        streak: Number(data.streak ?? 0),
        completedChapters: Number(data.completed_chapters ?? data.completedChapters ?? 0),
        totalChapters: Number(data.total_chapters ?? data.totalChapters ?? 0),
        studyTime: Number(data.study_time ?? data.studyTime ?? 0),
        averageScore: Number(data.average_score ?? data.averageScore ?? 0),
        achievements: Number(data.achievements ?? 0),
        lastTopic: {
          chapter: String(data.last_chapter_title ?? data.lastChapterTitle ?? ''),
          topic: String(data.last_topic_title ?? data.lastTopicTitle ?? ''),
          progress: Number(data.last_topic_progress ?? data.lastTopicProgress ?? 0),
        },
      };
      return user;
    }
  } catch {
    // Database error - app will use fallback data
  }
  return null;
}

export async function fetchChaptersWithTopics(): Promise<Chapter[]> {
  // Return empty array if Supabase is not configured - app will use fallback data
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data: chapters, error: chErr } = await supabase
      .from(CHAPTERS_TABLE)
      .select('id,title,description,icon,order_index')
      .gte('id', 1)  // Only physics chapters (1-10)
      .lte('id', 10)
      .order('id');

    if (chErr) throw chErr;
    if (!chapters || chapters.length === 0) return [];

    const chapterIds = chapters.map((c: { id: number }) => c.id);
    const { data: topics, error: tpErr } = await supabase
      .from(TOPICS_TABLE)
      .select('title,chapter_id')
      .in('chapter_id', chapterIds);

    if (tpErr) throw tpErr;

    const chapterIdToTopics: Record<number, string[]> = {};
    (topics ?? []).forEach((t: { title: string; chapter_id: number }) => {
      const cid = Number(t.chapter_id);
      if (!chapterIdToTopics[cid]) chapterIdToTopics[cid] = [];
      chapterIdToTopics[cid].push(String(t.title));
    });

    return chapters.map((ch: {
      id: number;
      title?: string;
      description?: string;
      icon?: string;
      order_index?: number;
    }) => ({
      id: Number(ch.id),
      title: String(ch.title ?? 'Untitled'),
      description: String(ch.description ?? ''),
      icon: String(ch.icon ?? '📘'),
      progress: 0, // Default since your table doesn't have progress
      isUnlocked: true, // Default since your table doesn't have unlock status
      isCompleted: false, // Default since your table doesn't have completion status
      topics: chapterIdToTopics[Number(ch.id)] ?? [],
      studyTime: 0, // Default since your table doesn't have study time
      quizzes: 0, // Default since your table doesn't have quiz count
    }));
  } catch {
    return [];
  }
}

export async function fetchChapterById(id: number): Promise<Chapter | null> {
  // Return null if Supabase is not configured - app will use fallback data
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(CHAPTERS_TABLE)
      .select('id,title,description,icon,order_index')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    const { data: topicsData } = await supabase
      .from(TOPICS_TABLE)
      .select('title')
      .eq('chapter_id', id);

    const topicTitles = (topicsData ?? []).map((t: { title: string }) => t.title);

    return {
      id: Number(data.id),
      title: String(data.title ?? 'Untitled'),
      description: String(data.description ?? ''),
      icon: String(data.icon ?? '📘'),
      progress: 0, // Default since your table doesn't have progress
      isUnlocked: true, // Default since your table doesn't have unlock status
      isCompleted: false, // Default since your table doesn't have completion status
      topics: topicTitles,
      studyTime: 0, // Default since your table doesn't have study time
      quizzes: 0, // Default since your table doesn't have quiz count
    };
  } catch {
    return null;
  }
}

export async function fetchLessonSectionsByChapter(chapterId: number): Promise<LessonSection[]> {
  // Return empty array if Supabase is not configured - app will use fallback data
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Fetch from your topics table with exact schema
    const { data: topicsData, error: topicsErr } = await supabase
      .from(TOPICS_TABLE)
      .select('id, title, lesson_content, description, order_index')
      .eq('chapter_id', chapterId)
      .order('order_index');

    if (topicsErr) throw topicsErr;
    if (!topicsData || topicsData.length === 0) return [];

    return topicsData.map((row: {
      id: number;
      title: string;
      lesson_content: string;
      description?: string;
      order_index: number;
    }) => ({
      id: Number(row.id),
      chapterId: Number(chapterId),
      orderIndex: Number(row.order_index),
      title: String(row.title),
      contentHtml: convertTextToHtml(row.lesson_content || ''),
    }));
  } catch {
    return [];
  }
}


