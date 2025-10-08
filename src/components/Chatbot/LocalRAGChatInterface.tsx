import React, { useState, useEffect, useRef } from 'react';
import { Send, Bookmark, Plus, Database } from 'lucide-react';
import { Message, Chapter, ChatSession } from '../../types/chatbot';
import { mockChatSessions } from '../../data/mockData';
import { ChapterSelector } from './ChapterSelector';
import { ChatHistory } from './ChatHistory';
import { MessageCard } from './MessageCard';
import { TypingIndicator } from './TypingIndicator';
import { BookmarkSidebar } from './BookmarkSidebar';
import ThemeToggle from '../Navigation/ThemeToggle';
import { useLocalRAGChat } from '../../hooks/useLocalRAGChat';

export const LocalRAGChatInterface: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [chatSessions] = useState<ChatSession[]>(mockChatSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Local RAG Chat Hook
  const { sendMessage, isLoading, error } = useLocalRAGChat({
    chapterId: selectedChapter?.id || '',
    chapterTitle: selectedChapter?.title || '',
    useLocalStorage: true,
  });

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


  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setMessages([]);
    setSelectedSessionId(null);
  };

  const handleNewChat = () => {
    if (!selectedChapter) return;
    
    setMessages([]);
    setSelectedSessionId(null);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChapter || isLoading) return;

    const currentInput = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentInput,
      isBot: false,
      timestamp: new Date(),
      isBookmarked: false,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await sendMessage(
        currentInput,
        selectedChapter.id,
        selectedChapter.title
      );

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.content,
        isBot: true,
        timestamp: new Date(),
        isBookmarked: false,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date(),
        isBookmarked: false,
      };
      setMessages(prev => [...prev, errorMessage]);
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


  const handleBookmarkToggle = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isBookmarked: !msg.isBookmarked }
        : msg
    ));
  };

  const bookmarkedMessages = messages.filter(msg => msg.isBookmarked);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Left Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Physics Chat
            </h2>
            <ThemeToggle />
          </div>
          
          <ChapterSelector 
            selectedChapter={selectedChapter}
            onChapterSelect={handleChapterSelect}
          />
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <ChatHistory
            chatSessions={chatSessions}
            selectedSessionId={selectedSessionId}
            onSessionSelect={(session) => {
              setMessages(session.messages);
              setSelectedSessionId(session.id);
            }}
            onSessionDelete={(sessionId) => {
              console.log('Delete session:', sessionId);
            }}
          />
        </div>

        {/* Bookmark Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            {showBookmarks ? 'Hide' : 'Show'} Bookmarks ({bookmarkedMessages.length})
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChapter ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedChapter.title}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Local storage mode • Content ready
                  </p>
                </div>
                <button
                  onClick={handleNewChat}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onBookmark={handleBookmarkToggle}
                />
              ))}
              
              {isTyping && <TypingIndicator />}
              
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Database className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Start a conversation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ask me anything about {selectedChapter.title}!
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask about ${selectedChapter.title}...`}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                    rows={1}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {error && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Database className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Select a Chapter
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a physics topic to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bookmark Sidebar */}
      {showBookmarks && (
        <BookmarkSidebar
          isOpen={showBookmarks}
          bookmarkedMessages={bookmarkedMessages}
          onClose={() => setShowBookmarks(false)}
          onRemoveBookmark={handleBookmarkToggle}
        />
      )}
    </div>
  );
};