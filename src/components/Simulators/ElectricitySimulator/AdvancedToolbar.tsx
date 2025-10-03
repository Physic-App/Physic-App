import React, { useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid, 
  Grid3X3, 
  Move, 
  Maximize2,
  Minimize2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdvancedToolbarProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onResetView: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AdvancedToolbar: React.FC<AdvancedToolbarProps> = ({
  zoomLevel,
  onZoomChange,
  onPan,
  onResetView,
  showGrid,
  onToggleGrid,
  gridSize,
  onGridSizeChange,
  themeMode,
  onToggleTheme
}) => {
  const [isPanMode, setIsPanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400];
  const gridSizes = [10, 20, 25, 50, 100];

  const handleZoomIn = useCallback(() => {
    const currentIndex = zoomLevels.findIndex(level => level >= zoomLevel);
    const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
    onZoomChange(zoomLevels[nextIndex]);
  }, [zoomLevel, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = zoomLevels.findIndex(level => level >= zoomLevel);
    const prevIndex = Math.max(currentIndex - 1, 0);
    onZoomChange(zoomLevels[prevIndex]);
  }, [zoomLevel, onZoomChange]);

  const handleZoomToFit = useCallback(() => {
    onZoomChange(100);
    onResetView();
  }, [onZoomChange, onResetView]);

  const handleZoomToSelection = useCallback(() => {
    // This would be implemented to zoom to selected components
    onZoomChange(150);
  }, [onZoomChange]);

  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const panAmount = 50;
    switch (direction) {
      case 'up':
        onPan(0, -panAmount);
        break;
      case 'down':
        onPan(0, panAmount);
        break;
      case 'left':
        onPan(-panAmount, 0);
        break;
      case 'right':
        onPan(panAmount, 0);
        break;
    }
  }, [onPan]);

  return (
    <div className={`flex items-center space-x-4 p-4 rounded-xl border shadow-lg ${
      themeMode === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Zoom:
        </span>
        
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= zoomLevels[0]}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            zoomLevel > zoomLevels[0]
              ? themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
              : themeMode === 'dark' 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <select
          value={zoomLevel}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className={`px-3 py-1 rounded-lg border text-sm ${
            themeMode === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          aria-label="Zoom level"
        >
          {zoomLevels.map(level => (
            <option key={level} value={level}>
              {level}%
            </option>
          ))}
        </select>
        
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= zoomLevels[zoomLevels.length - 1]}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            zoomLevel < zoomLevels[zoomLevels.length - 1]
              ? themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
              : themeMode === 'dark' 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-400" />

      {/* View Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleZoomToFit}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            themeMode === 'dark' 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Zoom to Fit"
          aria-label="Zoom to fit all components"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleZoomToSelection}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            themeMode === 'dark' 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Zoom to Selection"
          aria-label="Zoom to selected components"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={onResetView}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            themeMode === 'dark' 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Reset View"
          aria-label="Reset view to default"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-400" />

      {/* Pan Controls */}
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Pan:
        </span>
        
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => handlePan('up')}
            className={`p-1 rounded transition-colors duration-200 ${
              themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Pan Up"
            aria-label="Pan up"
          >
            ↑
          </button>
          <button
            onClick={() => handlePan('left')}
            className={`p-1 rounded transition-colors duration-200 ${
              themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Pan Left"
            aria-label="Pan left"
          >
            ←
          </button>
          <button
            onClick={() => handlePan('right')}
            className={`p-1 rounded transition-colors duration-200 ${
              themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Pan Right"
            aria-label="Pan right"
          >
            →
          </button>
          <button
            onClick={() => handlePan('down')}
            className={`p-1 rounded transition-colors duration-200 col-start-2 ${
              themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Pan Down"
            aria-label="Pan down"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="w-px h-6 bg-gray-400" />

      {/* Grid Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleGrid}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            showGrid
              ? themeMode === 'dark' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-600 text-white'
              : themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Toggle Grid"
          aria-label={showGrid ? "Hide grid" : "Show grid"}
        >
          {showGrid ? <Grid className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
        </button>
        
        {showGrid && (
          <select
            value={gridSize}
            onChange={(e) => onGridSizeChange(Number(e.target.value))}
            className={`px-2 py-1 rounded border text-sm ${
              themeMode === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            aria-label="Grid size"
          >
            {gridSizes.map(size => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="w-px h-6 bg-gray-400" />

      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          themeMode === 'dark' 
            ? 'hover:bg-gray-700 text-gray-300' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} theme`}
        aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} theme`}
      >
        {themeMode === 'dark' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      {/* Settings */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          showSettings
            ? themeMode === 'dark' 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-100 text-gray-700'
            : themeMode === 'dark' 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
        }`}
        title="Settings"
        aria-label="Open settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`absolute top-full right-0 mt-2 p-4 rounded-lg border shadow-lg z-50 ${
          themeMode === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Canvas Settings
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Default Zoom Level
              </label>
              <select
                defaultValue={100}
                className={`w-full px-2 py-1 rounded border text-sm ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-xs font-medium mb-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Snap to Grid
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className={`w-3 h-3 rounded ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-blue-500' 
                      : 'bg-white border-gray-300 text-blue-600'
                  }`}
                />
                <span className={`text-xs ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enable snap to grid
                </span>
              </label>
            </div>
            
            <div>
              <label className={`block text-xs font-medium mb-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Show Component Labels
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className={`w-3 h-3 rounded ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-blue-500' 
                      : 'bg-white border-gray-300 text-blue-600'
                  }`}
                />
                <span className={`text-xs ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Show component labels
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
