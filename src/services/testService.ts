import { Question, MCQQuestion, QuizQuestion, DifficultyLevel } from '../types/test';

// Multiple API Keys for fallback system - loaded from environment variables
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_1 || 'AIzaSyAdBKSN1V9uK9i0bcaQK8X7J6mw0MHdXGE', // Key 1
  import.meta.env.VITE_GEMINI_API_KEY_2 || 'AIzaSyDCla74oEMtUbT0xPPGgazB-kapV7tfZSE', // Key 2
  import.meta.env.VITE_GEMINI_API_KEY_3 || 'AIzaSyCjTm-64pWOMZxJihRAFBpuBK9AiHgQwew', // Key 3
  import.meta.env.VITE_GEMINI_API_KEY_4 || 'AIzaSyDLOen73cEXYBfqTuROAhaU_lyPGODBGoM', // Key 4 (from your original test generator)
].filter(key => key); // Remove any undefined keys

const GROQ_API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY_1 || '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', // Groq Key 1
  import.meta.env.VITE_GROQ_API_KEY_2 || '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', // Groq Key 2
].filter(key => key); // Remove any undefined keys

const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

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
    
    return cleanResponse;
  }

  private static async callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
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
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private static async callGroqAPI(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data: GroqResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Groq API');
    }

    return data.choices[0].message.content;
  }

  private static async callAIAPI(prompt: string): Promise<string> {
    // Try Gemini API keys first
    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
      try {
        console.log(`🔄 Trying Gemini API Key ${i + 1}...`);
        const response = await this.callGeminiAPI(prompt, GEMINI_API_KEYS[i]);
        console.log(`✅ Gemini API Key ${i + 1} succeeded!`);
        return response;
      } catch (error) {
        console.warn(`❌ Gemini API Key ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
        if (i === GEMINI_API_KEYS.length - 1) {
          console.log('🔄 All Gemini keys failed, trying Groq...');
        }
      }
    }

    // Try Groq API keys
    for (let i = 0; i < GROQ_API_KEYS.length; i++) {
      try {
        console.log(`🔄 Trying Groq API Key ${i + 1}...`);
        const response = await this.callGroqAPI(prompt, GROQ_API_KEYS[i]);
        console.log(`✅ Groq API Key ${i + 1} succeeded!`);
        return response;
      } catch (error) {
        console.warn(`❌ Groq API Key ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
        if (i === GROQ_API_KEYS.length - 1) {
          console.log('❌ All API keys failed!');
        }
      }
    }

    throw new Error('All API keys failed. Please contact the developer for assistance.');
  }

  static async generateMCQQuestions(
    chapterTitle: string,
    count: number,
    difficulty: DifficultyLevel
  ): Promise<MCQQuestion[]> {
    const prompt = `Generate ${count} multiple choice questions about "${chapterTitle}" for ${difficulty} level students. Each question should have 4 options (A, B, C, D) with only one correct answer.

Format the response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this answer is correct"
  }
]

Make sure the questions are:
- Relevant to ${chapterTitle} chapter
- Appropriate for ${difficulty} level
- Clear and unambiguous
- Have only one correct answer
- Include helpful explanations

Return only the JSON array, no other text.`;

    try {
      const response = await this.callAIAPI(prompt);
      const cleanResponse = this.cleanJsonResponse(response);
      const questions = JSON.parse(cleanResponse) as MCQQuestion[];
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response format from AI');
      }

      return questions.slice(0, count);
    } catch (error) {
      console.error('Error generating MCQ questions:', error);
      throw new Error('Failed to generate questions. Please try again or contact support.');
    }
  }

  static async generateQuizQuestions(
    chapterTitle: string,
    count: number,
    difficulty: DifficultyLevel
  ): Promise<QuizQuestion[]> {
    const prompt = `Generate ${count} short answer questions about "${chapterTitle}" for ${difficulty} level students.

Format the response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "answer": "Expected answer or key points",
    "explanation": "Detailed explanation of the answer"
  }
]

Make sure the questions are:
- Relevant to ${chapterTitle} chapter
- Appropriate for ${difficulty} level
- Require thoughtful short answers (not just yes/no)
- Include comprehensive explanations
- Test understanding of key concepts

Return only the JSON array, no other text.`;

    try {
      const response = await this.callAIAPI(prompt);
      const cleanResponse = this.cleanJsonResponse(response);
      const questions = JSON.parse(cleanResponse) as QuizQuestion[];
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response format from AI');
      }

      return questions.slice(0, count);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw new Error('Failed to generate questions. Please try again or contact support.');
    }
  }

  static async generateQuestions(config: {
    chapterTitle: string;
    questionType: 'mcq' | 'short-answer' | 'quiz';
    count: number;
    difficulty: DifficultyLevel;
  }): Promise<Question[]> {
    const { chapterTitle, questionType, count, difficulty } = config;

    if (questionType === 'mcq') {
      return await this.generateMCQQuestions(chapterTitle, count, difficulty);
    } else {
      // Handle both 'short-answer' and 'quiz' as the same type
      return await this.generateQuizQuestions(chapterTitle, count, difficulty);
    }
  }
}
