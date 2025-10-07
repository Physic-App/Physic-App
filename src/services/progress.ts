import { supabase } from './supabase';
import { activityService } from './activity';

// Local storage fallback for progress tracking
const LOCAL_PROGRESS_KEY = 'physicsflow_local_progress';

interface LocalProgress {
  sections: Record<string, number[]>; // chapterId -> sectionIds[]
  videos: Record<string, number[]>; // chapterId -> videoIds[]
}

const getLocalProgress = (): LocalProgress => {
  try {
    const stored = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return stored ? JSON.parse(stored) : { sections: {}, videos: {} };
  } catch {
    return { sections: {}, videos: {} };
  }
};

const saveLocalProgress = (progress: LocalProgress) => {
  try {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress to local storage:', error);
  }
};

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
<<<<<<< HEAD
      if (!user) {
        console.warn('⚠️ User not authenticated, progress not saved');
        return null;
      }

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
=======
      if (!user) throw new Error('User not authenticated');
    } catch (error) {
      // Supabase not available, return mock data
      return [];
    }

>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

      if (error) {
        console.error('❌ Error marking section completed:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('⚠️ Supabase not available, saving to local storage:', error);
      
      // Fallback to local storage
      const progress = getLocalProgress();
      const chapterKey = chapterId.toString();
      
      if (!progress.sections[chapterKey]) {
        progress.sections[chapterKey] = [];
      }
      
      if (!progress.sections[chapterKey].includes(sectionId)) {
        progress.sections[chapterKey].push(sectionId);
        saveLocalProgress(progress);
      }
      
      return null;
    }
    
    
    // Also log this activity for streak tracking
    try {
      await activityService.logSectionCompleted(studyTimeMinutes);
    } catch (activityError) {
      console.warn('⚠️ Failed to log section activity:', activityError);
      // Don't throw - progress tracking should still work even if activity logging fails
    }
  },

  // Mark a video as watched
  async markVideoWatched(chapterId: number, videoId: number, studyTimeMinutes = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ User not authenticated, progress not saved');
        return null;
      }

<<<<<<< HEAD
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
=======
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

      if (error) {
        console.error('❌ Error marking video watched:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('⚠️ Supabase not available, saving to local storage:', error);
      
      // Fallback to local storage
      const progress = getLocalProgress();
      const chapterKey = chapterId.toString();
      
      if (!progress.videos[chapterKey]) {
        progress.videos[chapterKey] = [];
      }
      
      if (!progress.videos[chapterKey].includes(videoId)) {
        progress.videos[chapterKey].push(videoId);
        saveLocalProgress(progress);
      }
      
      return null;
    }
    
    
    // Also log this activity for streak tracking
    try {
      await activityService.logVideoWatched(studyTimeMinutes);
    } catch (activityError) {
      console.warn('⚠️ Failed to log video activity:', activityError);
      // Don't throw - progress tracking should still work even if activity logging fails
    }
  },

  // Get user's completed sections for a chapter
  async getCompletedSections(chapterId: number): Promise<number[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
    } catch (error) {
      console.warn('⚠️ Supabase not available, checking local storage');
      const progress = getLocalProgress();
      return progress.sections[chapterId.toString()] || [];
    }

    try {
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
    } catch (error) {
      console.warn('⚠️ Error fetching completed sections:', error);
      return [];
    }
  },

  // Get user's watched videos for a chapter
  async getWatchedVideos(chapterId: number): Promise<number[]> {
    try {
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
    } catch (error) {
      console.warn('⚠️ Error fetching watched videos, checking local storage:', error);
      const progress = getLocalProgress();
      return progress.videos[chapterId.toString()] || [];
    }
  },

  // Get overall user progress stats
  async getUserStats() {
    let user;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;
      user = authUser;
    } catch (error) {
      // Supabase not available, return mock data
      return {
        totalSectionsCompleted: 0,
        totalVideosWatched: 0,
        totalStudyTimeMinutes: 0,
        chaptersCompleted: 0
      };
    }

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
    let user;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return {};
      user = authUser;
    } catch (error) {
      // Supabase not available, return empty object
      return {};
    }

    // Get all chapters to know which ones exist
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id')
      .gte('id', 1)
      .lte('id', 10)
      .order('id');

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return {};
    }

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

    // Convert to percentages - each chapter has exactly 7 topics + 3 videos = 10 total items
    const progressPercentages: Record<number, number> = {};
    
    // Initialize all chapters with 0% progress
    chapters?.forEach(chapter => {
      progressPercentages[chapter.id] = 0;
    });
    
    // Calculate actual progress for chapters with data
    Object.entries(chapterProgress).forEach(([chapterId, progress]) => {
      const totalItems = 10; // 7 sections + 3 videos (confirmed from your database)
      const completedItems = progress.sections + progress.videos;
      const percentage = Math.round((completedItems / totalItems) * 100);
      progressPercentages[parseInt(chapterId)] = Math.min(percentage, 100); // Cap at 100%
    });

    return progressPercentages;
  }
};
