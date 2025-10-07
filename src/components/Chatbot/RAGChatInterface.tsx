import React, { useState, useEffect, useRef } from 'react';
import { Send, Bookmark, Plus, Wifi, WifiOff } from 'lucide-react';
import { Message, Chapter, ChatSession } from '../../types/chatbot';
import { mockChatSessions } from '../../data/mockData';
import { ChapterSelector } from './ChapterSelector';
import { ChatHistory } from './ChatHistory';
import { MessageCard } from './MessageCard';
import { TypingIndicator } from './TypingIndicator';
import { BookmarkSidebar } from './BookmarkSidebar';
import ThemeToggle from '../Navigation/ThemeToggle';
<<<<<<< HEAD
// import { useRAGChat } from '../../hooks/useRAGChat';
=======
import { useRAGChat } from '../../hooks/useRAGChat';
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

export const RAGChatInterface: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(mockChatSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

<<<<<<< HEAD
  // Mock RAG Chat functionality (hook doesn't exist yet)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendHealthy] = useState(false); // Always false for now

  const sendMessage = async (message: string, chapterId: string, chapterTitle: string) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, return a mock response
    return {
      content: `Mock response for "${message}" in ${chapterTitle}`,
      isBot: true,
      timestamp: new Date()
    };
  };
=======
  // RAG Chat Hook
  const { sendMessage, isLoading, error, isBackendHealthy } = useRAGChat({
    enableRAG: true,
    fallbackToMock: true,
    chapterId: selectedChapter?.id || '',
    chapterTitle: selectedChapter?.title || '',
  });
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      inputRef.current?.focus();
    }
  }, [selectedChapter]);

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setMessages([]);
    setSelectedSessionId(null);
    
    // Welcome message for new chapter
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hello! I'm here to help you with **${chapter.title}**. Ask me anything about this chapter - from basic concepts to complex numerical problems. I can explain step-by-step solutions and provide detailed conceptual understanding.

${!isBackendHealthy ? '⚠️ *Currently using offline mode. For best results, ensure the backend server is running.*' : '✅ *Connected to physics knowledge base.*'}`,
      isBot: true,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };

  const handleSessionSelect = (session: ChatSession) => {
    setSelectedSessionId(session.id);
    setMessages(session.messages);
    // Find and set the chapter for this session
    const chapter = { id: session.chapterId, title: '', description: '' };
    setSelectedChapter(chapter);
  };

  const handleSessionDelete = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    if (!selectedChapter) return;
    
    setSelectedSessionId(null);
    setMessages([]);
    
    // Welcome message for new chat
    const welcomeMessage: Message = {
      id: Date.now().toString(),
<<<<<<< HEAD
      content: `Hello! 👋 I'm your physics assistant for **${selectedChapter.title}**. I'm here to help you understand concepts, solve problems, and answer any questions you have about this topic. What would you like to learn about today?
=======
      content: `Hello! I'm here to help you with **${selectedChapter.title}**. Ask me anything about this chapter - from basic concepts to complex numerical problems. I can explain step-by-step solutions and provide detailed conceptual understanding.
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

${!isBackendHealthy ? '⚠️ *Currently using offline mode. For best results, ensure the backend server is running.*' : '✅ *Connected to physics knowledge base.*'}`,
      isBot: true,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChapter || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    // Save or update chat session
    if (!selectedSessionId && newMessages.length > 1) {
      // Create new session
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: generateChatTitle(currentInput),
        chapterId: selectedChapter.id,
        messages: newMessages,
        createdAt: new Date(),
        lastActivity: new Date(),
      };
      setChatSessions(prev => [newSession, ...prev]);
      setSelectedSessionId(newSession.id);
    } else if (selectedSessionId) {
      // Update existing session
      setChatSessions(prev =>
        prev.map(session =>
          session.id === selectedSessionId
            ? { ...session, messages: newMessages, lastActivity: new Date() }
            : session
        )
      );
    }

    try {
      // Send message to RAG system
      const result = await sendMessage(
        currentInput,
<<<<<<< HEAD
        selectedChapter.id,
        selectedChapter.title
=======
        newMessages,
        selectedSessionId || undefined
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
      );

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
<<<<<<< HEAD
        content: result.content,
=======
        content: result.response,
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
        isBot: true,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, botResponse];
      setMessages(updatedMessages);

      // Update session with bot response
      if (selectedSessionId) {
        setChatSessions(prev =>
          prev.map(session =>
            session.id === selectedSessionId
              ? { ...session, messages: updatedMessages, lastActivity: new Date() }
              : session
          )
        );
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response on error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your question. Please try again or rephrase your question.",
        isBot: true,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, errorResponse];
      setMessages(updatedMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBookmark = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isBookmarked: !msg.isBookmarked }
          : msg
      )
    );
  };

  const bookmarkedMessages = messages.filter(msg => msg.isBookmarked);

  const handleRemoveBookmark = (messageId: string) => {
    handleBookmark(messageId);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Left Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Physics AI
              </h1>
              {/* Backend Status Indicator */}
              {isBackendHealthy ? (
                <Wifi size={16} className="text-green-500" title="Connected to RAG backend" />
              ) : (
                <WifiOff size={16} className="text-orange-500" title="Using offline mode" />
              )}
            </div>
            <ThemeToggle />
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-3 p-2 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm text-orange-700 dark:text-orange-300">
              Backend unavailable - using offline mode
            </div>
          )}
          
          {selectedChapter && (
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={18} />
              <span>New Chat</span>
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <ChapterSelector
            selectedChapter={selectedChapter}
            onChapterSelect={handleChapterSelect}
          />
          
          <ChatHistory
            chatSessions={chatSessions.filter(session => session.chapterId === selectedChapter?.id)}
            selectedSessionId={selectedSessionId}
            onSessionSelect={handleSessionSelect}
            onSessionDelete={handleSessionDelete}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedChapter 
                  ? selectedChapter.title 
                  : 'Select a chapter to start'
                }
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedChapter 
                  ? `Ask questions about concepts, formulas, and numerical problems ${isBackendHealthy ? '• RAG-powered responses' : '• Offline mode'}`
                  : 'Choose a physics chapter from the sidebar'
                }
              </p>
            </div>
            <button
              onClick={() => setShowBookmarks(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 
                         text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 
                         dark:hover:bg-blue-900/30 transition-colors duration-200"
            >
              <Bookmark size={18} />
              {bookmarkedMessages.length > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {bookmarkedMessages.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedChapter ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Welcome to Physics AI Assistant
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Select a chapter from the sidebar to start asking questions. 
                  I'll help you understand concepts and solve problems step by step using 
                  {isBackendHealthy ? ' your physics textbook content.' : ' offline knowledge.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onBookmark={handleBookmark}
                />
              ))}
              
              {(isTyping || isLoading) && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {selectedChapter && (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask anything about ${selectedChapter.title}...`}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                             rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isTyping || isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || isLoading}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bookmark Sidebar */}
      <BookmarkSidebar
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        bookmarkedMessages={bookmarkedMessages}
        onRemoveBookmark={handleRemoveBookmark}
      />
    </div>
  );
};

