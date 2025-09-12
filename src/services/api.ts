// API Service Layer for Java Backend Integration
class ApiService {
  private baseURL = import.meta.env.VITE_REACT_APP_API_BASE_URL || '/api';
  private authToken: string | null = localStorage.getItem('authToken');

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      },
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    localStorage.removeItem('authToken');
    this.authToken = null;
    return this.request('/auth/logout', { method: 'POST' });
  }

  // User Data
  async getUserData() {
    return this.request('/user/profile');
  }

  async updateUserProgress(chapterId: number, topicId: number, progress: number) {
    return this.request(`/user/progress`, {
      method: 'PUT',
      body: JSON.stringify({ chapterId, topicId, progress }),
    });
  }

  // Chapters
  async getChapters() {
    return this.request('/chapters');
  }

  async getChapter(id: number) {
    return this.request(`/chapters/${id}`);
  }

  // Topics
  async getTopic(chapterId: number, topicId: number) {
    return this.request(`/chapters/${chapterId}/topics/${topicId}`);
  }

  // Quizzes
  async getQuizQuestions(topicId: number) {
    return this.request(`/topics/${topicId}/quiz`);
  }

  async submitQuizAnswer(questionId: number, answer: number) {
    return this.request(`/quiz/submit`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    });
  }

  // Assignments
  async getAssignment(topicId: number) {
    return this.request(`/topics/${topicId}/assignment`);
  }

  async uploadAssignment(topicId: number, files: FileList) {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    
    return this.request(`/topics/${topicId}/assignment/upload`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }

  // Tests
  async getTest(topicId: number) {
    return this.request(`/topics/${topicId}/test`);
  }

  async submitTest(topicId: number, answers: number[]) {
    return this.request(`/topics/${topicId}/test/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }
}

export const apiService = new ApiService();
export default ApiService;