import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Volume2, VolumeX, Type, Contrast, ZoomIn, ZoomOut, RotateCcw, Settings, X } from 'lucide-react';

export interface AccessibilityConfig {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  colorBlindSupport: boolean;
  fontSize: number;
  zoomLevel: number;
  audioDescriptions: boolean;
  focusIndicators: boolean;
}

interface AccessibilityFeaturesProps {
  isOpen: boolean;
  onClose: () => void;
  config: AccessibilityConfig;
  onConfigChange: (config: AccessibilityConfig) => void;
}

export const AccessibilityFeatures: React.FC<AccessibilityFeaturesProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'keyboard' | 'advanced'>('visual');

  useEffect(() => {
    // Apply accessibility settings to the document
    applyAccessibilitySettings(config);
  }, [config]);

  const applyAccessibilitySettings = (newConfig: AccessibilityConfig) => {
    const root = document.documentElement;
    
    // High contrast
    if (newConfig.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text
    if (newConfig.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Reduced motion
    if (newConfig.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Color blind support
    if (newConfig.colorBlindSupport) {
      root.classList.add('colorblind-support');
    } else {
      root.classList.remove('colorblind-support');
    }
    
    // Font size
    root.style.setProperty('--font-size-multiplier', newConfig.fontSize.toString());
    
    // Zoom level
    root.style.setProperty('--zoom-level', newConfig.zoomLevel.toString());
    
    // Focus indicators
    if (newConfig.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  };

  const updateConfig = (updates: Partial<AccessibilityConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const resetToDefaults = () => {
    const defaultConfig: AccessibilityConfig = {
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      reducedMotion: false,
      colorBlindSupport: false,
      fontSize: 1,
      zoomLevel: 1,
      audioDescriptions: false,
      focusIndicators: true
    };
    onConfigChange(defaultConfig);
  };

  const announceToScreenReader = (message: string) => {
    if (config.screenReader) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Accessibility Settings</h2>
              <p className="text-blue-200 text-sm">Customize the interface for your needs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close accessibility settings"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-white/20 overflow-y-auto">
            <div className="p-4">
              <nav className="space-y-2">
                {[
                  { id: 'visual', title: 'Visual', icon: Eye },
                  { id: 'audio', title: 'Audio', icon: Volume2 },
                  { id: 'keyboard', title: 'Keyboard', icon: Type },
                  { id: 'advanced', title: 'Advanced', icon: Settings }
                ].map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      activeTab === id 
                        ? 'bg-blue-500/20 border border-blue-400/30' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    aria-pressed={activeTab === id}
                  >
                    <Icon className="w-5 h-5 text-blue-400" />
                    <span className="text-white">{title}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-white/20">
                <button
                  onClick={resetToDefaults}
                  className="w-full flex items-center gap-2 p-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 rounded-lg text-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'visual' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Visual Accessibility</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">High Contrast Mode</h4>
                      <p className="text-blue-200 text-sm">Increase contrast for better visibility</p>
                    </div>
                    <button
                      onClick={() => {
                        updateConfig({ highContrast: !config.highContrast });
                        announceToScreenReader(`High contrast ${!config.highContrast ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.highContrast ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      aria-pressed={config.highContrast}
                      aria-label={`${config.highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Large Text</h4>
                      <p className="text-blue-200 text-sm">Increase text size for better readability</p>
                    </div>
                    <button
                      onClick={() => {
                        updateConfig({ largeText: !config.largeText });
                        announceToScreenReader(`Large text ${!config.largeText ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.largeText ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      aria-pressed={config.largeText}
                      aria-label={`${config.largeText ? 'Disable' : 'Enable'} large text mode`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.largeText ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Color Blind Support</h4>
                      <p className="text-blue-200 text-sm">Use patterns and shapes instead of colors</p>
                    </div>
                    <button
                      onClick={() => {
                        updateConfig({ colorBlindSupport: !config.colorBlindSupport });
                        announceToScreenReader(`Color blind support ${!config.colorBlindSupport ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.colorBlindSupport ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      aria-pressed={config.colorBlindSupport}
                      aria-label={`${config.colorBlindSupport ? 'Disable' : 'Enable'} color blind support`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.colorBlindSupport ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Font Size</h4>
                    <div className="flex items-center gap-4">
                      <ZoomOut className="w-5 h-5 text-blue-400" />
                      <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={config.fontSize}
                        onChange={(e) => {
                          updateConfig({ fontSize: parseFloat(e.target.value) });
                          announceToScreenReader(`Font size set to ${Math.round(parseFloat(e.target.value) * 100)}%`);
                        }}
                        className="flex-1"
                        aria-label="Font size slider"
                      />
                      <ZoomIn className="w-5 h-5 text-blue-400" />
                      <span className="text-white text-sm w-12">{Math.round(config.fontSize * 100)}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Zoom Level</h4>
                    <div className="flex items-center gap-4">
                      <ZoomOut className="w-5 h-5 text-blue-400" />
                      <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={config.zoomLevel}
                        onChange={(e) => {
                          updateConfig({ zoomLevel: parseFloat(e.target.value) });
                          announceToScreenReader(`Zoom level set to ${Math.round(parseFloat(e.target.value) * 100)}%`);
                        }}
                        className="flex-1"
                        aria-label="Zoom level slider"
                      />
                      <ZoomIn className="w-5 h-5 text-blue-400" />
                      <span className="text-white text-sm w-12">{Math.round(config.zoomLevel * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Audio Accessibility</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Screen Reader Support</h4>
                      <p className="text-blue-200 text-sm">Enable screen reader announcements</p>
                    </div>
                    <button
                      onClick={() => {
                        updateConfig({ screenReader: !config.screenReader });
                        announceToScreenReader(`Screen reader support ${!config.screenReader ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.screenReader ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      aria-pressed={config.screenReader}
                      aria-label={`${config.screenReader ? 'Disable' : 'Enable'} screen reader support`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.screenReader ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Audio Descriptions</h4>
                      <p className="text-blue-200 text-sm">Provide audio descriptions of visual elements</p>
                    </div>
                    <button
                      onClick={() => {
                        updateConfig({ audioDescriptions: !config.audioDescriptions });
                        announceToScreenReader(`Audio descriptions ${!config.audioDescriptions ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.audioDescriptions ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      aria-pressed={config.audioDescriptions}
                      aria-label={`${config.audioDescriptions ? 'Disable' : 'Enable'} audio descriptions`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.audioDescriptions ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keyboard' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Keyboard Navigation</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Enhanced Focus Indicators</h4>
                      <p className="text-blue-200 text-sm">Make focus indicators more visible</p>
                    </div>
                    <button
                      onClick={() => {
                        updateConfig({ focusIndicators: !config.focusIndicators });
                        announceToScreenReader(`Enhanced focus indicators ${!config.focusIndicators ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.focusIndicators ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      aria-pressed={config.focusIndicators}
                      aria-label={`${config.focusIndicators ? 'Disable' : 'Enable'} enhanced focus indicators`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.focusIndicators ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Keyboard Shortcuts</h4>
                    <div className="space-y-2 text-sm text-blue-200">
                      <div className="flex justify-between">
                        <span>Navigate simulators:</span>
                        <span className="text-white">1-7</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Show shortcuts:</span>
                        <span className="text-white">Ctrl + ?</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Close dialogs:</span>
                        <span className="text-white">Escape</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fullscreen:</span>
                        <span className="text-white">F11</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reset simulator:</span>
                        <span className="text-white">Ctrl + R</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Advanced Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Reduced Motion</h4>
                      <p className="text-blue-200 text-sm">Reduce animations and transitions</p>
                    </div>
                    <button
                      onClick={() => {
                        updateConfig({ reducedMotion: !config.reducedMotion });
                        announceToScreenReader(`Reduced motion ${!config.reducedMotion ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.reducedMotion ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      aria-pressed={config.reducedMotion}
                      aria-label={`${config.reducedMotion ? 'Disable' : 'Enable'} reduced motion`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Accessibility Information</h4>
                    <div className="text-sm text-blue-200 space-y-2">
                      <p>This simulator is designed to be accessible to users with various needs:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Screen reader compatible</li>
                        <li>Keyboard navigation support</li>
                        <li>High contrast and large text options</li>
                        <li>Color blind friendly design</li>
                        <li>Reduced motion support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Default accessibility configuration
export const defaultAccessibilityConfig: AccessibilityConfig = {
  highContrast: false,
  largeText: false,
  screenReader: false,
  keyboardNavigation: true,
  reducedMotion: false,
  colorBlindSupport: false,
  fontSize: 1,
  zoomLevel: 1,
  audioDescriptions: false,
  focusIndicators: true
};
