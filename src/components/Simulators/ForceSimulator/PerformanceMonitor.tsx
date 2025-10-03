import React, { useEffect, useRef, useState } from 'react';
import { Activity, Zap } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  renderTime: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    renderTime: 0
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      frameCountRef.current++;

      if (deltaTime >= 1000) { // Update every second
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        const frameTime = deltaTime / frameCountRef.current;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
          memoryUsage: (performance as any).memory ? 
            Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : undefined
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationIdRef.current = requestAnimationFrame(updateMetrics);
    };

    animationIdRef.current = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 p-3 bg-slate-800 hover:bg-slate-700 rounded-full shadow-lg transition-colors z-50"
        title="Show Performance Monitor"
      >
        <Activity className="w-5 h-5 text-slate-300" />
      </button>
    );
  }

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFrameTimeColor = (frameTime: number) => {
    if (frameTime <= 16.67) return 'text-green-400'; // 60 FPS
    if (frameTime <= 33.33) return 'text-yellow-400'; // 30 FPS
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-slate-700 z-50 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Performance</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">FPS:</span>
          <span className={`font-mono font-semibold ${getFpsColor(metrics.fps)}`}>
            {metrics.fps}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Frame Time:</span>
          <span className={`font-mono font-semibold ${getFrameTimeColor(metrics.frameTime)}`}>
            {metrics.frameTime}ms
          </span>
        </div>

        {metrics.memoryUsage && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Memory:</span>
            <span className="font-mono font-semibold text-slate-300">
              {metrics.memoryUsage}MB
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Status:</span>
            <span className={`font-semibold ${
              metrics.fps >= 55 ? 'text-green-400' : 
              metrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {metrics.fps >= 55 ? 'Excellent' : 
               metrics.fps >= 30 ? 'Good' : 'Poor'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
