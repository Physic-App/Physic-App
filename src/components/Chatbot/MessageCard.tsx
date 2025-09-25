import React from 'react';
import { Copy, Share2, Bookmark, BookmarkCheck, User, Bot } from 'lucide-react';
import { Message } from '../../types/chatbot';
import { MessageRenderer } from './MessageRenderer';

interface MessageCardProps {
  message: Message;
  onBookmark: (messageId: string) => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message, onBookmark }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Failed to copy text
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Physics Chat Message',
          text: message.content,
        });
      } catch {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  return (
    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-4xl ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.isBot ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            message.isBot 
              ? 'bg-blue-600 dark:bg-blue-500' 
              : 'bg-gray-600 dark:bg-gray-500'
          }`}>
            {message.isBot ? (
              <Bot size={20} className="text-white" />
            ) : (
              <User size={20} className="text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`group relative ${
          message.isBot 
            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700' 
            : 'bg-blue-600 dark:bg-blue-700 text-white'
        } rounded-2xl px-4 py-3 shadow-sm`}>
          
          {/* Message Text */}
          <div className={message.isBot ? '' : 'text-white'}>
            {message.isBot ? (
              <MessageRenderer content={message.content} />
            ) : (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}
          </div>

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${
            message.isBot 
              ? 'text-gray-500 dark:text-gray-400' 
              : 'text-blue-100'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>

          {/* Action Buttons */}
          <div className={`absolute top-2 ${
            message.isBot ? 'right-2' : 'left-2'
          } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            <div className="flex space-x-1">
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-md transition-colors duration-200 ${
                  message.isBot
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    : 'hover:bg-blue-500 text-blue-100 hover:text-white'
                }`}
                title={copied ? 'Copied!' : 'Copy message'}
              >
                <Copy size={14} />
              </button>
              
              <button
                onClick={handleShare}
                className={`p-1.5 rounded-md transition-colors duration-200 ${
                  message.isBot
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    : 'hover:bg-blue-500 text-blue-100 hover:text-white'
                }`}
                title="Share message"
              >
                <Share2 size={14} />
              </button>
              
              <button
                onClick={() => onBookmark(message.id)}
                className={`p-1.5 rounded-md transition-colors duration-200 ${
                  message.isBot
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    : 'hover:bg-blue-500 text-blue-100 hover:text-white'
                }`}
                title={message.isBookmarked ? 'Remove bookmark' : 'Bookmark message'}
              >
                {message.isBookmarked ? (
                  <BookmarkCheck size={14} />
                ) : (
                  <Bookmark size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};