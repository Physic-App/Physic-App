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
=======
/**
 * Local Storage RAG Service
 * Stores RAG data temporarily in browser instead of database
 */

export interface LocalRAGData {
  chapterId: string;
  chapterTitle: string;
  content: string[];
  processedAt: string;
}

export interface LocalChatSession {
  id: string;
  chapterId: string;
  title: string;
  messages: Array<{
    id: string;
    content: string;
    isBot: boolean;
    timestamp: string;
  }>;
  createdAt: string;
  lastActivity: string;
}

class LocalStorageRAGService {
  private readonly RAG_DATA_KEY = 'physics_rag_data';
  private readonly CHAT_SESSIONS_KEY = 'physics_chat_sessions';
  private readonly BOOKMARKS_KEY = 'physics_bookmarks';

  /**
   * Store processed PDF content in browser localStorage
   */
  storeRAGData(chapterId: string, chapterTitle: string, content: string[]): void {
    try {
      const existingData = this.getAllRAGData();
      const newData: LocalRAGData = {
        chapterId,
        chapterTitle,
        content,
        processedAt: new Date().toISOString(),
      };

      existingData[chapterId] = newData;
      localStorage.setItem(this.RAG_DATA_KEY, JSON.stringify(existingData));
      
      console.log(`✅ Stored RAG data for chapter: ${chapterTitle}`);
    } catch (error) {
      console.error('Error storing RAG data:', error);
    }
  }

  /**
   * Get all stored RAG data
   */
  getAllRAGData(): Record<string, LocalRAGData> {
    try {
      const data = localStorage.getItem(this.RAG_DATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting RAG data:', error);
      return {};
    }
  }

  /**
   * Get RAG data for specific chapter
   */
  getChapterRAGData(chapterId: string): LocalRAGData | null {
    const allData = this.getAllRAGData();
    return allData[chapterId] || null;
  }

  /**
   * Search for relevant content in stored data
   */
  searchContent(chapterId: string, query: string, maxResults: number = 5): string[] {
    const chapterData = this.getChapterRAGData(chapterId);
    if (!chapterData) return [];

    const queryLower = query.toLowerCase();
    const relevantChunks: Array<{ content: string; score: number }> = [];

    // Simple text matching - you can make this more sophisticated later
    chapterData.content.forEach(chunk => {
      const chunkLower = chunk.toLowerCase();
      let score = 0;

      // Count matching words
      const queryWords = queryLower.split(' ').filter(word => word.length > 2);
      queryWords.forEach(word => {
        if (chunkLower.includes(word)) {
          score += 1;
        }
      });

      if (score > 0) {
        relevantChunks.push({ content: chunk, score });
      }
    });

    // Sort by relevance and return top results
    return relevantChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.content);
  }

  /**
   * Store chat session in browser
   */
  storeChatSession(session: LocalChatSession): void {
    try {
      const sessions = this.getAllChatSessions();
      sessions[session.id] = session;
      localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error storing chat session:', error);
    }
  }

  /**
   * Get all chat sessions
   */
  getAllChatSessions(): Record<string, LocalChatSession> {
    try {
      const data = localStorage.getItem(this.CHAT_SESSIONS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return {};
    }
  }

  /**
   * Get chat sessions for specific chapter
   */
  getChapterSessions(chapterId: string): LocalChatSession[] {
    const allSessions = this.getAllChatSessions();
    return Object.values(allSessions)
      .filter(session => session.chapterId === chapterId)
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  /**
   * Get specific chat session
   */
  getChatSession(sessionId: string): LocalChatSession | null {
    const sessions = this.getAllChatSessions();
    return sessions[sessionId] || null;
  }

  /**
   * Delete chat session
   */
  deleteChatSession(sessionId: string): void {
    try {
      const sessions = this.getAllChatSessions();
      delete sessions[sessionId];
      localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  }

  /**
   * Store bookmarked messages
   */
  storeBookmark(messageId: string, content: string, chapterId: string): void {
    try {
      const bookmarks = this.getAllBookmarks();
      bookmarks[messageId] = {
        id: messageId,
        content,
        chapterId,
        bookmarkedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error storing bookmark:', error);
    }
  }

  /**
   * Get all bookmarks
   */
  getAllBookmarks(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.BOOKMARKS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return {};
    }
  }

  /**
   * Remove bookmark
   */
  removeBookmark(messageId: string): void {
    try {
      const bookmarks = this.getAllBookmarks();
      delete bookmarks[messageId];
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }

  /**
   * Clear all stored data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(this.RAG_DATA_KEY);
    localStorage.removeItem(this.CHAT_SESSIONS_KEY);
    localStorage.removeItem(this.BOOKMARKS_KEY);
    console.log('✅ Cleared all local RAG data');
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): {
    ragDataSize: number;
    chatSessionsSize: number;
    bookmarksSize: number;
    totalSize: number;
    availableChapters: string[];
  } {
    const ragData = localStorage.getItem(this.RAG_DATA_KEY) || '';
    const chatSessions = localStorage.getItem(this.CHAT_SESSIONS_KEY) || '';
    const bookmarks = localStorage.getItem(this.BOOKMARKS_KEY) || '';

    const ragDataSize = new Blob([ragData]).size;
    const chatSessionsSize = new Blob([chatSessions]).size;
    const bookmarksSize = new Blob([bookmarks]).size;

    const availableChapters = Object.keys(this.getAllRAGData());

    return {
      ragDataSize,
      chatSessionsSize,
      bookmarksSize,
      totalSize: ragDataSize + chatSessionsSize + bookmarksSize,
      availableChapters,
    };
  }
}

// Export singleton instance
export const localStorageRAG = new LocalStorageRAGService();

// Export individual functions for convenience
export const {
  storeRAGData,
  getAllRAGData,
  getChapterRAGData,
  searchContent,
  storeChatSession,
  getAllChatSessions,
  getChapterSessions,
  getChatSession,
  deleteChatSession,
  storeBookmark,
  getAllBookmarks,
  removeBookmark,
  clearAllData,
  getStorageInfo,
} = localStorageRAG;
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
