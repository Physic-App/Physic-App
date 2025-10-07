import { Question, MCQQuestion, QuizQuestion, DifficultyLevel } from '../types/test';

// Question tracking to prevent repetition
const USED_QUESTIONS_KEY = 'physicsflow_used_questions';
const MAX_QUESTIONS_PER_TOPIC = 100;

interface UsedQuestion {
  topic: string;
  questionHash: string;
  timestamp: number;
}

const getUsedQuestions = (): UsedQuestion[] => {
  try {
    const stored = localStorage.getItem(USED_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsedQuestions = (questions: UsedQuestion[]) => {
  try {
    // Keep only last 1000 questions to prevent storage bloat
    const recentQuestions = questions.slice(-1000);
    localStorage.setItem(USED_QUESTIONS_KEY, JSON.stringify(recentQuestions));
  } catch (error) {
    console.warn('Failed to save used questions:', error);
  }
};

const generateQuestionHash = (question: string): string => {
  return btoa(question.toLowerCase().replace(/\s+/g, ' ').trim()).substring(0, 20);
};

const addUsedQuestions = (topic: string, questions: Question[]) => {
  const usedQuestions = getUsedQuestions();
  const newUsedQuestions = questions.map(q => ({
    topic,
    questionHash: generateQuestionHash(q.question),
    timestamp: Date.now()
  }));
  
  const updatedQuestions = [...usedQuestions, ...newUsedQuestions];
  saveUsedQuestions(updatedQuestions);
};

const getTopicUsedQuestions = (topic: string): string[] => {
  const usedQuestions = getUsedQuestions();
  return usedQuestions
    .filter(uq => uq.topic === topic)
    .map(uq => uq.questionHash);
};

// Multiple API Keys for fallback system
const GEMINI_API_KEYS = [
  'AIzaSyAdBKSN1V9uK9i0bcaQK8X7J6mw0MHdXGE', // Key 1
  'AIzaSyDCla74oEMtUbT0xPPWgazB-kapV7tfZSE', // Key 2
  'AIzaSyCjTm-64pWOMZxJihRAFBpuBK9AiHgQwew', // Key 3
  'AIzaSyDLOen73cEXYBfqTuROAhaU_lyPGODBGoM', // Key 4
  'AIzaSyB8Z9X0K1L2M3N4O5P6Q7R8S9T0U1V2W3X', // Key 5
  'AIzaSyC9D0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z', // Key 6
  'AIzaSyD0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T', // Key 7
  'AIzaSyE1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U', // Key 8
];

const GROQ_API_KEYS = [
  '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', // Groq Key 1
  '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', // Groq Key 2
  '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', // Groq Key 3
  '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', // Groq Key 4
  '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', // Groq Key 5
  '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', // Groq Key 6
];

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class TestService {
  private static cleanJsonResponse(response: string): string {
    let cleanResponse = response.trim();
    
    // Remove any markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Find JSON array in the response
    const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }
    
    // Don't escape characters - let the JSON parser handle it naturally
    // The issue was that we were double-escaping, making valid JSON invalid
    return cleanResponse;
  }

  private static async callGroqAPI(prompt: string): Promise<string> {
    let lastError: Error | null = null;
    
    // Try each Groq API key in sequence
    for (let i = 0; i < GROQ_API_KEYS.length; i++) {
      const apiKey = GROQ_API_KEYS[i];
      console.log(`Trying Groq API key ${i + 1}/${GROQ_API_KEYS.length}`);
      
      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.7,
            max_tokens: 2048,
          })
        });

        if (!response.ok) {
          throw new Error(`Groq API error: ${response.status} (Key ${i + 1})`);
        }

        const data: GroqResponse = await response.json();
        const result = data.choices[0]?.message?.content || '';
        
        if (result) {
          console.log(`✅ Successfully used Groq API key ${i + 1}`);
          return result;
        } else {
          throw new Error(`Empty response from Groq API key ${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Groq API key ${i + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown Groq API error');
        
        // If this is not the last key, continue to the next one
        if (i < GROQ_API_KEYS.length - 1) {
          console.log(`🔄 Trying next Groq API key...`);
          continue;
        }
      }
    }
    
    // If all Groq keys failed, throw the last error
    console.error('❌ All Groq API keys failed');
    throw lastError || new Error('All Groq API keys failed.');
  }

  private static async callGeminiAPI(prompt: string): Promise<string> {
    let lastError: Error | null = null;
    
    // Try each Gemini API key in sequence
    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
      const apiKey = GEMINI_API_KEYS[i];
      console.log(`Trying Gemini API key ${i + 1}/${GEMINI_API_KEYS.length}`);
      
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} (Key ${i + 1})`);
        }

        const data: GeminiResponse = await response.json();
        const result = data.candidates[0]?.content?.parts[0]?.text || '';
        
        if (result) {
          console.log(`✅ Successfully used Gemini API key ${i + 1}`);
          return result;
        } else {
          throw new Error(`Empty response from Gemini API key ${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Gemini API key ${i + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown Gemini API error');
        
        // If this is not the last key, continue to the next one
        if (i < GEMINI_API_KEYS.length - 1) {
          console.log(`🔄 Trying next Gemini API key...`);
          continue;
        }
      }
    }
    
    // If all Gemini keys failed, throw the last error
    console.error('❌ All Gemini API keys failed');
    throw lastError || new Error('All Gemini API keys failed.');
  }

  private static async callAIAPI(prompt: string): Promise<string> {
    console.log('🚀 Starting AI API call with fallback chain...');
    
    // First try all Gemini API keys
    try {
      console.log('📡 Trying Gemini API...');
      return await this.callGeminiAPI(prompt);
    } catch {
      console.log('⚠️ All Gemini API keys failed, trying Groq API...');
      
      // If all Gemini keys fail, try Groq API
      try {
        console.log('📡 Trying Groq API...');
        return await this.callGroqAPI(prompt);
      } catch {
        console.error('❌ All AI APIs failed');
        throw new Error('All AI services are currently unavailable. Please try again later.');
      }
    }
  }

  static async generateMCQQuestions(
    topic: string,
    count: number,
    difficulty: DifficultyLevel
  ): Promise<MCQQuestion[]> {
    // Add randomization and variation to prevent repetition
    const randomSeed = Math.random().toString(36).substring(7);
    const currentTime = new Date().toISOString();
    const variationHints = [
      "Include practical examples and real-world applications",
      "Focus on problem-solving scenarios with calculations",
      "Ask about conceptual understanding and definitions",
      "Include numerical problems with different values",
      "Ask about relationships between different concepts",
      "Include diagram-based questions",
      "Focus on cause and effect relationships",
      "Ask about comparisons and contrasts"
    ];
    const randomHint = variationHints[Math.floor(Math.random() * variationHints.length)];

    const prompt = `Generate ${count} multiple choice questions about "${topic}" physics topic for ${difficulty} difficulty level.

Requirements:
- Each question should have exactly 4 options (A, B, C, D)
- Questions should be clear and educational
- Include mathematical formulas using LaTeX format (e.g., $F = ma$)
- Make sure the correct answer is not always the same option
- Questions should be appropriate for high school physics level
- Focus specifically on the given topic concepts
- ${randomHint}
- Generate unique questions that haven't been asked before
- Vary the question types and approaches
- Session ID: ${randomSeed} - Time: ${currentTime}
- IMPORTANT: Avoid these common question patterns that have been used recently:
${getTopicUsedQuestions(topic).length > 0 ? `- Avoid questions similar to previously generated ones for this topic` : ''}
- Create completely new and different questions
- Use different numerical values and scenarios

Format the response as JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Only return the JSON array, no other text.`;

    const response = await this.callAIAPI(prompt);
    
    try {
      const cleanResponse = this.cleanJsonResponse(response);
      const questions = JSON.parse(cleanResponse);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      const mcqQuestions = questions.map((q: Record<string, unknown>, index: number) => ({
        id: `mcq-${Date.now()}-${index}`,
        question: (q.question as string) || `Question ${index + 1}`,
        options: (q.options as string[]) || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        topic,
        difficulty,
        questionType: 'mcq' as const
      }));

      // Track used questions to prevent repetition
      addUsedQuestions(topic, mcqQuestions);
      
      return mcqQuestions;
    } catch (error) {
      console.error('❌ Error parsing MCQ questions:', error);
      console.error('📄 Raw response:', response);
      throw new Error('Unable to generate questions at this time. Our development team will respond soon.');
    }
  }

  static async generateQuizQuestions(
    topic: string,
    count: number,
    difficulty: DifficultyLevel
  ): Promise<QuizQuestion[]> {
    // Add randomization and variation to prevent repetition
    const randomSeed = Math.random().toString(36).substring(7);
    const currentTime = new Date().toISOString();
    const variationHints = [
      "Ask for specific numerical values and calculations",
      "Request explanations of physical phenomena",
      "Ask for formula derivations and applications",
      "Include problem-solving with step-by-step solutions",
      "Ask about experimental observations and results",
      "Request comparisons between different concepts",
      "Ask for practical applications in daily life",
      "Include analysis of graphs and diagrams"
    ];
    const randomHint = variationHints[Math.floor(Math.random() * variationHints.length)];

    const prompt = `Generate ${count} short answer questions about "${topic}" physics topic for ${difficulty} difficulty level.

Requirements:
- Questions should require brief, specific answers
- Include mathematical formulas using LaTeX format (e.g., $E = mc^2$)
- Questions should be clear and educational
- Provide the correct answer for each question
- Questions should be appropriate for high school physics level
- Focus specifically on the given topic concepts
- ${randomHint}
- Generate unique questions that haven't been asked before
- Vary the question types and approaches
- Session ID: ${randomSeed} - Time: ${currentTime}

Format the response as JSON array with this structure:
[
  {
    "question": "Question text here",
    "correctAnswer": "Correct answer here"
  }
]

Only return the JSON array, no other text.`;

    const response = await this.callAIAPI(prompt);
    
    try {
      const cleanResponse = this.cleanJsonResponse(response);
      const questions = JSON.parse(cleanResponse);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      const quizQuestions = questions.map((q: Record<string, unknown>, index: number) => ({
        id: `quiz-${Date.now()}-${index}`,
        question: (q.question as string) || `Question ${index + 1}`,
        correctAnswer: (q.correctAnswer as string) || 'No answer provided',
        topic,
        difficulty,
        questionType: 'short-answer' as const
      }));

      // Track used questions to prevent repetition
      addUsedQuestions(topic, quizQuestions);
      
      return quizQuestions;
    } catch (error) {
      console.error('❌ Error parsing Quiz questions:', error);
      console.error('📄 Raw response:', response);
      throw new Error('Unable to generate questions at this time. Our development team will respond soon.');
    }
  }

  static async generateQuestions(config: { topic: string; questionCount: number; difficulty: DifficultyLevel; questionType: 'mcq' | 'quiz' | 'short-answer' }): Promise<Question[]> {
    const { topic, questionCount, difficulty, questionType } = config;
    
    console.log('🚀 generateQuestions called with:', { topic, questionCount, difficulty, questionType });
    
    if (questionType === 'mcq') {
      console.log('📝 Generating MCQ questions...');
      const questions = await this.generateMCQQuestions(topic, questionCount, difficulty);
      console.log(`✅ Generated ${questions.length} MCQ questions:`, questions);
      return questions;
    } else if (questionType === 'short-answer' || questionType === 'quiz') {
      console.log('📝 Generating Short Answer questions...');
      const questions = await this.generateQuizQuestions(topic, questionCount, difficulty);
      console.log(`✅ Generated ${questions.length} Short Answer questions:`, questions);
      return questions;
    } else {
      // This should never happen, but fallback to MCQ
      console.log('⚠️ Unknown question type, falling back to MCQ...');
      const questions = await this.generateMCQQuestions(topic, questionCount, difficulty);
      console.log(`✅ Fallback: Generated ${questions.length} MCQ questions:`, questions);
      return questions;
    }
  }
}
