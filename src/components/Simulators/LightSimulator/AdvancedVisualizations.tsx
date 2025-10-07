import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Download, Settings, Zap, Target, Waves } from 'lucide-react';

export interface VisualizationConfig {
  showElectricField: boolean;
  showMagneticField: boolean;
  showWavefronts: boolean;
  showPolarization: boolean;
  showIntensity: boolean;
  showPhase: boolean;
  animationSpeed: number;
  colorScheme: 'default' | 'rainbow' | 'thermal' | 'grayscale';
  opacity: number;
  resolution: 'low' | 'medium' | 'high';
}

interface AdvancedVisualizationsProps {
  config: VisualizationConfig;
  onConfigChange: (config: VisualizationConfig) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  simulationType: string;
}

export const AdvancedVisualizations: React.FC<AdvancedVisualizationsProps> = ({
  config,
  onConfigChange,
  canvasRef,
  simulationType
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const updateConfig = (updates: Partial<VisualizationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const renderElectricField = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!config.showElectricField) return;

    const fieldStrength = 50;
    const wavelength = 100;
    
    ctx.save();
    ctx.strokeStyle = `rgba(255, 0, 0, ${config.opacity})`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 10; i++) {
      const phase = (i / 10) * Math.PI * 2;
      const amplitude = Math.sin(phase) * fieldStrength;
      
      ctx.beginPath();
      ctx.moveTo(x - amplitude, y + i * 10);
      ctx.lineTo(x + amplitude, y + i * 10);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const renderMagneticField = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!config.showMagneticField) return;

    const fieldStrength = 50;
    const wavelength = 100;
    
    ctx.save();
    ctx.strokeStyle = `rgba(0, 0, 255, ${config.opacity})`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 10; i++) {
      const phase = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const amplitude = Math.sin(phase) * fieldStrength;
      
      ctx.beginPath();
      ctx.moveTo(x + i * 10, y - amplitude);
      ctx.lineTo(x + i * 10, y + amplitude);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const renderWavefronts = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!config.showWavefronts) return;

    ctx.save();
    ctx.strokeStyle = `rgba(0, 255, 0, ${config.opacity})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    for (let i = 1; i <= 5; i++) {
      const radius = i * 20;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const renderPolarization = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!config.showPolarization) return;

    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 0, ${config.opacity})`;
    ctx.lineWidth = 3;
    
    // Draw polarization vector
    const length = 30;
    const angle = Math.PI / 4; // 45 degrees
    
    ctx.beginPath();
    ctx.moveTo(x - length * Math.cos(angle), y - length * Math.sin(angle));
    ctx.lineTo(x + length * Math.cos(angle), y + length * Math.sin(angle));
    ctx.stroke();
    
    // Draw perpendicular line
    ctx.beginPath();
    ctx.moveTo(x - length * Math.sin(angle), y + length * Math.cos(angle));
    ctx.lineTo(x + length * Math.sin(angle), y - length * Math.cos(angle));
    ctx.stroke();
    
    ctx.restore();
  };

  const renderIntensity = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!config.showIntensity) return;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
    
    switch (config.colorScheme) {
      case 'rainbow':
        gradient.addColorStop(0, `rgba(255, 0, 0, ${config.opacity})`);
        gradient.addColorStop(0.5, `rgba(0, 255, 0, ${config.opacity})`);
        gradient.addColorStop(1, `rgba(0, 0, 255, ${config.opacity})`);
        break;
      case 'thermal':
        gradient.addColorStop(0, `rgba(255, 0, 0, ${config.opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 0, ${config.opacity})`);
        gradient.addColorStop(1, `rgba(0, 0, 255, ${config.opacity})`);
        break;
      case 'grayscale':
        gradient.addColorStop(0, `rgba(255, 255, 255, ${config.opacity})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${config.opacity})`);
        break;
      default:
        gradient.addColorStop(0, `rgba(59, 130, 246, ${config.opacity})`);
        gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
    }
    
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const renderPhase = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!config.showPhase) return;

    ctx.save();
    
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const phase = (i + j) * 0.3;
        const intensity = (Math.sin(phase) + 1) / 2;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${intensity * config.opacity})`;
        ctx.fillRect(x + i * 5 - 50, y + j * 5 - 50, 5, 5);
      }
    }
    
    ctx.restore();
  };

  // Apply visualizations to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear previous visualizations
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render visualizations based on simulation type
    switch (simulationType) {
      case 'reflection':
        renderWavefronts(ctx, centerX, centerY);
        renderIntensity(ctx, centerX, centerY);
        break;
      case 'refraction':
        renderElectricField(ctx, centerX, centerY);
        renderMagneticField(ctx, centerX, centerY);
        renderWavefronts(ctx, centerX, centerY);
        break;
      case 'polarization':
        renderPolarization(ctx, centerX, centerY);
        renderElectricField(ctx, centerX, centerY);
        break;
      case 'diffraction':
        renderIntensity(ctx, centerX, centerY);
        renderPhase(ctx, centerX, centerY);
        break;
      default:
        renderWavefronts(ctx, centerX, centerY);
        renderIntensity(ctx, centerX, centerY);
    }
  }, [config, simulationType, canvasRef]);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/30 hover:bg-blue-500/30 transition-all duration-300 shadow-lg"
        title="Advanced Visualizations"
      >
        <Zap className="w-6 h-6 text-blue-400" />
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Advanced Visualizations</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-blue-300" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Close"
              >
                <EyeOff className="w-4 h-4 text-blue-300" />
              </button>
            </div>
          </div>

          {/* Visualization Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Electric Field</span>
              <button
                onClick={() => updateConfig({ showElectricField: !config.showElectricField })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  config.showElectricField ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  config.showElectricField ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Magnetic Field</span>
              <button
                onClick={() => updateConfig({ showMagneticField: !config.showMagneticField })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  config.showMagneticField ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  config.showMagneticField ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Wavefronts</span>
              <button
                onClick={() => updateConfig({ showWavefronts: !config.showWavefronts })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  config.showWavefronts ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  config.showWavefronts ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Polarization</span>
              <button
                onClick={() => updateConfig({ showPolarization: !config.showPolarization })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  config.showPolarization ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  config.showPolarization ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Intensity</span>
              <button
                onClick={() => updateConfig({ showIntensity: !config.showIntensity })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  config.showIntensity ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  config.showIntensity ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Phase</span>
              <button
                onClick={() => updateConfig({ showPhase: !config.showPhase })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  config.showPhase ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  config.showPhase ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <h4 className="text-sm font-semibold text-white mb-3">Settings</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-blue-200 text-sm">Opacity</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.opacity}
                    onChange={(e) => updateConfig({ opacity: parseFloat(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <label className="text-blue-200 text-sm">Color Scheme</label>
                  <select
                    value={config.colorScheme}
                    onChange={(e) => updateConfig({ colorScheme: e.target.value as any })}
                    className="w-full mt-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                  >
                    <option value="default">Default</option>
                    <option value="rainbow">Rainbow</option>
                    <option value="thermal">Thermal</option>
                    <option value="grayscale">Grayscale</option>
                  </select>
                </div>

                <div>
                  <label className="text-blue-200 text-sm">Animation Speed</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={config.animationSpeed}
                    onChange={(e) => updateConfig({ animationSpeed: parseFloat(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Default configuration
export const defaultVisualizationConfig: VisualizationConfig = {
  showElectricField: false,
  showMagneticField: false,
  showWavefronts: true,
  showPolarization: false,
  showIntensity: true,
  showPhase: false,
  animationSpeed: 1.0,
  colorScheme: 'default',
  opacity: 0.7,
  resolution: 'medium'
};
