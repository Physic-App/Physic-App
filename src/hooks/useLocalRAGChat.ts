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
      'how its work': 'Force and pressure work together in physics: 1) Force causes changes in motion (acceleration, deceleration, direction changes), 2) Pressure distributes force over an area - smaller area means higher pressure, 3) When you push a nail, the force creates high pressure at the sharp tip, allowing it to penetrate materials, 4) In hydraulic systems, pressure is transmitted equally in all directions, allowing small forces to create large effects.',
      'how it works': 'Force and pressure work together in physics: 1) Force causes changes in motion (acceleration, deceleration, direction changes), 2) Pressure distributes force over an area - smaller area means higher pressure, 3) When you push a nail, the force creates high pressure at the sharp tip, allowing it to penetrate materials, 4) In hydraulic systems, pressure is transmitted equally in all directions, allowing small forces to create large effects.',
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
      'how its work': 'Electricity works through the movement of electrons: 1) Electrons flow from areas of high potential (voltage) to low potential, 2) This flow creates electric current, measured in Amperes (A), 3) Voltage provides the "pressure" to push electrons through conductors, 4) Resistance opposes the flow - good conductors (like copper) have low resistance, insulators have high resistance, 5) Ohm\'s Law: V = I × R (Voltage = Current × Resistance)',
      'how it works': 'Electricity works through the movement of electrons: 1) Electrons flow from areas of high potential (voltage) to low potential, 2) This flow creates electric current, measured in Amperes (A), 3) Voltage provides the "pressure" to push electrons through conductors, 4) Resistance opposes the flow - good conductors (like copper) have low resistance, insulators have high resistance, 5) Ohm\'s Law: V = I × R (Voltage = Current × Resistance)',
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
    },
    // Gravitation
    'gravitation': {
      'what is gravitation': 'Gravitation is the force of attraction between any two masses in the universe. It is one of the fundamental forces of nature.',
      'what is the law of gravitation': 'Newton\'s Law of Gravitation states that every particle in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between them. F = G(m1×m2)/r²',
      'what is the universal law of gravitation': 'The Universal Law of Gravitation states that every particle in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between them. F = G(m1×m2)/r², where G is the gravitational constant (6.674 × 10⁻¹¹ N⋅m²/kg²).',
      'gravitational force': 'Gravitational force is the attractive force between two masses. It depends on the masses of the objects and the distance between them.',
      'weight': 'Weight is the gravitational force exerted on an object by a massive body (like Earth). It is calculated as W = mg, where m is mass and g is acceleration due to gravity.',
      'acceleration due to gravity': 'Acceleration due to gravity (g) is the acceleration experienced by objects in free fall near Earth\'s surface. On Earth, g ≈ 9.8 m/s².'
    },
    // Work and Energy
    'work and energy': {
      'what is work': 'Work is done when a force causes displacement of an object in the direction of the force. Work = Force × Displacement × cos(θ), where θ is the angle between force and displacement.',
      'what is energy': 'Energy is the capacity to do work. It exists in various forms: kinetic energy, potential energy, thermal energy, etc. Energy cannot be created or destroyed, only transformed.',
      'kinetic energy': 'Kinetic energy is the energy possessed by an object due to its motion. KE = (1/2)mv², where m is mass and v is velocity.',
      'potential energy': 'Potential energy is stored energy due to position or configuration. Gravitational PE = mgh, where m is mass, g is gravity, and h is height.',
      'conservation of energy': 'The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another. Total energy remains constant in a closed system.',
      'power': 'Power is the rate of doing work. Power = Work/Time = Energy/Time. Unit is Watt (W) or J/s.',
      'work energy theorem': 'The work-energy theorem states that the work done on an object equals the change in its kinetic energy. W = ΔKE = (1/2)mv² - (1/2)mu²'
    },
    // Magnetic Effects of Electric Current
    'magnetic effects of electric current': {
      'what is magnetic effect': 'Magnetic effect of electric current refers to the creation of magnetic field around a current-carrying conductor. Moving charges (current) produce magnetic fields.',
      'electromagnet': 'An electromagnet is a magnet created by passing electric current through a coil of wire wrapped around a magnetic material (like iron). The magnetic field disappears when current stops.',
      'electric motor': 'An electric motor converts electrical energy into mechanical energy using the magnetic effect of current. It uses the interaction between magnetic field and current-carrying conductor.',
      'electric generator': 'An electric generator converts mechanical energy into electrical energy using electromagnetic induction. It produces electric current by moving a conductor in a magnetic field.',
      'electromagnetic induction': 'Electromagnetic induction is the process of generating electric current in a conductor by changing the magnetic field around it. Discovered by Michael Faraday.',
      'faraday law': 'Faraday\'s law states that the induced emf in a circuit is directly proportional to the rate of change of magnetic flux through the circuit. E = -dΦ/dt.',
      'lenz law': 'Lenz\'s law states that the direction of induced current opposes the change causing it. This ensures conservation of energy in electromagnetic induction.',
      'transformer': 'A transformer is a device that changes the voltage of alternating current using electromagnetic induction. It consists of primary and secondary coils with a common iron core.'
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