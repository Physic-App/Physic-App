import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Grip, Settings } from 'lucide-react';
import { PhysicsEngine } from '../../../../utils/physics';
import { SimulationState, Vector2D, PhysicsObject, ForceVector } from '../../../../types/physics';
import { DataVisualization } from '../DataVisualization';

interface FrictionSimulatorProps {
  settings: any;
}

export const FrictionSimulator: React.FC<FrictionSimulatorProps> = ({ settings }) => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    object: {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      mass: 2.0,
      radius: 0.5,
      material: 'metal',
      temperature: 20
    },
    forces: [],
    appliedForce: 5,
    inclineAngle: 0,
    frictionCoefficient: 0.5,
    surfaceType: 'rough',
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
    timeElapsed: 0
  });

  const [trajectoryPoints, setTrajectoryPoints] = useState<Vector2D[]>([]);
  const [surfaceType, setSurfaceType] = useState<'smooth' | 'rough'>('rough');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation loop
  useEffect(() => {
    if (!simulationState.isRunning) return;

    const animate = () => {
      setSimulationState(prev => {
        const forces = PhysicsEngine.calculateForces(
          prev.object.mass,
          prev.appliedForce,
          prev.inclineAngle,
          prev.frictionCoefficient,
          prev.surfaceType,
          prev.environment,
          prev.object.velocity,
          prev.object.radius,
          prev.airResistance
        );

        const netForce = PhysicsEngine.calculateNetForce(forces);
        const updatedObject = PhysicsEngine.updatePhysicsObject(
          prev.object,
          netForce,
          PhysicsEngine.TIME_STEP * prev.simulationSpeed,
          { width: 600, height: 400 }
        );

        // Update trajectory
        setTrajectoryPoints(points => {
          const newPoints = [...points, { ...updatedObject.position }];
          return newPoints.slice(-200);
        });

        return { 
          ...prev, 
          object: updatedObject,
          timeElapsed: prev.timeElapsed + PhysicsEngine.TIME_STEP * prev.simulationSpeed
        };
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [simulationState.isRunning, simulationState.simulationSpeed]);

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

    // Draw surface
    const surfaceY = canvas.height / 2;
    ctx.strokeStyle = surfaceType === 'rough' ? '#f97316' : '#3b82f6';
    ctx.lineWidth = surfaceType === 'rough' ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(canvas.width, surfaceY);
    ctx.stroke();

    // Draw surface texture for rough surface
    if (surfaceType === 'rough') {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, surfaceY - 5);
        ctx.lineTo(x + 10, surfaceY + 5);
        ctx.stroke();
      }
    }

    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(canvas.width, surfaceY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Draw trajectory
    if (settings.showTrajectory && trajectoryPoints.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      trajectoryPoints.forEach((point, index) => {
        const screenX = canvas.width / 2 + point.x * 30;
        const screenY = surfaceY - point.y * 30;
        
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
    const screenY = surfaceY - simulationState.object.position.y * 30;
    const size = simulationState.object.radius * 25;

    // Object shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(screenX + 2, screenY + 2, size, 0, 2 * Math.PI);
    ctx.fill();

    // Main object with material-based colors
    const materialColors = {
      wood: ['#d97706', '#92400e'],
      metal: ['#e5e7eb', '#9ca3af'],
      rubber: ['#374151', '#111827'],
      ice: ['#dbeafe', '#93c5fd']
    };
    
    const [lightColor, darkColor] = materialColors[simulationState.object.material] || materialColors.metal;
    const gradient = ctx.createRadialGradient(
      screenX - size/3, screenY - size/3, 0,
      screenX, screenY, size
    );
    gradient.addColorStop(0, lightColor);
    gradient.addColorStop(1, darkColor);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Object label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${simulationState.object.mass}kg`, screenX, screenY + 4);

    // Draw force vectors
    if (settings.showVectors) {
      simulationState.forces.forEach(force => {
        if (!force.visible) return;

        const endX = screenX + force.vector.x * 2;
        const endY = screenY - force.vector.y * 2;

        // Vector arrow
        ctx.strokeStyle = force.color;
        ctx.fillStyle = force.color;
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(endY - screenY, endX - screenX);
        const arrowLength = 15;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle - Math.PI / 6),
          endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle + Math.PI / 6),
          endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Force label
        const labelX = endX + 20;
        const labelY = endY - 10;
        const labelText = `${force.name}: ${force.magnitude.toFixed(1)}N`;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(labelX - 5, labelY - 12, ctx.measureText(labelText).width + 10, 16);
        
        ctx.fillStyle = force.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(labelText, labelX, labelY);
      });
    }

    // Draw measurements
    if (settings.showMeasurements) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(10, 10, 250, 100);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';

      const measurements = [
        `Position: (${simulationState.object.position.x.toFixed(1)}, ${simulationState.object.position.y.toFixed(1)}) m`,
        `Velocity: (${simulationState.object.velocity.x.toFixed(1)}, ${simulationState.object.velocity.y.toFixed(1)}) m/s`,
        `Acceleration: (${simulationState.object.acceleration.x.toFixed(1)}, ${simulationState.object.acceleration.y.toFixed(1)}) m/s²`,
        `Speed: ${Math.sqrt(simulationState.object.velocity.x ** 2 + simulationState.object.velocity.y ** 2).toFixed(2)} m/s`
      ];

      measurements.forEach((text, index) => {
        ctx.fillText(text, 15, 30 + index * 20);
      });
    }
  }, [simulationState, settings, surfaceType, trajectoryPoints]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Update forces when parameters change
  useEffect(() => {
    const forces = PhysicsEngine.calculateForces(
      simulationState.object.mass,
      simulationState.appliedForce,
      simulationState.inclineAngle,
      simulationState.frictionCoefficient,
      simulationState.surfaceType,
      simulationState.environment,
      simulationState.object.velocity,
      simulationState.object.radius,
      simulationState.airResistance
    );

    setSimulationState(prev => ({ ...prev, forces }));
  }, [
    simulationState.object.mass,
    simulationState.appliedForce,
    simulationState.inclineAngle,
    simulationState.frictionCoefficient,
    simulationState.surfaceType,
    simulationState.environment,
    simulationState.object.velocity,
    simulationState.object.radius,
    simulationState.airResistance
  ]);

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

  const netForce = simulationState.forces.reduce((net, force) => ({
    x: net.x + force.vector.x,
    y: net.y + force.vector.y
  }), { x: 0, y: 0 });
  
  const netForceMagnitude = Math.sqrt(netForce.x ** 2 + netForce.y ** 2);
  const acceleration = Math.sqrt(simulationState.object.acceleration.x ** 2 + simulationState.object.acceleration.y ** 2);
  const velocity = Math.sqrt(simulationState.object.velocity.x ** 2 + simulationState.object.velocity.y ** 2);

  return (
    <div className="space-y-6">
      {/* Surface Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => {
            setSurfaceType('smooth');
            handleUpdateState({ surfaceType: 'smooth', frictionCoefficient: 0.1 });
          }}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            surfaceType === 'smooth'
              ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-lg shadow-blue-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Smooth Surface</h3>
          </div>
          <p className="text-sm opacity-80">Low friction - objects slide easily</p>
        </div>

        <div
          onClick={() => {
            setSurfaceType('rough');
            handleUpdateState({ surfaceType: 'rough', frictionCoefficient: 0.5 });
          }}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            surfaceType === 'rough'
              ? 'bg-orange-500/20 border-orange-400 text-orange-200 shadow-lg shadow-orange-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Grip className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Rough Surface</h3>
          </div>
          <p className="text-sm opacity-80">High friction - objects resist motion</p>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="space-y-6">
        {/* Simulation Canvas */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Friction Simulation</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateState({ isRunning: !simulationState.isRunning })}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2"
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
                Friction affects motion
              </div>
            </div>
          </div>

        {/* Controls and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Friction Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Applied Force: {simulationState.appliedForce.toFixed(1)} N
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={simulationState.appliedForce}
                  onChange={(e) => handleUpdateState({ appliedForce: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Friction Coefficient: {simulationState.frictionCoefficient.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={simulationState.frictionCoefficient}
                  onChange={(e) => handleUpdateState({ frictionCoefficient: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mass: {simulationState.object.mass.toFixed(1)} kg
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={simulationState.object.mass}
                  onChange={(e) => handleUpdateState({ 
                    object: { ...simulationState.object, mass: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Live Data Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Live Data</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Net Force:</span>
                <span className="text-white font-mono">{netForceMagnitude.toFixed(2)} N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acceleration:</span>
                <span className="text-white font-mono">{acceleration.toFixed(2)} m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Velocity:</span>
                <span className="text-white font-mono">{velocity.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Friction Force:</span>
                <span className="text-white font-mono">
                  {(simulationState.frictionCoefficient * simulationState.object.mass * 9.81).toFixed(2)} N
                </span>
              </div>
            </div>
          </div>

          {/* Data Visualization */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Data Visualization</h3>
            <DataVisualization
              object={simulationState.object}
              forces={simulationState.forces}
              timeElapsed={simulationState.timeElapsed}
              trajectoryPoints={trajectoryPoints}
              isRunning={simulationState.isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
