// Embedding Service for semantic search using Cohere API
export interface EmbeddingVector {
  id: string;
  content: string;
  embedding: number[];
  chapterId: string;
  sectionTitle: string;
}

export interface EmbeddingSearchResult {
  content: string;
  similarity: number;
  sectionTitle: string;
}

class EmbeddingService {
  private apiKey = 'iLarjMOh1L78Cb866wMqO2KcVWa7hDujUnq3tQtt';
  private baseUrl = 'https://api.cohere.ai/v1';

  // Generate embedding for text using Cohere API
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/embed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: [text],
          model: 'embed-english-v3.0',
          input_type: 'search_document'
        }),
      });

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.status}`);
      }

      const data = await response.json();
      return data.embeddings[0];
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return zero vector as fallback
      return new Array(1024).fill(0);
    }
  }

  // Generate embedding for search query
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/embed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: [query],
          model: 'embed-english-v3.0',
          input_type: 'search_query'
        }),
      });

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.status}`);
      }

      const data = await response.json();
      return data.embeddings[0];
    } catch (error) {
      console.error('Error generating query embedding:', error);
      // Return zero vector as fallback
      return new Array(1024).fill(0);
    }
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Search for similar content using embeddings
  async searchSimilarContent(
    query: string, 
    chapterId: string, 
    embeddings: EmbeddingVector[]
  ): Promise<EmbeddingSearchResult[]> {
    try {
      const queryEmbedding = await this.generateQueryEmbedding(query);
      
      const results: EmbeddingSearchResult[] = [];
      
      for (const embedding of embeddings) {
        if (embedding.chapterId === chapterId) {
          const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding);
          if (similarity > 0.3) { // Threshold for relevance
            results.push({
              content: embedding.content,
              similarity,
              sectionTitle: embedding.sectionTitle
            });
          }
        }
      }
      
      // Sort by similarity score (highest first)
      return results.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error in semantic search:', error);
      return [];
    }
  }

  // Process chapter content and generate embeddings
  async processChapterContent(
    chapterId: string, 
    content: string
  ): Promise<EmbeddingVector[]> {
    try {
      const sections = this.splitContentIntoSections(content);
      const embeddings: EmbeddingVector[] = [];
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const embedding = await this.generateEmbedding(section.content);
        
        embeddings.push({
          id: `${chapterId}_${i}`,
          content: section.content,
          embedding,
          chapterId,
          sectionTitle: section.title
        });
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error processing chapter content:', error);
      return [];
    }
  }

  private splitContentIntoSections(content: string): { title: string; content: string }[] {
    const sections: { title: string; content: string }[] = [];
    const lines = content.split('\n');
    let currentSection = { title: 'Introduction', content: '' };
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('## ', '').trim(),
          content: ''
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections;
  }
}

export const embeddingService = new EmbeddingService();
