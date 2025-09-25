/**
 * Text File Processor - Alternative to PDF processing
 * Processes .txt files instead of corrupted PDFs
 */

import { localStorageRAG } from './localStorageRAG';
import { getImprovedContent } from './improvedPhysicsContent';

export interface TextFileInfo {
  filename: string;
  chapterId: string;
  chapterTitle: string;
  content: string;
}

class TextFileProcessor {
  private readonly chapterMapping = {
    'force-and-pressure': { filename: 'force-and-pressure.txt', title: 'Force and Pressure' },
    'friction': { filename: 'friction.txt', title: 'Friction' },
    'electric-current': { filename: 'electric-current.txt', title: 'Electric Current and Its Effects' },
    'motion': { filename: 'motion.txt', title: 'Motion' },
    'force-and-laws': { filename: 'force-and-laws.txt', title: 'Force and Laws of Motion' },
    'gravitation': { filename: 'gravitation.txt', title: 'Gravitation' },
    'light-reflection': { filename: 'light-reflection.txt', title: 'Light: Reflection and Refraction' },
    'electricity': { filename: 'electricity.txt', title: 'Electricity' },
    'magnetic-effects': { filename: 'magnetic-effects.txt', title: 'Magnetic Effects of Electric Current' },
    'work-and-energy': { filename: 'work-and-energy.txt', title: 'Work and Energy' }
  };

  /**
   * Load text content from public directory
   */
  async loadTextFile(chapterId: string): Promise<{ success: boolean; content: string; message: string }> {
    const fileInfo = this.chapterMapping[chapterId as keyof typeof this.chapterMapping];
    if (!fileInfo) {
      return { success: false, content: '', message: `Unknown chapter: ${chapterId}` };
    }

    try {
      console.log(`📄 Loading text file: ${fileInfo.filename}`);
      
      const response = await fetch(`/texts/${fileInfo.filename}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch text file: ${response.statusText}`);
      }

      const content = await response.text();
      
      if (!content || content.trim().length < 50) {
        throw new Error('Text file contains insufficient content');
      }

      return {
        success: true,
        content: content.trim(),
        message: `Successfully loaded ${fileInfo.filename}`
      };

    } catch (error) {
      console.warn(`Failed to load text file ${fileInfo.filename}:`, error);
      return {
        success: false,
        content: getImprovedContent(fileInfo.title),
        message: `Using fallback content for ${fileInfo.title}`
      };
    }
  }

  /**
   * Load all text files
   */
  async loadAllTextFiles(): Promise<{
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    results: Array<{ chapterId: string; success: boolean; message: string }>;
  }> {
    const results: Array<{ chapterId: string; success: boolean; message: string }> = [];
    let successfulFiles = 0;
    let failedFiles = 0;

    for (const chapterId of Object.keys(this.chapterMapping)) {
      const result = await this.loadTextFile(chapterId);
      results.push({ chapterId, ...result });
      
      if (result.success) {
        successfulFiles++;
        // Store the content in RAG system
        const chunks = this.splitTextIntoChunks(result.content);
        const fileInfo = this.chapterMapping[chapterId as keyof typeof this.chapterMapping];
        localStorageRAG.storeRAGData(chapterId, fileInfo.title, chunks);
      } else {
        failedFiles++;
        // Store fallback content
        const chunks = this.splitTextIntoChunks(result.content);
        const fileInfo = this.chapterMapping[chapterId as keyof typeof this.chapterMapping];
        localStorageRAG.storeRAGData(chapterId, fileInfo.title, chunks);
      }
    }

    return {
      totalFiles: Object.keys(this.chapterMapping).length,
      successfulFiles,
      failedFiles,
      results
    };
  }

  /**
   * Split text into chunks for better search
   */
  private splitTextIntoChunks(text: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if (currentChunk.length + trimmedSentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 50);
  }

  /**
   * Get all text file information
   */
  getAllTextFiles(): Array<{ chapterId: string; filename: string; title: string }> {
    return Object.entries(this.chapterMapping).map(([chapterId, info]) => ({
      chapterId,
      filename: info.filename,
      title: info.title
    }));
  }
}

// Export singleton instance
export const textFileProcessor = new TextFileProcessor();
