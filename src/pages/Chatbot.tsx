import React from 'react';
<<<<<<< HEAD
import { ChatInterface } from '../components/Chatbot/ChatInterface';
=======
import { LocalRAGChatInterface } from '../components/Chatbot/LocalRAGChatInterface';
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

const Chatbot: React.FC = () => {
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
<<<<<<< HEAD
      <ChatInterface />
=======
      <LocalRAGChatInterface />
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
    </div>
  );
};

export default Chatbot;
