import React, { useState, useCallback } from 'react';
import { Eye, Contrast, Palette, Volume2, VolumeX, Settings } from 'lucide-react';

interface AccessibilitySettingsProps {
  themeMode: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onHighContrastToggle: (enabled: boolean) => void;
  onColorblindModeToggle: (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => void;
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onSoundToggle: (enabled: boolean) => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  themeMode,
  onThemeChange,
  onHighContrastToggle,
  onColorblindModeToggle,
  onFontSizeChange,
  onSoundToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [colorblindMode, setColorblindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleHighContrastToggle = useCallback((enabled: boolean) => {
    setHighContrast(enabled);
    onHighContrastToggle(enabled);
    
    // Apply high contrast styles
    if (enabled) {
      document.documentElement.style.setProperty('--color-primary', '#000000');
      document.documentElement.style.setProperty('--color-secondary', '#ffffff');
      document.documentElement.style.setProperty('--color-background', '#ffffff');
      document.documentElement.style.setProperty('--color-text', '#000000');
      document.documentElement.style.setProperty('--color-border', '#000000');
    } else {
      // Reset to theme colors
      if (themeMode === 'dark') {
        document.documentElement.style.setProperty('--color-primary', '#3b82f6');
        document.documentElement.style.setProperty('--color-secondary', '#1f2937');
        document.documentElement.style.setProperty('--color-background', '#111827');
        document.documentElement.style.setProperty('--color-text', '#f9fafb');
        document.documentElement.style.setProperty('--color-border', '#374151');
      } else {
        document.documentElement.style.setProperty('--color-primary', '#3b82f6');
        document.documentElement.style.setProperty('--color-secondary', '#f3f4f6');
        document.documentElement.style.setProperty('--color-background', '#ffffff');
        document.documentElement.style.setProperty('--color-text', '#111827');
        document.documentElement.style.setProperty('--color-border', '#d1d5db');
      }
    }
  }, [onHighContrastToggle, themeMode]);

  const handleColorblindModeChange = useCallback((mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
    setColorblindMode(mode);
    onColorblindModeToggle(mode);
    
    // Apply colorblind-friendly color filters
    const root = document.documentElement;
    switch (mode) {
      case 'protanopia':
        root.style.filter = 'url(#protanopia-filter)';
        break;
      case 'deuteranopia':
        root.style.filter = 'url(#deuteranopia-filter)';
        break;
      case 'tritanopia':
        root.style.filter = 'url(#tritanopia-filter)';
        break;
      default:
        root.style.filter = 'none';
    }
  }, [onColorblindModeToggle]);

  const handleFontSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    onFontSizeChange(size);
    
    // Apply font size changes
    const root = document.documentElement;
    switch (size) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
    }
  }, [onFontSizeChange]);

  const handleSoundToggle = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    onSoundToggle(enabled);
  }, [onSoundToggle]);

  return (
    <>
      {/* Colorblind Filters (SVG definitions) */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0
                      0.558, 0.442, 0, 0, 0
                      0, 0.242, 0.758, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0
                      0.7, 0.3, 0, 0, 0
                      0, 0.3, 0.7, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05, 0, 0, 0
                      0, 0.433, 0.567, 0, 0
                      0, 0.475, 0.525, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Accessibility Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          themeMode === 'dark' 
            ? 'hover:bg-gray-700 text-gray-300' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        title="Accessibility Settings"
        aria-label="Open accessibility settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Accessibility Settings Panel */}
      {isOpen && (
        <div className={`absolute top-full right-0 mt-2 p-4 rounded-lg border shadow-lg z-50 w-80 ${
          themeMode === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Accessibility Settings
          </h3>
          
          <div className="space-y-4">
            {/* Theme Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Theme
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => onThemeChange('light')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    themeMode === 'light'
                      ? 'bg-blue-600 text-white'
                      : themeMode === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => onThemeChange('dark')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    themeMode === 'dark'
                      ? 'bg-blue-600 text-white'
                      : themeMode === 'light'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* High Contrast Mode */}
            <div>
              <label className={`flex items-center space-x-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => handleHighContrastToggle(e.target.checked)}
                  className={`w-4 h-4 rounded ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-blue-500' 
                      : 'bg-white border-gray-300 text-blue-600'
                  }`}
                />
                <Contrast className="w-4 h-4" />
                <span className="text-sm font-medium">High Contrast Mode</span>
              </label>
              <p className={`text-xs mt-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Increases contrast for better visibility
              </p>
            </div>

            {/* Colorblind Support */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Colorblind Support
              </label>
              <select
                value={colorblindMode}
                onChange={(e) => handleColorblindModeChange(e.target.value as any)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                <option value="tritanopia">Tritanopia (Blue-blind)</option>
              </select>
              <p className={`text-xs mt-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Adjusts colors for colorblind users
              </p>
            </div>

            {/* Font Size */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Font Size
              </label>
              <div className="flex space-x-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      fontSize === size
                        ? 'bg-blue-600 text-white'
                        : themeMode === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Effects */}
            <div>
              <label className={`flex items-center space-x-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => handleSoundToggle(e.target.checked)}
                  className={`w-4 h-4 rounded ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-blue-500' 
                      : 'bg-white border-gray-300 text-blue-600'
                  }`}
                />
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-sm font-medium">Sound Effects</span>
              </label>
              <p className={`text-xs mt-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Enable audio feedback for interactions
              </p>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Keyboard Shortcuts
              </h4>
              <div className={`text-xs space-y-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-800">Ctrl+A</kbd> Select All</div>
                <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-800">Ctrl+C</kbd> Copy</div>
                <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-800">Ctrl+V</kbd> Paste</div>
                <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-800">Delete</kbd> Delete Selected</div>
                <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-800">Arrow Keys</kbd> Move Selected</div>
                <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-800">R</kbd> Rotate Selected</div>
                <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-800">Space</kbd> Start/Stop Simulation</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
