import React, { useRef, useEffect } from 'react';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { Vector2D, PhysicsObject, ForceVector } from '../../../../types/physics';

interface DataVisualizationProps {
  object: PhysicsObject;
  forces: ForceVector[];
  timeElapsed: number;
  trajectoryPoints: Vector2D[];
  isRunning: boolean;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  object,
  forces,
  timeElapsed,
  trajectoryPoints,
  isRunning
}) => {
  const velocityCanvasRef = useRef<HTMLCanvasElement>(null);
  const energyCanvasRef = useRef<HTMLCanvasElement>(null);

  // Early return if object is undefined
  if (!object) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Data Visualization</h3>
        </div>
        <div className="text-slate-400 text-center py-8">
          No data available
        </div>
      </div>
    );
  }

  // Calculate derived values with error handling
  const speed = Math.sqrt(
    (object?.velocity?.x || 0) ** 2 + (object?.velocity?.y || 0) ** 2
  );
  const acceleration = Math.sqrt(
    (object?.acceleration?.x || 0) ** 2 + (object?.acceleration?.y || 0) ** 2
  );
  const netForce = (forces || []).reduce((net, force) => ({
    x: net.x + (force?.vector?.x || 0),
    y: net.y + (force?.vector?.y || 0)
  }), { x: 0, y: 0 });
  const netForceMagnitude = Math.sqrt(netForce.x ** 2 + netForce.y ** 2);
  const kineticEnergy = 0.5 * (object?.mass || 1) * speed * speed;
  const potentialEnergy = (object?.mass || 1) * 9.81 * Math.max(0, object?.position?.y || 0);

  // Draw velocity vs time graph
  useEffect(() => {
    const canvas = velocityCanvasRef.current;
    if (!canvas) {
      console.warn('Velocity canvas ref is null');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context from velocity canvas');
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 40);
    ctx.stroke();

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x = 40 + (i * (width - 60) / 10);
      const y = 20 + (i * (height - 60) / 10);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 40);
      ctx.moveTo(40, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // Draw velocity curve
    if (trajectoryPoints.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const maxTime = Math.max(10, timeElapsed);
      const maxVelocity = Math.max(10, speed);
      
      trajectoryPoints.forEach((point, index) => {
        const t = (index * 0.016); // Assuming 60fps
        const v = Math.sqrt(point.x ** 2 + point.y ** 2); // Approximate velocity
        const x = 40 + (t / maxTime) * (width - 60);
        const y = height - 40 - (v / maxVelocity) * (height - 60);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (s)', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Velocity (m/s)', 0, 0);
    ctx.restore();
  }, [trajectoryPoints, timeElapsed, speed]);


  // Draw energy vs time graph
  useEffect(() => {
    const canvas = energyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 40);
    ctx.stroke();

    // Draw energy curves
    if (trajectoryPoints.length > 1) {
      const maxTime = Math.max(10, timeElapsed);
      const maxEnergy = Math.max(100, kineticEnergy + potentialEnergy);
      
      // Kinetic energy
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      trajectoryPoints.forEach((point, index) => {
        const t = (index * 0.016);
        const ke = 0.5 * object.mass * (point.x ** 2 + point.y ** 2); // Approximate KE
        const x = 40 + (t / maxTime) * (width - 60);
        const y = height - 40 - (ke / maxEnergy) * (height - 60);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Potential energy
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      trajectoryPoints.forEach((point, index) => {
        const t = (index * 0.016);
        const pe = object.mass * 9.81 * Math.max(0, point.y);
        const x = 40 + (t / maxTime) * (width - 60);
        const y = height - 40 - (pe / maxEnergy) * (height - 60);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Legend
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width - 120, 30, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Kinetic', width - 105, 40);
    
    ctx.fillStyle = '#10b981';
    ctx.fillRect(width - 120, 50, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Potential', width - 105, 60);

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (s)', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Energy (J)', 0, 0);
    ctx.restore();
  }, [trajectoryPoints, timeElapsed, kineticEnergy, potentialEnergy, object?.mass]);

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Data Visualization</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Velocity Graph */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-medium text-slate-300">Velocity vs Time</h4>
          </div>
          <canvas
            ref={velocityCanvasRef}
            width={300}
            height={150}
            className="border border-slate-600 rounded bg-slate-900 w-full"
          />
        </div>


        {/* Energy Graph */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-medium text-slate-300">Energy vs Time</h4>
          </div>
          <canvas
            ref={energyCanvasRef}
            width={300}
            height={150}
            className="border border-slate-600 rounded bg-slate-900 w-full"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Current Values</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Speed:</span>
            <span className="text-white font-mono">{speed.toFixed(2)} m/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Acceleration:</span>
            <span className="text-white font-mono">{acceleration.toFixed(2)} m/s²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Net Force:</span>
            <span className="text-white font-mono">{netForceMagnitude.toFixed(2)} N</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Kinetic Energy:</span>
            <span className="text-white font-mono">{kineticEnergy.toFixed(2)} J</span>
          </div>
        </div>
      </div>
    </div>
  );
};
