import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-6">
      <div className="flex max-w-4xl">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 dark:bg-blue-500">
            <Bot size={20} className="text-white" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                        rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              AI is thinking...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};