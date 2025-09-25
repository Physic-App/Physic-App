import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Globe, Zap } from 'lucide-react';
import { PhysicsEngine } from '../../../../utils/physics';
import { SimulationState, Vector2D, PhysicsObject } from '../../../../types/physics';
import { DataVisualization } from '../DataVisualization';

interface GravitySimulatorProps {
  settings: any;
}

export const GravitySimulator: React.FC<GravitySimulatorProps> = ({ settings }) => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    object: {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      mass: 1.0,
      radius: 0.3,
      material: 'metal',
      temperature: 20
    },
    forces: [],
    appliedForce: 0,
    inclineAngle: 0,
    frictionCoefficient: 0,
    surfaceType: 'smooth',
    isRunning: false,
    currentLaw: 'second',
    showVectors: true,
    simulationSpeed: 1.0,
    environment: 'earth',
    airResistance: false,
    showTrajectory: true,
    showGrid: true,
    showMeasurements: true,
    vectorScale: 1.0,
    timeElapsed: 0,
    netForce: { x: 0, y: 0 }
  });

  const [trajectoryPoints, setTrajectoryPoints] = useState<Vector2D[]>([]);
  const [gravityType, setGravityType] = useState<'free-fall' | 'projectile' | 'orbit'>('free-fall');
  const [initialVelocity, setInitialVelocity] = useState({ x: 0, y: 0 });
  const [launchAngle, setLaunchAngle] = useState(45);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpdateState = useCallback((updates: Partial<SimulationState>) => {
    setSimulationState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      object: {
        ...prev.object,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 }
      },
      isRunning: false,
      timeElapsed: 0
    }));
    setTrajectoryPoints([]);
  }, []);

  const handleLaunch = () => {
    const angleRad = (launchAngle * Math.PI) / 180;
    const speed = Math.sqrt(initialVelocity.x ** 2 + initialVelocity.y ** 2);
    
    setSimulationState(prev => ({
      ...prev,
      isRunning: true,
      object: {
        ...prev.object,
        position: { x: -8, y: 8 }, // Start higher for better free fall demonstration
        velocity: {
          x: speed * Math.cos(angleRad),
          y: speed * Math.sin(angleRad)
        },
        acceleration: { x: 0, y: 0 }
      }
    }));
    setTrajectoryPoints([]);
  };

  const handleToggleRun = useCallback(() => {
    setSimulationState(prev => {
      const newState = { ...prev, isRunning: !prev.isRunning };
      
      // If starting simulation and it's free fall mode, set proper initial conditions
      if (!prev.isRunning && gravityType === 'free-fall') {
        newState.object = {
          ...prev.object,
          position: { x: 0, y: 8 }, // Start high for free fall
          velocity: { x: 0, y: 0 }, // Start at rest
          acceleration: { x: 0, y: 0 }
        };
      }
      
      return newState;
    });
  }, [gravityType]);

  // Animation loop
  useEffect(() => {
    if (!simulationState.isRunning) return;

    const animate = () => {
      setSimulationState(prev => {
        // For gravity simulation, we only need gravitational force
        const gravity = PhysicsEngine.getGravity(prev.environment);
        const gravitationalForce = {
          x: 0,
          y: -prev.object.mass * gravity // Negative Y for downward gravity
        };

        const updatedObject = PhysicsEngine.updatePhysicsObject(
          prev.object,
          gravitationalForce,
          PhysicsEngine.TIME_STEP * prev.simulationSpeed,
          { width: 600, height: 400 }
        );

        // Calculate net force for display (should equal gravitational force)
        const netForce = {
          x: gravitationalForce.x,
          y: gravitationalForce.y
        };

        // Update trajectory
        setTrajectoryPoints(points => {
          const newPoints = [...points, { ...updatedObject.position }];
          return newPoints.slice(-500);
        });

        return { 
          ...prev, 
          object: updatedObject,
          timeElapsed: prev.timeElapsed + PhysicsEngine.TIME_STEP * prev.simulationSpeed,
          netForce: netForce
        };
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [simulationState.isRunning, simulationState.simulationSpeed, simulationState.environment]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (settings.showGrid) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw ground
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.stroke();

    // Draw trajectory
    if (settings.showTrajectory && trajectoryPoints.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      trajectoryPoints.forEach((point, index) => {
        const screenX = canvas.width / 2 + point.x * 30;
        const screenY = canvas.height / 2 - point.y * 30;
        
        if (index === 0) {
          ctx.moveTo(screenX, screenY);
        } else {
          ctx.lineTo(screenX, screenY);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw object
    const screenX = canvas.width / 2 + simulationState.object.position.x * 30;
    const screenY = canvas.height / 2 - simulationState.object.position.y * 30;
    const size = simulationState.object.radius * 25;

    // Object shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(screenX + 3, screenY + 3, size, 0, 2 * Math.PI);
    ctx.fill();

    // Main object with gradient
    const gradient = ctx.createRadialGradient(
      screenX - size/3, screenY - size/3, 0,
      screenX, screenY, size
    );
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Object label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${simulationState.object.mass}kg`, screenX, screenY + 4);

    // Draw gravity vector
    if (settings.showVectors) {
      const gravityForce = simulationState.object.mass * PhysicsEngine.getGravity(simulationState.environment);
      const vectorLength = Math.min(gravityForce * 2, 50);
      
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 4;
      
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX, screenY + vectorLength);
      ctx.stroke();
      
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(screenX, screenY + vectorLength);
      ctx.lineTo(screenX - 8, screenY + vectorLength - 12);
      ctx.lineTo(screenX + 8, screenY + vectorLength - 12);
      ctx.closePath();
      ctx.fill();
      
      // Dynamic weight label with smart positioning
      const labelText = `Weight: ${gravityForce.toFixed(1)}N`;
      const textWidth = ctx.measureText(labelText).width;
      const textHeight = 12;
      
      // Calculate optimal label position
      let labelX = screenX;
      let labelY = screenY + vectorLength + 20;
      
      // Adjust position if label would go outside canvas
      if (labelY + textHeight > canvas.height - 10) {
        labelY = screenY - 20; // Move above object
      }
      if (labelX - textWidth/2 < 10) {
        labelX = textWidth/2 + 10;
      }
      if (labelX + textWidth/2 > canvas.width - 10) {
        labelX = canvas.width - textWidth/2 - 10;
      }
      
      // Label background with rounded corners
      const padding = 5;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(labelX - textWidth/2 - padding, labelY - textHeight - padding, textWidth + padding * 2, textHeight + padding * 2);
      
      // Label text
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labelText, labelX, labelY);
    }

    // Draw velocity vector
    if (settings.showVectors && simulationState.object.velocity.x !== 0 || simulationState.object.velocity.y !== 0) {
      const velX = screenX + simulationState.object.velocity.x * 10;
      const velY = screenY - simulationState.object.velocity.y * 10;
      
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(velX, velY);
      ctx.stroke();
      
      // Arrowhead
      const angle = Math.atan2(velY - screenY, velX - screenX);
      const arrowLength = 12;
      ctx.beginPath();
      ctx.moveTo(velX, velY);
      ctx.lineTo(
        velX - arrowLength * Math.cos(angle - Math.PI / 6),
        velY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        velX - arrowLength * Math.cos(angle + Math.PI / 6),
        velY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      
      // Dynamic velocity label with smart positioning
      const velocityMag = Math.sqrt(simulationState.object.velocity.x ** 2 + simulationState.object.velocity.y ** 2);
      const velocityLabelText = `Velocity: ${velocityMag.toFixed(1)} m/s`;
      const velTextWidth = ctx.measureText(velocityLabelText).width;
      const velTextHeight = 12;
      
      // Calculate optimal velocity label position
      let velLabelX = velX + 20;
      let velLabelY = velY - 10;
      
      // Adjust position if label would go outside canvas
      if (velLabelX + velTextWidth > canvas.width - 10) {
        velLabelX = velX - velTextWidth - 20;
      }
      if (velLabelY - velTextHeight < 10) {
        velLabelY = velY + velTextHeight + 10;
      }
      if (velLabelY + velTextHeight > canvas.height - 10) {
        velLabelY = velY - velTextHeight - 10;
      }
      
      // Ensure label stays within canvas bounds
      velLabelX = Math.max(10, Math.min(canvas.width - velTextWidth - 10, velLabelX));
      velLabelY = Math.max(velTextHeight + 5, Math.min(canvas.height - 5, velLabelY));
      
      // Velocity label background
      const velPadding = 5;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(velLabelX - velPadding, velLabelY - velTextHeight - velPadding, velTextWidth + velPadding * 2, velTextHeight + velPadding * 2);
      
      // Velocity label text
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(velocityLabelText, velLabelX, velLabelY);
    }
  }, [simulationState, trajectoryPoints, settings]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const speed = Math.sqrt(simulationState.object.velocity.x ** 2 + simulationState.object.velocity.y ** 2);
  const height = simulationState.object.position.y;
  const kineticEnergy = 0.5 * simulationState.object.mass * speed * speed;
  const potentialEnergy = simulationState.object.mass * PhysicsEngine.getGravity(simulationState.environment) * height;
  const acceleration = PhysicsEngine.getGravity(simulationState.environment); // Gravitational acceleration

  return (
    <div className="space-y-6">
      {/* Gravity Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setGravityType('free-fall')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            gravityType === 'free-fall'
              ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Free Fall</h3>
          </div>
          <p className="text-sm opacity-80">Object falls under gravity only</p>
        </div>

        <div
          onClick={() => setGravityType('projectile')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            gravityType === 'projectile'
              ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-lg shadow-blue-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Projectile</h3>
          </div>
          <p className="text-sm opacity-80">Launched with initial velocity</p>
        </div>

        <div
          onClick={() => setGravityType('orbit')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            gravityType === 'orbit'
              ? 'bg-green-500/20 border-green-400 text-green-200 shadow-lg shadow-green-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Orbit</h3>
          </div>
          <p className="text-sm opacity-80">Circular motion around center</p>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="space-y-6">
        {/* Simulation Canvas */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Gravity Simulation</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateState({ isRunning: !simulationState.isRunning })}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2"
                >
                  {simulationState.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {simulationState.isRunning ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border border-slate-600 rounded-lg bg-slate-900 w-full"
              />
              <div className="absolute top-2 right-2 bg-slate-800/80 text-slate-300 text-xs px-2 py-1 rounded">
                Gravity affects motion
              </div>
            </div>
          </div>

        {/* Controls and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Gravity Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Initial Speed: {Math.sqrt(initialVelocity.x ** 2 + initialVelocity.y ** 2).toFixed(1)} m/s
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={Math.sqrt(initialVelocity.x ** 2 + initialVelocity.y ** 2)}
                  onChange={(e) => {
                    const speed = parseFloat(e.target.value);
                    const angleRad = (launchAngle * Math.PI) / 180;
                    setInitialVelocity({
                      x: speed * Math.cos(angleRad),
                      y: speed * Math.sin(angleRad)
                    });
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Launch Angle: {launchAngle}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={launchAngle}
                  onChange={(e) => {
                    const angle = parseFloat(e.target.value);
                    setLaunchAngle(angle);
                    const speed = Math.sqrt(initialVelocity.x ** 2 + initialVelocity.y ** 2);
                    const angleRad = (angle * Math.PI) / 180;
                    setInitialVelocity({
                      x: speed * Math.cos(angleRad),
                      y: speed * Math.sin(angleRad)
                    });
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mass</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={simulationState.object.mass}
                  onChange={(e) => handleUpdateState({ 
                    object: { ...simulationState.object, mass: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-slate-400 mt-1">{simulationState.object.mass.toFixed(1)} kg</div>
              </div>

              <button
                onClick={handleLaunch}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors mb-2"
              >
                Launch Object
              </button>
              <button
                onClick={handleToggleRun}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors mb-2 ${
                  simulationState.isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {simulationState.isRunning ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Live Data Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Motion Data</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Speed:</span>
                <span className="text-white font-mono">{speed.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Height:</span>
                <span className="text-white font-mono">{height.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kinetic Energy:</span>
                <span className="text-white font-mono">{kineticEnergy.toFixed(2)} J</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Potential Energy:</span>
                <span className="text-white font-mono">{potentialEnergy.toFixed(2)} J</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Force:</span>
                <span className="text-white font-mono">{Math.abs(simulationState.netForce?.y || 0).toFixed(2)} N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acceleration:</span>
                <span className="text-white font-mono">{Math.abs(acceleration).toFixed(2)} m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Energy:</span>
                <span className="text-white font-mono">{(kineticEnergy + potentialEnergy).toFixed(2)} J</span>
              </div>
            </div>
          </div>

          {/* Data Visualization */}
          <DataVisualization
            object={simulationState.object}
            forces={[]}
            timeElapsed={simulationState.timeElapsed}
            trajectoryPoints={trajectoryPoints}
            isRunning={simulationState.isRunning}
          />
        </div>
      </div>
    </div>
  );
};