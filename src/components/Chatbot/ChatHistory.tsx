import React from 'react';
import { History, MessageSquare, Clock, Trash2 } from 'lucide-react';
import { ChatSession } from '../../types/chatbot';

interface ChatHistoryProps {
  chatSessions: ChatSession[];
  selectedSessionId: string | null;
  onSessionSelect: (session: ChatSession) => void;
  onSessionDelete: (sessionId: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatSessions,
  selectedSessionId,
  onSessionSelect,
  onSessionDelete
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <History size={20} className="text-green-600 dark:text-green-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Chat History
        </h2>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {chatSessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No chat history yet
            </p>
          </div>
        ) : (
          chatSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedSessionId === session.id
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSessionSelect(session)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${
                    selectedSessionId === session.id
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {session.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock size={12} className={
                      selectedSessionId === session.id
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                    } />
                    <span className={`text-xs ${
                      selectedSessionId === session.id
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatDate(session.lastActivity)}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    selectedSessionId === session.id
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionDelete(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all duration-200"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};