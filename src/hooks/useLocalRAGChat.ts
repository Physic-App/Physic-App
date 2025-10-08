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
    // Force and Pressure
    'force and pressure': {
      'what is force': 'Force is a push or pull that can change the state of motion of an object. It is measured in Newtons (N).',
      'what is pressure': 'Pressure is the force applied per unit area. It is measured in Pascals (Pa) and calculated as P = F/A.',
      'newton laws': 'Newton\'s laws of motion describe the relationship between forces and motion: 1) Objects at rest stay at rest, 2) F=ma, 3) Action and reaction are equal and opposite.',
      'friction': 'Friction is a force that opposes the relative motion between two surfaces in contact. It depends on the nature of surfaces and normal force.'
    },
    // Friction
    'friction': {
      'what is friction': 'Friction is a force that opposes the relative motion between two surfaces in contact. It acts parallel to the surface and depends on the nature of the surfaces and the normal force.',
      'how friction works': 'Friction works through microscopic interactions between surfaces. Even smooth surfaces have tiny bumps and irregularities. When two surfaces come in contact, these microscopic features interlock, creating resistance to motion. The force required to overcome this resistance is what we call friction.',
      'types of friction': 'There are three types of friction: 1) Static friction (prevents motion), 2) Kinetic friction (opposes motion), and 3) Rolling friction (opposes rolling motion).',
      'factors affecting friction': 'Friction depends on: 1) Nature of surfaces in contact, 2) Normal force between surfaces, 3) Surface roughness, and 4) Temperature.',
      'applications of friction': 'Friction is essential for walking, driving, writing, and many other daily activities. It also causes wear and generates heat.',
      'friction formula': 'The friction force is calculated as F = μN, where F is friction force, μ (mu) is the coefficient of friction, and N is the normal force.',
      'coefficient of friction': 'The coefficient of friction is a dimensionless number that represents the ratio of friction force to normal force. It depends on the materials in contact.'
    },
    // Force and Laws of Motion
    'force and laws of motion': {
      'what is force': 'Force is a push or pull that can change the state of motion of an object. It is measured in Newtons (N).',
      'newton first law': 'Newton\'s First Law (Law of Inertia): An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.',
      'newton second law': 'Newton\'s Second Law: F = ma, where F is force, m is mass, and a is acceleration. Force equals mass times acceleration.',
      'newton third law': 'Newton\'s Third Law: For every action, there is an equal and opposite reaction. Forces always occur in pairs.'
    },
    // Electric Current and Its Effects
    'electric current and its effects': {
      'what is electric current': 'Electric current is the flow of electric charge through a conductor. It is measured in Amperes (A) and flows from positive to negative terminal.',
      'what is electricity': 'Electricity is the flow of electric charge through a conductor. It can be static (stationary charges) or current (moving charges).',
      'current effects': 'Electric current has three main effects: 1) Heating effect (produces heat), 2) Magnetic effect (creates magnetic field), and 3) Chemical effect (causes chemical reactions).',
      'voltage': 'Voltage is the electric potential difference between two points, measured in Volts (V). It provides the "pressure" to push current through a circuit.',
      'resistance': 'Resistance is the opposition to the flow of electric current, measured in Ohms (Ω). It depends on material, length, cross-sectional area, and temperature.'
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
  const chapterResponses = responses[chapterKey];
  
  // If no specific chapter responses found, return a helpful message
  if (!chapterResponses) {
    return `**From ${chapterTitle} textbook:**\n\nI can help you with questions about ${chapterTitle}. Please ask specific questions about this topic, and I'll provide detailed explanations from the textbook.`;
  }

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

  // Default response for the specific chapter
  return `**From ${chapterTitle} textbook:**\n\nI can help you understand concepts related to ${chapterTitle}. Please ask specific questions about topics like ${keywords.slice(0, 3).join(', ')} or other ${chapterTitle} concepts.`;
}