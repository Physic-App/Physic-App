import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Zap, Target, Activity, Download } from 'lucide-react';
import { PhysicsEngine } from '../../../../utils/physics';
import { SimulationState, Vector2D, PhysicsObject, ForceVector } from '../../../../types/physics';
import { DataVisualization } from '../DataVisualization';
import { DataExport, SimulationData } from '../../../../utils/DataExport';
import { HelpTooltip } from '../HelpTooltip';

interface NewtonLawsSimulatorProps {
  settings: any;
}

export const NewtonLawsSimulator: React.FC<NewtonLawsSimulatorProps> = ({ settings }) => {
  const [currentLaw, setCurrentLaw] = useState<'first' | 'second' | 'third'>('second');
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
    appliedForce: 10,
    inclineAngle: 0,
    frictionCoefficient: 0.1,
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
    timeElapsed: 0
  });

  const [trajectoryPoints, setTrajectoryPoints] = useState<Vector2D[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [showReactionForces, setShowReactionForces] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

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
      simulationState.airResistance,
      showReactionForces
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
    simulationState.airResistance,
    showReactionForces
  ]);

  // Animation loop
  useEffect(() => {
    if (!simulationState.isRunning) return;

    const animate = () => {
      setSimulationState(prev => {
        const netForce = PhysicsEngine.calculateNetForce(prev.forces);
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

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationState.isRunning, simulationState.simulationSpeed]);

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

  const handleObjectDrag = useCallback((newPosition: Vector2D) => {
    setSimulationState(prev => ({
      ...prev,
      object: { ...prev.object, position: newPosition }
    }));
  }, []);

  const handleLawChange = (law: 'first' | 'second' | 'third') => {
    setCurrentLaw(law);
    setSimulationState(prev => ({ ...prev, currentLaw: law }));
    
    // Adjust simulation parameters based on law for realistic demonstration
    switch (law) {
      case 'first':
        // First Law: No net force - object maintains constant velocity
        handleUpdateState({ 
          appliedForce: 0, 
          frictionCoefficient: 0,
          environment: 'space', // No gravity for pure first law demonstration
          airResistance: false
        });
        // Give object initial velocity to demonstrate inertia
        setSimulationState(prev => ({
          ...prev,
          object: {
            ...prev.object,
            velocity: { x: 5, y: 0 } // Initial velocity to show constant motion
          }
        }));
        break;
      case 'second':
        // Second Law: F = ma - demonstrate force-acceleration relationship
        handleUpdateState({ 
          appliedForce: 10, 
          frictionCoefficient: 0.1,
          environment: 'earth',
          airResistance: false
        });
        // Reset object to rest for clean demonstration
        setSimulationState(prev => ({
          ...prev,
          object: {
            ...prev.object,
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 }
          }
        }));
        break;
      case 'third':
        // Third Law: Action-reaction pairs - show equal and opposite forces
        handleUpdateState({ 
          appliedForce: 20, // Higher force for more visible motion
          frictionCoefficient: 0.2, // Moderate friction to show reaction but allow motion
          environment: 'earth',
          airResistance: false
        });
        // Reset object to rest for clear demonstration
        setSimulationState(prev => ({
          ...prev,
          object: {
            ...prev.object,
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 }
          }
        }));
        break;
    }
    setTrajectoryPoints([]); // Clear trajectory for new law
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context from canvas');
      return;
    }

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

    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
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

    // Interactive object with enhanced visual feedback
    const isHovered = isDragging || (Math.abs(screenX - (canvas.width / 2)) < 50 && Math.abs(screenY - (canvas.height / 2)) < 50);
    const objectSize = isHovered ? size * 1.2 : size;
    
    // Main object with 3D effect and interaction feedback
    const gradient = ctx.createRadialGradient(
      screenX - objectSize/3, screenY - objectSize/3, 0,
      screenX, screenY, objectSize
    );
    
    if (isHovered) {
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(1, '#3b82f6');
    } else {
      gradient.addColorStop(0, '#e5e7eb');
      gradient.addColorStop(1, '#9ca3af');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, objectSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Enhanced border for interactive state
    ctx.strokeStyle = isHovered ? '#1d4ed8' : '#6b7280';
    ctx.lineWidth = isHovered ? 3 : 2;
    ctx.stroke();

    // Interactive indicators
    if (isHovered) {
      // Pulsing ring effect
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(screenX, screenY, objectSize + 10, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Object label with better visibility
    ctx.fillStyle = isHovered ? '#ffffff' : '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${simulationState.object.mass}kg`, screenX, screenY + 4);
    
    // Interactive hint
    if (isHovered) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(screenX - 40, screenY - 35, 80, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.fillText('Click & Drag', screenX, screenY - 20);
    }

    // Draw force vectors with smart positioning
    if (settings.showVectors) {
      simulationState.forces.forEach((force, index) => {
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

        // Smart label positioning to stay within canvas
        const labelText = `${force.name}: ${force.magnitude.toFixed(1)}N`;
        const textWidth = ctx.measureText(labelText).width;
        const textHeight = 12;
        
        // Calculate optimal label position
        let labelX = endX + 20;
        let labelY = endY - 10;
        
        // Adjust position if label would go outside canvas
        if (labelX + textWidth > canvas.width - 10) {
          labelX = endX - textWidth - 20;
        }
        if (labelY - textHeight < 10) {
          labelY = endY + textHeight + 10;
        }
        if (labelY + textHeight > canvas.height - 10) {
          labelY = endY - textHeight - 10;
        }
        
        // Ensure label stays within canvas bounds
        labelX = Math.max(10, Math.min(canvas.width - textWidth - 10, labelX));
        labelY = Math.max(textHeight + 5, Math.min(canvas.height - 5, labelY));
        
        // Label background with rounded corners
        const padding = 5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(labelX - padding, labelY - textHeight - padding, textWidth + padding * 2, textHeight + padding * 2);
        
        // Label text
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
  }, [simulationState, trajectoryPoints, settings]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Keyboard shortcuts and accessibility
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          setSimulationState(prev => ({ ...prev, isRunning: !prev.isRunning }));
          break;
        case 'KeyR':
          event.preventDefault();
          handleReset();
          break;
        case 'KeyG':
          event.preventDefault();
          setSimulationState(prev => ({ ...prev, showGrid: !prev.showGrid }));
          break;
        case 'KeyV':
          event.preventDefault();
          setSimulationState(prev => ({ ...prev, showVectors: !prev.showVectors }));
          break;
        case 'KeyT':
          event.preventDefault();
          setSimulationState(prev => ({ ...prev, showTrajectory: !prev.showTrajectory }));
          break;
        case 'Digit1':
          event.preventDefault();
          handleLawChange('first');
          break;
        case 'Digit2':
          event.preventDefault();
          handleLawChange('second');
          break;
        case 'Digit3':
          event.preventDefault();
          handleLawChange('third');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleReset, handleLawChange]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const objectScreenX = canvas.width / 2 + simulationState.object.position.x * 30;
    const objectScreenY = canvas.height / 2 - simulationState.object.position.y * 30;

    if (
      mouseX >= objectScreenX - 30 &&
      mouseX <= objectScreenX + 30 &&
      mouseY >= objectScreenY - 30 &&
      mouseY <= objectScreenY + 30
    ) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const newPosition: Vector2D = {
      x: (mouseX - canvas.width / 2) / 30,
      y: (canvas.height / 2 - mouseY) / 30
    };

    handleObjectDrag(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const netForce = simulationState.forces.reduce((net, force) => ({
    x: net.x + force.vector.x,
    y: net.y + force.vector.y
  }), { x: 0, y: 0 });
  
  const netForceMagnitude = Math.sqrt(netForce.x ** 2 + netForce.y ** 2);
  const acceleration = Math.sqrt(simulationState.object.acceleration.x ** 2 + simulationState.object.acceleration.y ** 2);
  const velocity = Math.sqrt(simulationState.object.velocity.x ** 2 + simulationState.object.velocity.y ** 2);

  return (
    <div className="space-y-6">
      {/* Law Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => handleLawChange('first')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            currentLaw === 'first'
              ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-lg shadow-blue-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">First Law</h3>
          </div>
          <p className="text-sm opacity-80">Objects at rest stay at rest, objects in motion stay in motion</p>
        </div>

        <div
          onClick={() => handleLawChange('second')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            currentLaw === 'second'
              ? 'bg-green-500/20 border-green-400 text-green-200 shadow-lg shadow-green-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Second Law</h3>
          </div>
          <p className="text-sm opacity-80">F = ma - Force equals mass times acceleration</p>
        </div>

        <div
          onClick={() => handleLawChange('third')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            currentLaw === 'third'
              ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Third Law</h3>
          </div>
          <p className="text-sm opacity-80">For every action, there's an equal and opposite reaction</p>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="space-y-6">
        {/* Simulation Canvas */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Simulation</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateState({ isRunning: !simulationState.isRunning })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2"
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
                className="border border-slate-600 rounded-lg bg-slate-900 cursor-move w-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="absolute top-2 right-2 bg-slate-800/80 text-slate-300 text-xs px-2 py-1 rounded">
                Drag to move object
              </div>
            <div className="absolute bottom-2 left-2 bg-slate-800/80 text-slate-300 text-xs px-2 py-1 rounded">
              <div>Space: Play/Pause | R: Reset | G: Grid | V: Vectors | T: Trajectory</div>
              <div>1: First Law | 2: Second Law | 3: Third Law</div>
            </div>

            {/* Newton's Third Law Information Panel */}
            {simulationState.currentLaw === 'third' && (
              <div className="absolute top-2 left-2 bg-purple-800/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg border border-purple-600 max-w-xs">
                <div className="font-semibold text-purple-200 mb-1">Newton's Third Law</div>
                <div className="text-xs space-y-1">
                  <div>• <span className="text-green-400">Green arrows</span>: Action forces (on object)</div>
                  <div>• <span className="text-red-400">Red arrows</span>: Reaction forces (on hand)</div>
                  <div>• <span className="text-orange-400">Orange arrows</span>: Friction (reaction)</div>
                  <div>• <span className="text-blue-400">Blue arrows</span>: Normal force (reaction)</div>
                  <div className="text-purple-300 font-medium">Every action has an equal and opposite reaction!</div>
                  <div className="text-yellow-300 text-xs mt-1">The object moves because only forces acting ON it count for motion!</div>
                </div>
              </div>
            )}
            </div>
          </div>

        {/* Controls and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>
            
              <div className="space-y-4">
                <div>
                  <HelpTooltip
                    content="This controls the horizontal force applied to the object. Positive values push right, negative values push left. This demonstrates Newton's Second Law: F = ma."
                    title="Applied Force"
                    position="right"
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2 cursor-help">
                      Applied Force: {simulationState.appliedForce.toFixed(1)} N
                    </label>
                  </HelpTooltip>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="0.5"
                  value={simulationState.appliedForce}
                  onChange={(e) => handleUpdateState({ appliedForce: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  aria-label={`Applied Force: ${simulationState.appliedForce.toFixed(1)} Newtons`}
                  aria-valuemin={-50}
                  aria-valuemax={50}
                  aria-valuenow={simulationState.appliedForce}
                  aria-valuetext={`${simulationState.appliedForce.toFixed(1)} Newtons`}
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Friction: {simulationState.frictionCoefficient.toFixed(2)}
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

              {/* Reaction Forces Toggle - Only show for Third Law */}
              {simulationState.currentLaw === 'third' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Show Reaction Forces
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showReactionForces}
                      onChange={(e) => setShowReactionForces(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-slate-300">
                      {showReactionForces ? 'Show' : 'Hide'} reaction forces
                    </span>
                  </div>
                </div>
              )}
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
                <span className="text-slate-400">Time:</span>
                <span className="text-white font-mono">{simulationState.timeElapsed.toFixed(1)} s</span>
              </div>
            </div>
          </div>

          {/* Data Visualization */}
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
  );
};
