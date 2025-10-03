import React from 'react';
import { ChatInterface } from '../components/Chatbot/ChatInterface';

const Chatbot: React.FC = () => {
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <ChatInterface />
    </div>
  );
};

export default Chatbot;
