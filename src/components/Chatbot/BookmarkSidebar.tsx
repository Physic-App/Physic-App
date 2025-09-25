import React from 'react';
import { X, BookmarkCheck, Clock } from 'lucide-react';
import { Message } from '../../types/chatbot';
import { MessageRenderer } from './MessageRenderer';

interface BookmarkSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedMessages: Message[];
  onRemoveBookmark: (messageId: string) => void;
}

export const BookmarkSidebar: React.FC<BookmarkSidebarProps> = ({
  isOpen,
  onClose,
  bookmarkedMessages,
  onRemoveBookmark
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 
                      shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <BookmarkCheck size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bookmarked Messages
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                       text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {bookmarkedMessages.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No bookmarked messages yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Bookmark important messages to save them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarkedMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  {/* Timestamp and Remove Button */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock size={14} />
                      <span>
                        {message.timestamp.toLocaleDateString()} at{' '}
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveBookmark(message.id)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 
                                 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove bookmark"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Message Content */}
                  <div className="text-sm">
                    {message.isBot ? (
                      <MessageRenderer content={message.content} />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 italic">
                        "Your question: {message.content}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};