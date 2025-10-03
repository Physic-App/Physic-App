import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap as Collision, Settings } from 'lucide-react';
import { PhysicsEngine } from '../../../../utils/physics';
import { SimulationState, Vector2D, PhysicsObject, ForceVector } from '../../../../types/physics';

interface CollisionSimulatorProps {
  settings: any;
}

export const CollisionSimulator: React.FC<CollisionSimulatorProps> = ({ settings }) => {
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
    appliedForce: 0,
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

  const [objects, setObjects] = useState<PhysicsObject[]>([
    {
      position: { x: -5, y: 0 },
      velocity: { x: 3, y: 0 },
      acceleration: { x: 0, y: 0 },
      mass: 2.0,
      radius: 0.5,
      material: 'metal',
      temperature: 20
    },
    {
      position: { x: 5, y: 0 },
      velocity: { x: -2, y: 0 },
      acceleration: { x: 0, y: 0 },
      mass: 1.5,
      radius: 0.4,
      material: 'wood',
      temperature: 20
    }
  ]);

  const [trajectoryPoints, setTrajectoryPoints] = useState<Vector2D[]>([]);
  const [collisionType, setCollisionType] = useState<'elastic' | 'inelastic' | 'perfectly-inelastic'>('elastic');
  const [restitution, setRestitution] = useState(0.8);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpdateState = useCallback((updates: Partial<SimulationState>) => {
    setSimulationState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setObjects([
      {
        position: { x: -5, y: 0 },
        velocity: { x: 3, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: 2.0,
        radius: 0.5,
        material: 'metal',
        temperature: 20
      },
      {
        position: { x: 5, y: 0 },
        velocity: { x: -2, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: 1.5,
        radius: 0.4,
        material: 'wood',
        temperature: 20
      }
    ]);
    setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      timeElapsed: 0
    }));
    setTrajectoryPoints([]);
  }, []);

  // Collision detection and response
  const checkCollisions = (obj1: PhysicsObject, obj2: PhysicsObject) => {
    const distance = Math.sqrt(
      Math.pow(obj1.position.x - obj2.position.x, 2) + 
      Math.pow(obj1.position.y - obj2.position.y, 2)
    );
    const minDistance = obj1.radius + obj2.radius;
    
    if (distance < minDistance) {
      return true;
    }
    return false;
  };

  const calculateCollisionResponse = (obj1: PhysicsObject, obj2: PhysicsObject) => {
    const dx = obj2.position.x - obj1.position.x;
    const dy = obj2.position.y - obj1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Relative velocity
    const relativeVelocityX = obj2.velocity.x - obj1.velocity.x;
    const relativeVelocityY = obj2.velocity.y - obj1.velocity.y;
    
    // Relative velocity along collision normal
    const relativeSpeed = relativeVelocityX * nx + relativeVelocityY * ny;
    
    // Don't resolve if objects are separating
    if (relativeSpeed > 0) return { obj1, obj2 };
    
    // Calculate impulse
    const impulse = 2 * relativeSpeed / (obj1.mass + obj2.mass);
    
    // Apply impulse based on collision type
    let restitutionFactor = restitution;
    if (collisionType === 'perfectly-inelastic') {
      restitutionFactor = 0;
    } else if (collisionType === 'inelastic') {
      restitutionFactor = restitution * 0.5;
    }
    
    const impulseX = impulse * nx * restitutionFactor;
    const impulseY = impulse * ny * restitutionFactor;
    
    // Update velocities
    const newObj1 = {
      ...obj1,
      velocity: {
        x: obj1.velocity.x + impulseX * obj2.mass,
        y: obj1.velocity.y + impulseY * obj2.mass
      }
    };
    
    const newObj2 = {
      ...obj2,
      velocity: {
        x: obj2.velocity.x - impulseX * obj1.mass,
        y: obj2.velocity.y - impulseY * obj1.mass
      }
    };
    
    return { obj1: newObj1, obj2: newObj2 };
  };

  // Animation loop
  useEffect(() => {
    if (!simulationState.isRunning) return;

    const animate = () => {
      setObjects(prevObjects => {
        let newObjects = [...prevObjects];
        
        // Update each object position based on velocity (simple physics)
        for (let i = 0; i < newObjects.length; i++) {
          const obj = newObjects[i];
          const dt = PhysicsEngine.TIME_STEP * simulationState.simulationSpeed;
          
          // Simple position update: x = x + v*dt
          const newPosition = {
            x: obj.position.x + obj.velocity.x * dt,
            y: obj.position.y + obj.velocity.y * dt
          };
          
          // Boundary collision (bounce off walls)
          const canvasWidth = 600;
          const canvasHeight = 400;
          const scale = 30; // Same scale as drawing
          
          if (newPosition.x * scale < -canvasWidth/2 || newPosition.x * scale > canvasWidth/2) {
            obj.velocity.x = -obj.velocity.x * 0.8; // Bounce with some energy loss
            newPosition.x = obj.position.x; // Keep old position
          }
          if (newPosition.y * scale < -canvasHeight/2 || newPosition.y * scale > canvasHeight/2) {
            obj.velocity.y = -obj.velocity.y * 0.8; // Bounce with some energy loss
            newPosition.y = obj.position.y; // Keep old position
          }
          
          newObjects[i] = {
            ...obj,
            position: newPosition
          };
        }
        
        // Check for collisions
        for (let i = 0; i < newObjects.length; i++) {
          for (let j = i + 1; j < newObjects.length; j++) {
            if (checkCollisions(newObjects[i], newObjects[j])) {
              const collisionResult = calculateCollisionResponse(newObjects[i], newObjects[j]);
              newObjects[i] = collisionResult.obj1;
              newObjects[j] = collisionResult.obj2;
            }
          }
        }
        
        return newObjects;
      });
      
      setSimulationState(prev => ({
        ...prev,
        timeElapsed: prev.timeElapsed + PhysicsEngine.TIME_STEP * prev.simulationSpeed
      }));
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [simulationState.isRunning, simulationState.simulationSpeed, restitution, collisionType]);

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

    // Draw objects
    objects.forEach((obj, index) => {
      if (!obj) {
        return;
      }
      const screenX = canvas.width / 2 + obj.position.x * 30;
      const screenY = canvas.height / 2 - obj.position.y * 30;
      const size = obj.radius * 25;

      // Object shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(screenX + 3, screenY + 3, size, 0, 2 * Math.PI);
      ctx.fill();

      // Main object with different colors
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
      const color = colors[index % colors.length];
      
      ctx.fillStyle = color;
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
      ctx.fillText(`${obj.mass}kg`, screenX, screenY + 4);

      // Velocity vector
      if (settings.showVectors) {
        const velX = screenX + obj.velocity.x * 10;
        const velY = screenY - obj.velocity.y * 10;
        
        ctx.strokeStyle = color;
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
      }
    });
  }, [objects, settings]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const totalMomentum = objects.reduce((total, obj) => {
    if (!obj || typeof obj.mass !== 'number' || typeof obj.velocity?.x !== 'number' || typeof obj.velocity?.y !== 'number') {
      return total;
    }
    return {
      x: total.x + obj.mass * obj.velocity.x,
      y: total.y + obj.mass * obj.velocity.y
    };
  }, { x: 0, y: 0 });

  const totalKineticEnergy = objects.reduce((total, obj) => {
    if (!obj || typeof obj.mass !== 'number' || typeof obj.velocity?.x !== 'number' || typeof obj.velocity?.y !== 'number') {
      return total;
    }
    const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2);
    return total + 0.5 * obj.mass * speed * speed;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Collision Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setCollisionType('elastic')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            collisionType === 'elastic'
              ? 'bg-green-500/20 border-green-400 text-green-200 shadow-lg shadow-green-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Collision className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Elastic</h3>
          </div>
          <p className="text-sm opacity-80">Kinetic energy and momentum conserved</p>
        </div>

        <div
          onClick={() => setCollisionType('inelastic')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            collisionType === 'inelastic'
              ? 'bg-orange-500/20 border-orange-400 text-orange-200 shadow-lg shadow-orange-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Inelastic</h3>
          </div>
          <p className="text-sm opacity-80">Some kinetic energy lost as heat</p>
        </div>

        <div
          onClick={() => setCollisionType('perfectly-inelastic')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            collisionType === 'perfectly-inelastic'
              ? 'bg-red-500/20 border-red-400 text-red-200 shadow-lg shadow-red-500/25'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <Collision className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Perfectly Inelastic</h3>
          </div>
          <p className="text-sm opacity-80">Objects stick together after collision</p>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Collision Simulation</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateState({ isRunning: !simulationState.isRunning })}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2"
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
                Watch collisions happen
              </div>
            </div>
          </div>
        </div>

        {/* Controls and Data */}
        <div className="space-y-4">
          {/* Controls Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Collision Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Restitution: {restitution.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={restitution}
                  onChange={(e) => setRestitution(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Object 1 Mass</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={objects[0]?.mass || 2}
                  onChange={(e) => {
                    const newMass = parseFloat(e.target.value);
                    setObjects(prev => prev.map((obj, i) => 
                      i === 0 ? { ...obj, mass: newMass } : obj
                    ));
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-slate-400 mt-1">{objects[0]?.mass.toFixed(1)} kg</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Object 2 Mass</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={objects[1]?.mass || 1.5}
                  onChange={(e) => {
                    const newMass = parseFloat(e.target.value);
                    setObjects(prev => prev.map((obj, i) => 
                      i === 1 ? { ...obj, mass: newMass } : obj
                    ));
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-slate-400 mt-1">{objects[1]?.mass.toFixed(1)} kg</div>
              </div>
            </div>
          </div>

          {/* Live Data Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Collision Data</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Momentum:</span>
                <span className="text-white font-mono">{Math.sqrt(totalMomentum.x ** 2 + totalMomentum.y ** 2).toFixed(2)} kg⋅m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Kinetic Energy:</span>
                <span className="text-white font-mono">{totalKineticEnergy.toFixed(2)} J</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Collision Type:</span>
                <span className="text-white font-mono capitalize">{collisionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="text-white font-mono">{simulationState.timeElapsed.toFixed(1)} s</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};