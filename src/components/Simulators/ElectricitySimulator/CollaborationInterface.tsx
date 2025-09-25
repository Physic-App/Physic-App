import React, { useState, useCallback } from 'react';
import { User, CollaborationSession, ConflictResolution, ConflictOption } from './utils/collaborationSystem';
import { 
  Users, 
  MessageCircle, 
  AlertTriangle, 
  XCircle, 
  MoreHorizontal,
  UserPlus,
  Mic,
  MicOff,
  Video,
  VideoOff
} from 'lucide-react';

interface CollaborationInterfaceProps {
  session: CollaborationSession | null;
  participants: User[];
  currentUser: User | null;
  isConnected: boolean;
  onSendMessage: (message: string) => void;
  onResolveConflict: (conflictId: string, resolution: ConflictOption) => void;
  themeMode: 'light' | 'dark';
}

export const CollaborationInterface: React.FC<CollaborationInterfaceProps> = ({
  participants,
  currentUser,
  isConnected,
  onSendMessage,
  onResolveConflict,
  themeMode
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; message: string; userId: string; timestamp: Date }>>([]);
  const [activeConflicts, setActiveConflicts] = useState<ConflictResolution[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  // Handle chat message
  const handleSendMessage = useCallback(() => {
    if (chatMessage.trim() && currentUser) {
      const message = {
        id: Date.now().toString(),
        message: chatMessage.trim(),
        userId: currentUser.id,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, message]);
      onSendMessage(chatMessage.trim());
      setChatMessage('');
    }
  }, [chatMessage, currentUser, onSendMessage]);

  // Handle conflict resolution
  const handleConflictResolution = useCallback((conflictId: string, option: ConflictOption) => {
    onResolveConflict(conflictId, option);
    setActiveConflicts(prev => prev.filter(c => c.id !== conflictId));
  }, [onResolveConflict]);

  // Format timestamp
  const formatTimestamp = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get user by ID
  const getUserById = (userId: string): User | undefined => {
    return participants.find(p => p.id === userId);
  };

  // Get user color
  const getUserColor = (userId: string): string => {
    const user = getUserById(userId);
    return user?.color || '#6b7280';
  };

  // Get user name
  const getUserName = (userId: string): string => {
    const user = getUserById(userId);
    return user?.name || 'Unknown User';
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Connection Status */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
        isConnected
          ? themeMode === 'dark'
            ? 'bg-green-900/20 border border-green-700 text-green-300'
            : 'bg-green-50 border border-green-200 text-green-800'
          : themeMode === 'dark'
            ? 'bg-red-900/20 border border-red-700 text-red-300'
            : 'bg-red-50 border border-red-200 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Participants Button */}
      <button
        onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
          themeMode === 'dark'
            ? 'bg-gray-800 border-gray-700 hover:border-blue-500 text-gray-300'
            : 'bg-white border-gray-200 hover:border-blue-500 text-gray-700'
        }`}
        title="Participants"
      >
        <Users className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {participants.length}
        </span>
      </button>

      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
          themeMode === 'dark'
            ? 'bg-gray-800 border-gray-700 hover:border-blue-500 text-gray-300'
            : 'bg-white border-gray-200 hover:border-blue-500 text-gray-700'
        }`}
        title="Chat"
      >
        <MessageCircle className="w-5 h-5" />
        {chatMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {chatMessages.length}
          </span>
        )}
      </button>

      {/* Conflicts Button */}
      {activeConflicts.length > 0 && (
        <button
          onClick={() => setShowConflicts(!showConflicts)}
          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
            themeMode === 'dark'
              ? 'bg-red-900/20 border-red-700 hover:border-red-500 text-red-300'
              : 'bg-red-50 border-red-200 hover:border-red-500 text-red-800'
          }`}
          title="Conflicts"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeConflicts.length}
          </span>
        </button>
      )}

      {/* Media Controls */}
      <div className={`p-2 rounded-lg border ${
        themeMode === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded transition-colors duration-200 ${
              isMuted
                ? 'bg-red-500 text-white'
                : themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-2 rounded transition-colors duration-200 ${
              isVideoOn
                ? 'bg-green-500 text-white'
                : themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={isVideoOn ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Participants Panel */}
      {isParticipantsOpen && (
        <div className={`absolute top-full right-0 mt-2 w-80 p-4 rounded-lg border shadow-lg ${
          themeMode === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Participants ({participants.length})
            </h3>
            <button
              onClick={() => setIsParticipantsOpen(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {participants.map(participant => (
              <div
                key={participant.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  themeMode === 'dark'
                    ? 'bg-gray-700'
                    : 'bg-gray-50'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: participant.color }}
                >
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{participant.name}</span>
                    {participant.id === currentUser?.id && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        You
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className={themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {participant.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <button className="p-1 rounded hover:bg-gray-100">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
              <UserPlus className="w-4 h-4 inline mr-2" />
              Invite Participants
            </button>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isChatOpen && (
        <div className={`absolute top-full right-0 mt-2 w-80 h-96 flex flex-col rounded-lg border shadow-lg ${
          themeMode === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Chat
            </h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map(message => (
              <div
                key={message.id}
                className={`flex space-x-3 ${
                  message.userId === currentUser?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.userId !== currentUser?.id && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: getUserColor(message.userId) }}
                  >
                    {getUserName(message.userId).charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className={`max-w-xs ${
                  message.userId === currentUser?.id ? 'order-first' : ''
                }`}>
                  {message.userId !== currentUser?.id && (
                    <div className="text-xs font-medium mb-1" style={{ color: getUserColor(message.userId) }}>
                      {getUserName(message.userId)}
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-lg ${
                    message.userId === currentUser?.id
                      ? 'bg-blue-500 text-white'
                      : themeMode === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.message}
                  </div>
                  
                  <div className={`text-xs mt-1 ${
                    themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflicts Panel */}
      {showConflicts && activeConflicts.length > 0 && (
        <div className={`absolute top-full right-0 mt-2 w-96 p-4 rounded-lg border shadow-lg ${
          themeMode === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Conflicts ({activeConflicts.length})
            </h3>
            <button
              onClick={() => setShowConflicts(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {activeConflicts.map(conflict => (
              <div
                key={conflict.id}
                className={`p-4 rounded-lg border ${
                  themeMode === 'dark'
                    ? 'bg-red-900/20 border-red-700'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-2">
                      {conflict.type.replace('_', ' ').toUpperCase()}
                    </h4>
                    <p className="text-sm text-red-700 mb-3">
                      {conflict.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-red-800">
                        Resolution Options:
                      </div>
                      {conflict.options.map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleConflictResolution(conflict.id, option)}
                          className={`w-full p-3 rounded-lg border-2 transition-colors duration-200 ${
                            themeMode === 'dark'
                              ? 'bg-gray-700 border-gray-600 hover:border-blue-500 text-gray-300'
                              : 'bg-white border-gray-200 hover:border-blue-500 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option.description}</span>
                            <span className="text-xs opacity-75">
                              by {getUserName(option.userId)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
