<<<<<<< HEAD
import { useState, useCallback } from 'react';
import { localStorageRAG } from '../services/localStorageRAG';
import { browserPDFProcessor } from '../services/browserPDFProcessor';
import { advancedRAGService } from '../services/advancedRAGService';

export interface RAGMessage {
  content: string;
  isBot: boolean;
  timestamp: Date;
  sources?: string[];
}

export interface UseLocalRAGChatReturn {
  isLoading: boolean;
  error: string | null;
  hasChapterData: boolean;
  sendMessage: (message: string, chapterId: string, chapterTitle: string) => Promise<RAGMessage>;
  loadSampleData: () => Promise<void>;
  uploadPDFs: (files: File[]) => Promise<void>;
  getStorageInfo: () => Promise<any>;
}

export function useLocalRAGChat(): UseLocalRAGChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChapterData, setHasChapterData] = useState(false);

  const generateRAGResponse = async (message: string, chapterId: string): Promise<string> => {
    try {
      // Validate input parameters
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return `❌ Please enter a valid question.`;
      }
      
      if (!chapterId || typeof chapterId !== 'string') {
        return `❌ Invalid chapter selection. Please select a chapter from the sidebar.`;
      }

      // Get chapter data first to ensure content is loaded
      const chapterData = await localStorageRAG.getChapterData(chapterId);
      if (!chapterData) {
        return `⚠️ No textbook content is loaded yet. Please click "Load Sample Data" to load the physics textbook first.`;
      }

      // First, check if the question is about a different chapter BEFORE searching
      const messageLower = message.toLowerCase();
      const availableChapters = await localStorageRAG.getAllChapters();
      
          // If no chapters are loaded, still check for topic mismatches
          const allPossibleChapters = ['motion', 'friction', 'force-and-pressure', 'electric-current', 'electricity', 'force-and-laws', 'light-reflection', 'gravitation', 'magnetic-effects'];
      
      // Comprehensive topic detection for all chapters (using correct chapter IDs)
      const topicToChapter = {
        // Motion topics
        'motion': 'motion',
        'speed': 'motion', 
        'velocity': 'motion',
        'acceleration': 'motion',
        'displacement': 'motion',
        'distance': 'motion',
        'uniform': 'motion',
        'non-uniform': 'motion',
        'retardation': 'motion',
        'deceleration': 'motion',
        
        // Force and Pressure topics
        'force': 'force-and-pressure',
        'pressure': 'force-and-pressure',
        'atmospheric': 'force-and-pressure',
        'pascal': 'force-and-pressure',
        'hydraulic': 'force-and-pressure',
        'buoyant': 'force-and-pressure',
        'thrust': 'force-and-pressure',
        
        // Friction topics
        'friction': 'friction',
        'static': 'friction',
        'kinetic': 'friction',
        'rolling': 'friction',
        'coefficient': 'friction',
        'frictional': 'friction',
        'roughness': 'friction',
        'lubricant': 'friction',
        
        // Electricity topics (electricity chapter)
        'electricity': 'electricity',
        'electric': 'electricity',
        'charge': 'electricity',
        'potential': 'electricity',
        'coulomb': 'electricity',
        'electrostatic': 'electricity',
        'capacitor': 'electricity',
        
        // Electric Current topics (electric-current chapter)
        'current': 'electric-current',
        'voltage': 'electric-current',
        'resistance': 'electric-current',
        'circuit': 'electric-current',
        'ampere': 'electric-current',
        'heating': 'electric-current',
        
        // Magnetic Effects topics (magnetic-effects chapter)
        'magnetic': 'magnetic-effects',
        'electromagnet': 'magnetic-effects',
        'motor': 'magnetic-effects',
        'generator': 'magnetic-effects',
        'transformer': 'magnetic-effects',
        'oersted': 'magnetic-effects',
        'faraday': 'magnetic-effects',
        'lenz': 'magnetic-effects',
        'induction': 'magnetic-effects',
        'electromagnetic': 'magnetic-effects',
        'armature': 'magnetic-effects',
        'commutator': 'magnetic-effects',
        
        // Force and Laws of Motion topics
        'newton': 'force-and-laws',
        'inertia': 'force-and-laws',
        'momentum': 'force-and-laws',
        'laws': 'force-and-laws',
        'action': 'force-and-laws',
        'reaction': 'force-and-laws',
        
        // Light topics
        'light': 'light-reflection',
        'reflection': 'light-reflection',
        'refraction': 'light-reflection',
        'mirror': 'light-reflection',
        'lens': 'light-reflection',
        'optics': 'light-reflection',
        'concave': 'light-reflection',
        'convex': 'light-reflection',
        'focal': 'light-reflection',
        'image': 'light-reflection',
        
        // Gravitation topics
        'gravity': 'gravitation',
        'gravitation': 'gravitation',
        'gravitational': 'gravitation',
        'weight': 'gravitation',
        'mass': 'gravitation',
        'g-force': 'gravitation',
        'free-fall': 'gravitation',
        'orbit': 'gravitation',
        'satellite': 'gravitation'
      };
      
      // Find which chapter the question might belong to
      let suggestedChapter = null;
      
      // Check all topics to find the correct chapter - STRICT DETECTION
      for (const [topic, chapter] of Object.entries(topicToChapter)) {
        // Check for exact word matches and common question patterns
        const exactMatch = new RegExp(`\\b${topic}\\b`, 'i').test(messageLower);
        const questionPatterns = [
          `what is ${topic}`,
          `what are ${topic}`,
          `explain ${topic}`,
          `define ${topic}`,
          `tell me about ${topic}`,
          `how does ${topic}`,
          `why does ${topic}`,
          `${topic} is`,
          `${topic} are`
        ];
        
        const hasQuestionPattern = questionPatterns.some(pattern => 
          messageLower.includes(pattern.toLowerCase())
        );
        
        if (exactMatch || hasQuestionPattern) {
          // Debug log
          console.log(`🔍 Found topic "${topic}" in message "${messageLower}" - belongs to chapter "${chapter}", current chapter: "${chapterId}"`);
          
          // Use allPossibleChapters if availableChapters is empty, otherwise use availableChapters
          const chaptersToCheck = availableChapters.length > 0 ? availableChapters : allPossibleChapters;
          if (chaptersToCheck.includes(chapter) && chapter !== chapterId) {
            suggestedChapter = chapter;
            console.log(`✅ Will reject - topic belongs to different chapter`);
            break;
          } else {
            console.log(`❌ Topic found but same chapter or not available`);
          }
        }
      }
      
      if (suggestedChapter) {
        const chapterTitle = suggestedChapter.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return `🚫 **This question is not related to ${chapterData.title} topic.**\n\nYour question about "${message}" belongs to the **${chapterTitle}** chapter.\n\n**To ask about other topics:**\n1. Switch to the **${chapterTitle}** chapter in the sidebar\n2. Then ask your question in that chapter's chat\n\n**In this ${chapterData.title} chat, I can only help with:**\n${chapterData.sections.map(s => `• ${s.title}`).join('\n')}`;
      }

      // Use advanced RAG service for enhanced response generation
      try {
        const advancedResult = await advancedRAGService.generateEnhancedResponse(message, chapterId, chapterData.title);
        
        if (advancedResult.confidence > 0) {
          return advancedResult.content;
        } else {
          // Fallback to basic search if advanced service fails
          const searchResults = await localStorageRAG.searchInChapter(chapterId, message);
          
          if (!searchResults || searchResults.length === 0) {
            return `🚫 **I can only answer questions related to ${chapterData.title} in this chat.**\n\nI couldn't find information about "${message}" in the **${chapterData.title}** chapter.\n\n**In this chat, I can only help with:**\n${chapterData.sections.map(s => `• ${s.title}`).join('\n')}\n\n**To ask about other topics:** Switch to the appropriate chapter in the sidebar first.`;
          }

          const relevantContent = searchResults.join('\n\n');
          return `📖 From the textbook:\n\n${relevantContent}`;
        }
      } catch (advancedError) {
        console.error('Advanced RAG failed, falling back to basic search:', advancedError);
        
        // Fallback to basic keyword search
        const searchResults = await localStorageRAG.searchInChapter(chapterId, message);
        
        if (!searchResults || searchResults.length === 0) {
          return `🚫 **I can only answer questions related to ${chapterData.title} in this chat.**\n\nI couldn't find information about "${message}" in the **${chapterData.title}** chapter.\n\n**In this chat, I can only help with:**\n${chapterData.sections.map(s => `• ${s.title}`).join('\n')}\n\n**To ask about other topics:** Switch to the appropriate chapter in the sidebar first.`;
        }

        const relevantContent = searchResults.join('\n\n');
        return `📖 From the textbook:\n\n${relevantContent}`;
      }
    } catch (error) {
      console.error('Error generating RAG response:', error);
      return `I encountered an error while searching the textbook. Please try again.`;
    }
  };

  const generateContextualResponse = (question: string, content: string, chapterId: string): string => {
    const questionLower = question.toLowerCase();
    
    // Extract key terms from the question
    const keyTerms = extractKeyTerms(question);
    
    // Find the most relevant section
    const relevantSection = findMostRelevantSection(content, keyTerms);
    
    // Generate response based on question type
    if (isDefinitionQuestion(questionLower)) {
      return generateDefinitionResponse(relevantSection, keyTerms);
    } else if (isFormulaQuestion(questionLower)) {
      return generateFormulaResponse(relevantSection, keyTerms);
    } else if (isExplanationQuestion(questionLower)) {
      return generateExplanationResponse(relevantSection, keyTerms);
    } else {
      return generateGeneralResponse(relevantSection, keyTerms, chapterId);
    }
  };

  const extractKeyTerms = (question: string): string[] => {
    const physicsTerms = [
      'force', 'mass', 'acceleration', 'velocity', 'speed', 'displacement',
      'energy', 'work', 'power', 'momentum', 'friction', 'gravity',
      'electricity', 'current', 'voltage', 'resistance', 'magnetic',
      'wave', 'frequency', 'wavelength', 'amplitude', 'oscillation',
      'thermodynamics', 'heat', 'temperature', 'entropy', 'pressure',
      'light', 'reflection', 'refraction', 'lens', 'mirror'
    ];
    
    return physicsTerms.filter(term => 
      question.toLowerCase().includes(term)
    );
  };

  const findMostRelevantSection = (content: string, keyTerms: string[]): string => {
    const sections = content.split('\n\n');
    let bestSection = sections[0];
    let maxMatches = 0;
    
    for (const section of sections) {
      const matches = keyTerms.reduce((count, term) => {
        return count + (section.toLowerCase().includes(term) ? 1 : 0);
      }, 0);
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestSection = section;
      }
    }
    
    return bestSection;
  };

  const isDefinitionQuestion = (question: string): boolean => {
    return question.includes('what is') || question.includes('define') || 
           question.includes('definition') || question.includes('meaning');
  };

  const isFormulaQuestion = (question: string): boolean => {
    return question.includes('formula') || question.includes('equation') || 
           question.includes('calculate') || question.includes('how to find');
  };

  const isExplanationQuestion = (question: string): boolean => {
    return question.includes('why') || question.includes('how does') || 
           question.includes('explain') || question.includes('describe');
  };

  const generateDefinitionResponse = (content: string, keyTerms: string[]): string => {
    // Return ONLY the textbook content, nothing else
    return `📖 **From the textbook:**\n\n${content}`;
  };

  const generateFormulaResponse = (content: string, keyTerms: string[]): string => {
    // Return ONLY the textbook content, nothing else
    return `📖 **From the textbook:**\n\n${content}`;
  };

  const generateExplanationResponse = (content: string, keyTerms: string[]): string => {
    // Return ONLY the textbook content, nothing else
    return `📖 **From the textbook:**\n\n${content}`;
  };

  const generateGeneralResponse = (content: string, keyTerms: string[], chapterId: string): string => {
    // Return ONLY the textbook content, nothing else
    return `📖 **From the textbook:**\n\n${content}`;
  };

  const sendMessage = useCallback(async (message: string, chapterId: string, chapterTitle: string): Promise<RAGMessage> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if chapter data exists
      const chapterData = await localStorageRAG.getChapterData(chapterId);
      if (!chapterData) {
        return {
          content: `No textbook content is loaded for **${chapterTitle}** yet. Please upload PDFs or load sample data first.`,
          isBot: true,
          timestamp: new Date()
        };
      }

      // Generate RAG response
      const response = await generateRAGResponse(message, chapterId);
      
      return {
        content: response,
        isBot: true,
        timestamp: new Date(),
        sources: [`${chapterTitle} Chapter`]
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      return {
        content: `I encountered an error: ${errorMessage}. Please try again.`,
        isBot: true,
        timestamp: new Date()
=======
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
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
      };
    } finally {
      setIsLoading(false);
    }
<<<<<<< HEAD
  }, []);

  const loadSampleData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await browserPDFProcessor.loadSampleData();
      
      if (result.successfulFiles > 0) {
        setHasChapterData(true);
        console.log(`✅ Loaded ${result.successfulFiles} sample chapters`);
        
        // Initialize embeddings for enhanced search
        await advancedRAGService.initializeEmbeddings();
      } else {
        throw new Error('Failed to load any sample data');
      }
      
      if (result.errors.length > 0) {
        console.warn('Some errors occurred:', result.errors);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sample data';
      setError(errorMessage);
      console.error('Error loading sample data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadPDFs = useCallback(async (files: File[]): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await browserPDFProcessor.processPDFFiles(files);
      
      if (result.successfulFiles > 0) {
        setHasChapterData(true);
        console.log(`✅ Processed ${result.successfulFiles} PDF files`);
      }
      
      if (result.errors.length > 0) {
        setError(`Some files failed to process: ${result.errors.join(', ')}`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF files';
      setError(errorMessage);
      console.error('Error processing PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStorageInfo = useCallback(async () => {
    return await localStorageRAG.getStorageInfo();
  }, []);

  return {
    isLoading,
    error,
    hasChapterData,
    sendMessage,
    loadSampleData,
    uploadPDFs,
    getStorageInfo
  };
=======
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
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
}
