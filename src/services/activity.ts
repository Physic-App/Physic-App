import { supabase } from './supabase';

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string; // YYYY-MM-DD format
  sections_completed: number;
  videos_watched: number;
  total_study_minutes: number;
  first_activity_at: string;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export const activityService = {
  // Get today's date in YYYY-MM-DD format (user's local timezone)
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Log a section completion activity
  async logSectionCompleted(studyTimeMinutes = 5) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const today = this.getTodayDate();

    try {
      const { data, error } = await supabase
        .from('daily_activity')
        .upsert({
          user_id: user.id,
          activity_date: today,
          sections_completed: 1, // Will be incremented by database
          videos_watched: 0,
          total_study_minutes: studyTimeMinutes,
          last_activity_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,activity_date',
          // When conflict (same user, same date), increment the counters
          ignoreDuplicates: false
        });

      if (error) throw error;

      // If record already exists for today, we need to increment the counters manually
      // because upsert doesn't auto-increment, it replaces
      await this.incrementActivityCounters(user.id, today, 'section', studyTimeMinutes);
      
      return data;
    } catch (error) {
      console.error('❌ Error logging section activity:', error);
      throw error;
    }
  },

  // Log a video watched activity
  async logVideoWatched(studyTimeMinutes = 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const today = this.getTodayDate();

    try {
      // Same approach as section - increment counters properly
      await this.incrementActivityCounters(user.id, today, 'video', studyTimeMinutes);
      
    } catch (error) {
      console.error('❌ Error logging video activity:', error);
      throw error;
    }
  },

  // Helper function to properly increment activity counters
  async incrementActivityCounters(userId: string, date: string, type: 'section' | 'video', studyMinutes: number) {
    const now = new Date().toISOString();

    if (type === 'section') {
      // Increment sections_completed and add study time
      const { error } = await supabase.rpc('increment_daily_activity', {
        p_user_id: userId,
        p_activity_date: date,
        p_sections_increment: 1,
        p_videos_increment: 0,
        p_study_minutes: studyMinutes,
        p_last_activity: now
      });

      if (error) {
        // If RPC doesn't exist, fall back to manual upsert
        await this.manualUpsertActivity(userId, date, 1, 0, studyMinutes, now);
      }
    } else if (type === 'video') {
      // Increment videos_watched and add study time
      const { error } = await supabase.rpc('increment_daily_activity', {
        p_user_id: userId,
        p_activity_date: date,
        p_sections_increment: 0,
        p_videos_increment: 1,
        p_study_minutes: studyMinutes,
        p_last_activity: now
      });

      if (error) {
        // If RPC doesn't exist, fall back to manual upsert
        await this.manualUpsertActivity(userId, date, 0, 1, studyMinutes, now);
      }
    }
  },

  // Manual upsert when RPC is not available
  async manualUpsertActivity(userId: string, date: string, sectionIncrement: number, videoIncrement: number, studyMinutes: number, timestamp: string) {
    // First, try to get existing record
    const { data: existing, error: selectError } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', date)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      // Update existing record by incrementing values
      const { error: updateError } = await supabase
        .from('daily_activity')
        .update({
          sections_completed: existing.sections_completed + sectionIncrement,
          videos_watched: existing.videos_watched + videoIncrement,
          total_study_minutes: existing.total_study_minutes + studyMinutes,
          last_activity_at: timestamp,
          updated_at: timestamp,
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('daily_activity')
        .insert({
          user_id: userId,
          activity_date: date,
          sections_completed: sectionIncrement,
          videos_watched: videoIncrement,
          total_study_minutes: studyMinutes,
          first_activity_at: timestamp,
          last_activity_at: timestamp,
        });

      if (insertError) throw insertError;
    }
  },

  // Get user's activity for a specific date
  async getActivityForDate(date: string): Promise<DailyActivity | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', user.id)
      .eq('activity_date', date)
      .maybeSingle();

    if (error) {
      console.error('Error fetching activity for date:', error);
      return null;
    }

    return data;
  },

  // Get user's recent activity (for streak calculation)
  async getRecentActivity(days = 30): Promise<DailyActivity[]> {
    let user;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return [];
      user = authUser;
    } catch (error) {
      // Supabase not available, return empty array
      return [];
    }

    const { data, error } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .limit(days);

    if (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }

    return data || [];
  },

  // Calculate current streak based on daily activity
  async calculateCurrentStreak(): Promise<number> {
    let user;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return 0;
      user = authUser;
    } catch (error) {
      // Supabase not available, return 0
      return 0;
    }


    try {
      // Get recent activity ordered by date (most recent first)
      const activities = await this.getRecentActivity(60); // Check last 60 days max
      
      if (activities.length === 0) {
        return 0;
      }


      const today = this.getTodayDate();
      const yesterday = this.getDateDaysAgo(1);
      
      let streak = 0;
      let currentCheckDate = today;
      
      // Convert activities to a map for easy lookup
      const activityMap = new Map<string, DailyActivity>();
      activities.forEach(activity => {
        activityMap.set(activity.activity_date, activity);
      });

      // Check if user was active today or yesterday (to handle different timezones/late night studying)
      const todayActivity = activityMap.get(today);
      const yesterdayActivity = activityMap.get(yesterday);
      
      if (!todayActivity && !yesterdayActivity) {
        return 0;
      }

      // Start counting from today if active today, otherwise from yesterday
      if (todayActivity) {
        currentCheckDate = today;
      } else if (yesterdayActivity) {
        currentCheckDate = yesterday;
      }

      // Count consecutive days with activity
      while (currentCheckDate) {
        const activity = activityMap.get(currentCheckDate);
        
        if (activity && this.hasValidActivity(activity)) {
          streak++;
          
          // Move to previous day
          currentCheckDate = this.getDateDaysAgo(this.getDaysFromToday(currentCheckDate) + 1);
        } else {
          break;
        }

        // Safety check to prevent infinite loops
        if (streak > 365) {
          break;
        }
      }

      return streak;

    } catch (error) {
      console.error('❌ Error calculating streak:', error);
      return 0;
    }
  },

  // Helper: Check if an activity counts towards streak
  hasValidActivity(activity: DailyActivity): boolean {
    // Activity counts if user completed at least 1 section OR watched at least 1 video
    return (activity.sections_completed > 0) || (activity.videos_watched > 0);
  },

  // Helper: Get date N days ago in YYYY-MM-DD format
  getDateDaysAgo(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  // Helper: Get number of days from today for a given date string
  getDaysFromToday(dateString: string): number {
    const today = new Date();
    const targetDate = new Date(dateString);
    
    // Reset time to avoid timezone issues
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  // Get streak stats for display
  async getStreakStats() {
    const currentStreak = await this.calculateCurrentStreak();
    const recentActivity = await this.getRecentActivity(7); // Last 7 days
    
    const todayActivity = recentActivity.find(a => a.activity_date === this.getTodayDate());
    const isActiveToday = todayActivity ? this.hasValidActivity(todayActivity) : false;
    
    return {
      currentStreak,
      isActiveToday,
      todayActivity: todayActivity || null,
      recentDays: recentActivity.length,
    };
  },

  // Calculate study time per chapter from user progress
  async getStudyTimePerChapter(): Promise<Record<number, number>> {
    let user;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return {};
      user = authUser;
    } catch (error) {
      // Supabase not available, return empty object
      return {};
    }


    try {
      // Get all user progress with study time
      const { data: progressData, error } = await supabase
        .from('user_progress')
        .select('chapter_id, study_time_minutes')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error fetching progress data:', error);
        return {};
      }

      if (!progressData || progressData.length === 0) {
        return {};
      }

      // Group study time by chapter
      const chapterStudyTime: Record<number, number> = {};
      
      progressData.forEach(item => {
        const chapterId = Number(item.chapter_id);
        const studyMinutes = Number(item.study_time_minutes || 0);
        
        if (!chapterStudyTime[chapterId]) {
          chapterStudyTime[chapterId] = 0;
        }
        chapterStudyTime[chapterId] += studyMinutes;
      });

      return chapterStudyTime;

    } catch (error) {
      console.error('❌ Error calculating study time per chapter:', error);
      return {};
    }
  },

  // Format minutes into hours and minutes display
  formatStudyTime(totalMinutes: number): string {
    if (totalMinutes === 0) return '0h';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  },

  // Get total study time across all chapters
  async getTotalStudyTime(): Promise<number> {
    const studyTimePerChapter = await this.getStudyTimePerChapter();
    const totalMinutes = Object.values(studyTimePerChapter).reduce((sum, minutes) => sum + minutes, 0);
    
    return totalMinutes;
  }
};
