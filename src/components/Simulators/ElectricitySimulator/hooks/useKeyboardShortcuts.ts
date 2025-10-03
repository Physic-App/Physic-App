import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useKeyboardShortcuts = ({ 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            if (event.shiftKey && canRedo) {
              onRedo();
            } else if (canUndo) {
              onUndo();
            }
            break;
          case 'y':
            event.preventDefault();
            if (canRedo) {
              onRedo();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, canUndo, canRedo]);
};

