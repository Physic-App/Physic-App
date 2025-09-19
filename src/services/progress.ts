import { supabase } from './supabase';

export type ProgressType = 'section_completed' | 'video_watched' | 'chapter_completed';

export interface UserProgress {
  id: string;
  user_id: string;
  chapter_id: number;
  section_id?: number;
  video_id?: number;
  progress_type: ProgressType;
  completed_at: string;
  study_time_minutes: number;
}

export const progressService = {
  // Mark a lesson section as completed
  async markSectionCompleted(chapterId: number, sectionId: number, studyTimeMinutes = 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        chapter_id: chapterId,
        section_id: sectionId,
        progress_type: 'section_completed',
        study_time_minutes: studyTimeMinutes,
      }, {
        onConflict: 'user_id,chapter_id,section_id,progress_type'
      });

    if (error) throw error;
    return data;
  },

  // Mark a video as watched
  async markVideoWatched(chapterId: number, videoId: number, studyTimeMinutes = 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        chapter_id: chapterId,
        video_id: videoId,
        progress_type: 'video_watched',
        study_time_minutes: studyTimeMinutes,
      }, {
        onConflict: 'user_id,video_id,progress_type'
      });

    if (error) throw error;
    return data;
  },

  // Get user's completed sections for a chapter
  async getCompletedSections(chapterId: number): Promise<number[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_progress')
      .select('section_id')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('progress_type', 'section_completed');

    if (error) {
      console.error('Error fetching completed sections:', error);
      return [];
    }

    return (data || []).map(item => item.section_id).filter(Boolean);
  },

  // Get user's watched videos for a chapter
  async getWatchedVideos(chapterId: number): Promise<number[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_progress')
      .select('video_id')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('progress_type', 'video_watched');

    if (error) {
      console.error('Error fetching watched videos:', error);
      return [];
    }

    return (data || []).map(item => item.video_id).filter(Boolean);
  },

  // Get overall user progress stats
  async getUserStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .select('chapter_id, progress_type, completed_at, study_time_minutes')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }

    const completedSections = data?.filter(p => p.progress_type === 'section_completed').length || 0;
    const watchedVideos = data?.filter(p => p.progress_type === 'video_watched').length || 0;
    const completedChapters = data?.filter(p => p.progress_type === 'chapter_completed').length || 0;
    const totalStudyTime = data?.reduce((sum, p) => sum + (p.study_time_minutes || 0), 0) || 0;

    return {
      completedSections,
      watchedVideos,
      completedChapters,
      totalStudyTime,
    };
  },

  // Calculate progress percentage for a specific chapter
  async getChapterProgress(chapterId: number): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Get completed sections for this chapter
    const { data: sectionProgress, error: sectionError } = await supabase
      .from('user_progress')
      .select('section_id')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('progress_type', 'section_completed');

    if (sectionError) {
      console.error('Error fetching section progress:', sectionError);
      return 0;
    }

    // Get watched videos for this chapter
    const { data: videoProgress, error: videoError } = await supabase
      .from('user_progress')
      .select('video_id')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('progress_type', 'video_watched');

    if (videoError) {
      console.error('Error fetching video progress:', videoError);
      return 0;
    }

    const completedSections = sectionProgress?.length || 0;
    const watchedVideos = videoProgress?.length || 0;

    // Each chapter has 7 sections and 3 videos (total 10 items)
    const totalItems = 10;
    const completedItems = completedSections + watchedVideos;
    
    return Math.round((completedItems / totalItems) * 100);
  },

  // Get progress for all chapters at once
  async getAllChaptersProgress(): Promise<Record<number, number>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('user_progress')
      .select('chapter_id, progress_type')
      .eq('user_id', user.id)
      .in('progress_type', ['section_completed', 'video_watched']);

    if (error) {
      console.error('Error fetching all chapters progress:', error);
      return {};
    }

    // Group progress by chapter
    const chapterProgress: Record<number, { sections: number; videos: number }> = {};
    
    data?.forEach(item => {
      if (!chapterProgress[item.chapter_id]) {
        chapterProgress[item.chapter_id] = { sections: 0, videos: 0 };
      }
      
      if (item.progress_type === 'section_completed') {
        chapterProgress[item.chapter_id].sections++;
      } else if (item.progress_type === 'video_watched') {
        chapterProgress[item.chapter_id].videos++;
      }
    });

    // Convert to percentages
    const progressPercentages: Record<number, number> = {};
    Object.entries(chapterProgress).forEach(([chapterId, progress]) => {
      const totalItems = 10; // 7 sections + 3 videos
      const completedItems = progress.sections + progress.videos;
      progressPercentages[parseInt(chapterId)] = Math.round((completedItems / totalItems) * 100);
    });

    return progressPercentages;
  }
};
