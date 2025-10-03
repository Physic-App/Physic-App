export interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  isBookmarked?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
}

export interface ChatSession {
  id: string;
  title: string;
  chapterId: string;
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
}