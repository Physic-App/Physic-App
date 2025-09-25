/**
 * Local RAG Chat Hook - Uses browser storage instead of backend
 */

import { useState, useCallback } from 'react';
import { Message } from '../types/chatbot';
import { localStorageRAG } from '../services/localStorageRAG';
import { generateMockResponse, fallbackMessage } from '../data/mockData';

export interface UseLocalRAGChatOptions {
  chapterId: string;
  chapterTitle: string;
  useLocalStorage?: boolean;
}

export interface UseLocalRAGChatReturn {
  sendMessage: (
    question: string,
    conversationHistory?: Message[],
    sessionId?: string
  ) => Promise<{
    response: string;
    sessionId: string;
    isFromRAG: boolean;
    sources?: string[];
  }>;
  isLoading: boolean;
  error: string | null;
  hasChapterData: boolean;
}

export const useLocalRAGChat = (options: UseLocalRAGChatOptions): UseLocalRAGChatReturn => {
  const {
    chapterId,
    chapterTitle,
    useLocalStorage = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we have data for this chapter
  const hasChapterData = useLocalStorage ? 
    localStorageRAG.getChapterRAGData(chapterId) !== null : 
    false;

  const sendMessage = useCallback(async (
    question: string,
    conversationHistory: Message[] = [],
    sessionId?: string
  ): Promise<{
    response: string;
    sessionId: string;
    isFromRAG: boolean;
    sources?: string[];
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      if (useLocalStorage && hasChapterData) {
        // Search for relevant content in local storage
        const relevantContent = localStorageRAG.searchContent(chapterId, question, 3);
        
        if (relevantContent.length > 0) {
          // Generate response based on found content
          const response = await generateRAGResponse(question, relevantContent, chapterTitle);
          
          return {
            response,
            sessionId: sessionId || `local_${Date.now()}`,
            isFromRAG: true,
            sources: relevantContent,
          };
        }
      }

      // Fallback to mock data
      const mockResponse = generateMockResponse(question, chapterId);
      return {
        response: mockResponse,
        sessionId: sessionId || `mock_${Date.now()}`,
        isFromRAG: false,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      console.error('Local RAG Chat Error:', err);

      // Final fallback
      return {
        response: fallbackMessage,
        sessionId: sessionId || `error_${Date.now()}`,
        isFromRAG: false,
      };
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, chapterTitle, useLocalStorage, hasChapterData]);

  return {
    sendMessage,
    isLoading,
    error,
    hasChapterData,
  };
};

/**
 * Generate RAG response from local content
 */
async function generateRAGResponse(
  question: string,
  relevantContent: string[],
  chapterTitle: string
): Promise<string> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  if (relevantContent.length === 0) {
    return `I don't have specific information about "${question}" in my ${chapterTitle} knowledge base. Please ask questions related to ${chapterTitle} topics.`;
  }

  // Combine all relevant content
  const contextText = relevantContent.join('\n\n');
  
  // Generate comprehensive response
  const response = generateContextualResponse(question, contextText, chapterTitle);
  
  // Add source indicator
  return `**From your ${chapterTitle} textbook:**\n\n${response}`;
}

/**
 * Generate contextual response from content
 */
function generateContextualResponse(question: string, context: string, chapterTitle: string): string {
  const questionLower = question.toLowerCase();
  
  // Extract relevant sentences from context
  const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const relevantSentences: string[] = [];
  
  // Find sentences that might answer the question
  const questionWords = questionLower.split(' ').filter(word => word.length > 3);
  
  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    let relevanceScore = 0;
    
    questionWords.forEach(word => {
      if (sentenceLower.includes(word)) {
        relevanceScore++;
      }
    });
    
    if (relevanceScore > 0) {
      relevantSentences.push(sentence.trim());
    }
  });

  if (relevantSentences.length > 0) {
    // Return comprehensive response with multiple relevant sentences
    let response = relevantSentences.slice(0, 5).join('. ') + '.';
    
    // Clean up the response
    response = response.replace(/\s+/g, ' ').trim();
    
    // Add some structure if it's a definition question
    if (questionLower.includes('what is') || questionLower.includes('define')) {
      const definition = relevantSentences[0];
      const details = relevantSentences.slice(1, 4).join('. ');
      response = `${definition}.\n\n**Key points:**\n${details}.`;
    }
    
    return response;
  }

  // If no specific match, return comprehensive content from the context
  const bestSentences = sentences.slice(0, 4).join('. ');
  return bestSentences + (bestSentences.endsWith('.') ? '' : '.') + 
         `\n\nFor more specific information about ${chapterTitle}, please ask a more detailed question.`;
}
