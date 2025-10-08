export interface ChapterData {
  id: string;
  title: string;
  content: string;
  sections: {
    title: string;
    content: string;
    pageNumber?: number;
  }[];
  lastUpdated: Date;
}

export interface StorageInfo {
  totalChapters: number;
  totalSize: number;
  chapters: {
    id: string;
    title: string;
    size: number;
    lastUpdated: Date;
  }[];
}

const STORAGE_PREFIX = 'physics_rag_';
const CHAPTERS_KEY = 'chapters_list';

export class LocalStorageRAG {
  private getChapterKey(chapterId: string): string {
    return `${STORAGE_PREFIX}chapter_${chapterId}`;
  }

  private getChapterList(): string[] {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${CHAPTERS_KEY}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveChapterList(chapters: string[]): void {
    localStorage.setItem(`${STORAGE_PREFIX}${CHAPTERS_KEY}`, JSON.stringify(chapters));
  }

  async saveChapterData(chapterId: string, data: ChapterData): Promise<boolean> {
    try {
      const chapterList = this.getChapterList();
      if (!chapterList.includes(chapterId)) {
        chapterList.push(chapterId);
        this.saveChapterList(chapterList);
      }

      localStorage.setItem(this.getChapterKey(chapterId), JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving chapter data:', error);
      return false;
    }
  }

  async getChapterData(chapterId: string): Promise<ChapterData | null> {
    try {
      const stored = localStorage.getItem(this.getChapterKey(chapterId));
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      return {
        ...data,
        lastUpdated: new Date(data.lastUpdated)
      };
    } catch (error) {
      console.error('Error getting chapter data:', error);
      return null;
    }
  }

  async deleteChapterData(chapterId: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.getChapterKey(chapterId));
      const chapterList = this.getChapterList();
      const updatedList = chapterList.filter(id => id !== chapterId);
      this.saveChapterList(updatedList);
      return true;
    } catch (error) {
      console.error('Error deleting chapter data:', error);
      return false;
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const chapterList = this.getChapterList();
      const chapters = [];

      for (const chapterId of chapterList) {
        const data = await this.getChapterData(chapterId);
        if (data) {
          chapters.push({
            id: chapterId,
            title: data.title,
            size: new Blob([data.content]).size,
            lastUpdated: data.lastUpdated
          });
        }
      }

      const totalSize = chapters.reduce((sum, chapter) => sum + chapter.size, 0);

      return {
        totalChapters: chapters.length,
        totalSize,
        chapters
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { totalChapters: 0, totalSize: 0, chapters: [] };
    }
  }

  async searchInChapter(chapterId: string, query: string): Promise<string[]> {
    try {
      const data = await this.getChapterData(chapterId);
      if (!data) return [];

      const results: string[] = [];
      const queryLower = query.toLowerCase();
      
      // Split query into keywords for better matching
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

      // Search in sections with improved matching
      for (const section of data.sections) {
        const sectionContent = section.content.toLowerCase();
        const sectionTitle = section.title.toLowerCase();
        
        // Exact phrase match (highest priority)
        if (sectionContent.includes(queryLower) || sectionTitle.includes(queryLower)) {
          results.push(`${section.content}`);
          continue;
        }
        
        // Check if any query words match in title or content
        const hasMatch = queryWords.some(word => 
          sectionTitle.includes(word) || sectionContent.includes(word)
        );
        
        if (hasMatch) {
          results.push(`${section.content}`);
        }
      }

      // Remove the fallback physics keyword search to prevent wrong chapter answers
      // This was causing friction questions to return force/pressure content

      // Remove duplicates
      return [...new Set(results)];
    } catch (error) {
      console.error('Error searching in chapter:', error);
      return [];
    }
  }

  async getAllChapters(): Promise<string[]> {
    return this.getChapterList();
  }

  async clearAllData(): Promise<boolean> {
    try {
      const chapterList = this.getChapterList();
      for (const chapterId of chapterList) {
        localStorage.removeItem(this.getChapterKey(chapterId));
      }
      localStorage.removeItem(`${STORAGE_PREFIX}${CHAPTERS_KEY}`);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

export const localStorageRAG = new LocalStorageRAG();
