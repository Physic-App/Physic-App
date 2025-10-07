// Groq API Service for enhanced response generation
export interface GroqResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class GroqService {
  private apiKey = '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';
  private baseUrl = 'https://api.groq.com/openai/v1';

  // Generate response using Groq API
  async generateResponse(
    query: string,
    context: string,
    chapterTitle: string
  ): Promise<string> {
    try {
      const systemPrompt = `You are a physics tutor specializing in ${chapterTitle}. 
      
Your role:
- Answer questions ONLY using the provided textbook content
- Be accurate, educational, and helpful
- Use clear explanations with examples when appropriate
- If the question is not related to the chapter topic, politely redirect

IMPORTANT: Only use information from the provided context. Do not add external knowledge.`;

      const userPrompt = `Context from textbook:
${context}

Student Question: ${query}

Please provide a helpful answer based only on the textbook content above.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Error generating Groq response:', error);
      return `📖 From the textbook:\n\nI apologize, but I'm having trouble generating a response right now. Please try again or rephrase your question.`;
    }
  }

  // Generate a summary of the chapter content
  async generateChapterSummary(
    chapterTitle: string,
    content: string
  ): Promise<string> {
    try {
      const systemPrompt = `You are a physics tutor. Create a concise, educational summary of the ${chapterTitle} chapter content.`;

      const userPrompt = `Please provide a clear summary of this ${chapterTitle} content:

${content}`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 300,
          temperature: 0.5,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Summary not available.';
    } catch (error) {
      console.error('Error generating chapter summary:', error);
      return 'Summary generation failed.';
    }
  }

  // Check if a question is related to the chapter topic
  async checkTopicRelevance(
    question: string,
    chapterTitle: string,
    availableTopics: string[]
  ): Promise<{ isRelevant: boolean; suggestedChapter?: string }> {
    try {
      const systemPrompt = `You are a physics topic classifier. Determine if a question is related to a specific physics chapter.

Available chapters: ${availableTopics.join(', ')}

Return ONLY a JSON response with:
- "isRelevant": boolean
- "suggestedChapter": string (if not relevant, suggest the correct chapter)`;

      const userPrompt = `Question: "${question}"
Chapter: "${chapterTitle}"

Is this question related to ${chapterTitle}?`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 100,
          temperature: 0.1,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      try {
        const result = JSON.parse(content);
        return {
          isRelevant: result.isRelevant || false,
          suggestedChapter: result.suggestedChapter
        };
      } catch {
        return { isRelevant: true }; // Default to relevant if parsing fails
      }
    } catch (error) {
      console.error('Error checking topic relevance:', error);
      return { isRelevant: true }; // Default to relevant on error
    }
  }
}

export const groqService = new GroqService();
