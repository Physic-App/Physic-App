import React, { useState, useEffect } from 'react';

interface KeyboardShortcutsProps {
  shortcuts: Array<{
    key: string;
    description: string;
    action: () => void;
  }>;
  className?: string;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ 
  shortcuts, 
  className = "" 
}) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check for Ctrl/Cmd + ? for help
      if ((event.ctrlKey || event.metaKey) && event.key === '?') {
        event.preventDefault();
        setShowHelp(!showHelp);
        return;
      }

      // Check for Escape to close help
      if (event.key === 'Escape' && showHelp) {
        setShowHelp(false);
        return;
      }

      // Check for registered shortcuts
      shortcuts.forEach(shortcut => {
        if (event.key === shortcut.key && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, showHelp]);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className={`fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 ${className}`}
        title="Keyboard Shortcuts (Ctrl+?)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-600">
                <span className="text-gray-300">Ctrl + ?</span>
                <span className="text-white">Show/Hide this help</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-600">
                <span className="text-gray-300">Escape</span>
                <span className="text-white">Close help</span>
              </div>
              
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 font-mono bg-gray-700 px-2 py-1 rounded">
                    {shortcut.key}
                  </span>
                  <span className="text-white">{shortcut.description}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
              <p className="text-blue-200 text-sm">
                💡 Press <kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-1 rounded">?</kbd> anytime to toggle this help panel.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
