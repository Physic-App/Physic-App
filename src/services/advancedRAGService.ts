// Advanced RAG Service combining embeddings and Groq API
import { embeddingService, EmbeddingVector } from './embeddingService';
import { groqService } from './groqService';
import { localStorageRAG } from './localStorageRAG';

export interface AdvancedRAGResult {
  content: string;
  sources: string[];
  confidence: number;
}

class AdvancedRAGService {
  private embeddingsCache: Map<string, EmbeddingVector[]> = new Map();

  // Process and cache embeddings for a chapter
  async processChapterEmbeddings(chapterId: string): Promise<void> {
    try {
      const chapterData = await localStorageRAG.getChapterData(chapterId);
      if (!chapterData) {
        console.warn(`No data found for chapter: ${chapterId}`);
        return;
      }

      // Combine all sections into one content string
      const fullContent = chapterData.sections
        .map(section => `## ${section.title}\n${section.content}`)
        .join('\n\n');

      const embeddings = await embeddingService.processChapterContent(chapterId, fullContent);
      this.embeddingsCache.set(chapterId, embeddings);
      
      console.log(`Processed ${embeddings.length} embeddings for chapter: ${chapterId}`);
    } catch (error) {
      console.error('Error processing chapter embeddings:', error);
    }
  }

  // Get relevant content using semantic search
  async getRelevantContent(
    query: string,
    chapterId: string,
    limit: number = 3
  ): Promise<string[]> {
    try {
      const embeddings = this.embeddingsCache.get(chapterId);
      if (!embeddings || embeddings.length === 0) {
        console.warn(`No embeddings found for chapter: ${chapterId}`);
        // Fallback to keyword search
        return await localStorageRAG.searchInChapter(chapterId, query);
      }

      const semanticResults = await embeddingService.searchSimilarContent(query, chapterId, embeddings);
      
      // Take top results up to the limit
      const topResults = semanticResults.slice(0, limit);
      
      if (topResults.length === 0) {
        // Fallback to keyword search if no semantic matches
        return await localStorageRAG.searchInChapter(chapterId, query);
      }

      return topResults.map(result => result.content);
    } catch (error) {
      console.error('Error getting relevant content:', error);
      // Fallback to keyword search
      return await localStorageRAG.searchInChapter(chapterId, query);
    }
  }

  // Generate enhanced response using Groq API
  async generateEnhancedResponse(
    query: string,
    chapterId: string,
    chapterTitle: string
  ): Promise<AdvancedRAGResult> {
    try {
      // Get relevant content using semantic search
      const relevantContent = await this.getRelevantContent(query, chapterId);
      
      if (!relevantContent || relevantContent.length === 0) {
        return {
          content: `🚫 **I can only answer questions related to ${chapterTitle} in this chat.**\n\nI couldn't find information about "${query}" in the **${chapterTitle}** chapter.\n\n**To ask about other topics:** Switch to the appropriate chapter in the sidebar first.`,
          sources: [],
          confidence: 0
        };
      }

      // Combine relevant content
      const context = relevantContent.join('\n\n');
      
      // Generate response using Groq API
      const response = await groqService.generateResponse(query, context, chapterTitle);
      
      return {
        content: `📖 From the textbook:\n\n${response}`,
        sources: relevantContent.map((_, index) => `Section ${index + 1}`),
        confidence: 0.9
      };
    } catch (error) {
      console.error('Error generating enhanced response:', error);
      
      // Fallback to simple keyword search
      const fallbackContent = await localStorageRAG.searchInChapter(chapterId, query);
      if (fallbackContent && fallbackContent.length > 0) {
        return {
          content: `📖 From the textbook:\n\n${fallbackContent.join('\n\n')}`,
          sources: ['Keyword Search'],
          confidence: 0.7
        };
      }

      return {
        content: `I apologize, but I'm having trouble generating a response right now. Please try again or rephrase your question.`,
        sources: [],
        confidence: 0
      };
    }
  }

  // Check if question is relevant to the chapter
  async checkRelevance(
    query: string,
    chapterId: string,
    chapterTitle: string
  ): Promise<{ isRelevant: boolean; suggestedChapter?: string }> {
    try {
      const availableChapters = await localStorageRAG.getAllChapters();
      const chapterNames = availableChapters.map(id => id.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '));

      return await groqService.checkTopicRelevance(query, chapterTitle, chapterNames);
    } catch (error) {
      console.error('Error checking relevance:', error);
      return { isRelevant: true }; // Default to relevant on error
    }
  }

  // Initialize embeddings for all loaded chapters
  async initializeEmbeddings(): Promise<void> {
    try {
      const chapters = await localStorageRAG.getAllChapters();
      console.log(`Initializing embeddings for ${chapters.length} chapters...`);
      
      for (const chapterId of chapters) {
        await this.processChapterEmbeddings(chapterId);
      }
      
      console.log('Embeddings initialization completed');
    } catch (error) {
      console.error('Error initializing embeddings:', error);
    }
  }

  // Clear embeddings cache
  clearCache(): void {
    this.embeddingsCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { chapterCount: number; totalEmbeddings: number } {
    let totalEmbeddings = 0;
    for (const embeddings of this.embeddingsCache.values()) {
      totalEmbeddings += embeddings.length;
    }
    
    return {
      chapterCount: this.embeddingsCache.size,
      totalEmbeddings
    };
  }
}

export const advancedRAGService = new AdvancedRAGService();
