import { useState, useCallback } from 'react';
import { Message } from '../types/chatbot';

export interface UseLocalRAGChatOptions {
  chapterId: string;
  chapterTitle: string;
  useLocalStorage?: boolean;
}

export interface UseLocalRAGChatReturn {
  sendMessage: (
    question: string,
    chapterId: string,
    chapterTitle: string
  ) => Promise<{
    content: string;
    isBot: boolean;
    timestamp: Date;
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

  // Mock hasChapterData for now
  const hasChapterData = true;

  const sendMessage = useCallback(async (
    question: string,
    chapterId: string,
    chapterTitle: string
  ): Promise<{
    content: string;
    isBot: boolean;
    timestamp: Date;
    sources?: string[];
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

      // Generate a contextual response based on the question and chapter
      const response = generateContextualResponse(question, chapterTitle);

      return {
        content: response,
        isBot: true,
        timestamp: new Date(),
        sources: [`${chapterTitle} Chapter`]
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      console.error('Local RAG Chat Error:', err);

      return {
        content: `I encountered an error: ${errorMessage}. Please try again.`,
        isBot: true,
        timestamp: new Date(),
      };
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, chapterTitle, useLocalStorage]);

  return {
    sendMessage,
    isLoading,
    error,
    hasChapterData,
  };
};

/**
 * Generate contextual response from content
 */
function generateContextualResponse(question: string, chapterTitle: string): string {
  const questionLower = question.toLowerCase();
  
  // Physics knowledge base responses
  const responses = {
    // Motion
    'motion': {
      'what is motion': 'Motion is the change in position of an object with respect to time. It can be described in terms of displacement, velocity, and acceleration.',
      'speed': 'Speed is the distance traveled per unit time. It is a scalar quantity measured in m/s or km/h.',
      'velocity': 'Velocity is the rate of change of displacement with respect to time. It is a vector quantity with both magnitude and direction.',
      'acceleration': 'Acceleration is the rate of change of velocity with respect to time. It can be positive (speeding up) or negative (slowing down).'
    },
    // Force
    'force': {
      'what is force': 'Force is a push or pull that can change the state of motion of an object. It is measured in Newtons (N).',
      'newton laws': 'Newton\'s laws of motion describe the relationship between forces and motion: 1) Objects at rest stay at rest, 2) F=ma, 3) Action and reaction are equal and opposite.',
      'friction': 'Friction is a force that opposes the relative motion between two surfaces in contact. It depends on the nature of surfaces and normal force.'
    },
    // Electricity
    'electricity': {
      'what is electricity': 'Electricity is the flow of electric charge through a conductor. It can be static (stationary charges) or current (moving charges).',
      'current': 'Electric current is the flow of electric charge per unit time, measured in Amperes (A).',
      'voltage': 'Voltage is the electric potential difference between two points, measured in Volts (V).',
      'resistance': 'Resistance is the opposition to the flow of electric current, measured in Ohms (Ω).'
    },
    // Light
    'light': {
      'what is light': 'Light is an electromagnetic wave that can travel through vacuum. It exhibits both wave and particle properties.',
      'reflection': 'Reflection is the bouncing back of light when it hits a surface. The angle of incidence equals the angle of reflection.',
      'refraction': 'Refraction is the bending of light when it passes from one medium to another due to change in speed.',
      'lens': 'A lens is a transparent material that refracts light to form images. Convex lenses converge light, concave lenses diverge light.'
    }
  };

  // Find the best matching response
  const chapterKey = chapterTitle.toLowerCase();
  const chapterResponses = responses[chapterKey] || responses['motion']; // fallback to motion

  // Check for exact matches first
  for (const [key, response] of Object.entries(chapterResponses)) {
    if (questionLower.includes(key)) {
      return `**From ${chapterTitle} textbook:**\n\n${response}`;
    }
  }

  // Check for keyword matches
  const keywords = Object.keys(chapterResponses);
  const matchedKeyword = keywords.find(keyword => 
    questionLower.includes(keyword) || keyword.includes(questionLower.split(' ')[0])
  );

  if (matchedKeyword) {
    return `**From ${chapterTitle} textbook:**\n\n${chapterResponses[matchedKeyword]}`;
  }

  // Default response
  return `**From ${chapterTitle} textbook:**\n\nI can help you understand concepts related to ${chapterTitle}. Please ask specific questions about topics like ${keywords.slice(0, 3).join(', ')} or other ${chapterTitle} concepts.`;
}