import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';
import { InfoPanel } from './ui/InfoPanel';

export const ReflectionSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [mirrorType, setMirrorType] = useState<'plane' | 'concave' | 'convex'>('plane');
  const [surfaceType, setSurfaceType] = useState<'smooth' | 'rough'>('smooth');
  const [objectDistance, setObjectDistance] = useState(30);
  const [objectHeight, setObjectHeight] = useState(10);
  const [focalLength, setFocalLength] = useState(20);
  const [showMultipleRays, setShowMultipleRays] = useState(false);
  const [showNormal, setShowNormal] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);

  const reflectedAngle = incidentAngle; // Law of reflection

  useEffect(() => {
    if (enableAnimations) {
      const timeoutId = setTimeout(() => {
        drawReflection();
      }, 50);
      return () => clearTimeout(timeoutId);
    } else {
      drawReflection();
    }
  }, [incidentAngle, mirrorType, surfaceType, objectDistance, objectHeight, focalLength, showMultipleRays, showNormal, showAngles, showImage, enableAnimations]);

  const drawReflection = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw mirror based on type
    drawMirror(ctx, centerX, centerY, mirrorType);

    // Draw incident ray
    const incidentRayEnd = {
      x: centerX - Math.cos(incidentAngle * Math.PI / 180) * 100,
      y: centerY - Math.sin(incidentAngle * Math.PI / 180) * 100
    };

    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(incidentRayEnd.x, incidentRayEnd.y);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();

    // Draw reflected ray
    const reflectedRayEnd = {
      x: centerX + Math.cos(reflectedAngle * Math.PI / 180) * 100,
      y: centerY - Math.sin(reflectedAngle * Math.PI / 180) * 100
    };

    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(reflectedRayEnd.x, reflectedRayEnd.y);
    ctx.stroke();

    // Draw normal line
    if (showNormal) {
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 80);
      ctx.lineTo(centerX, centerY + 80);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw angles
    if (showAngles) {
      drawAngle(ctx, centerX, centerY, incidentAngle, '#ff6b6b');
      drawAngle(ctx, centerX, centerY, -reflectedAngle, '#4ecdc4');
    }
  };

  const drawMirror = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();

    if (type === 'plane') {
      ctx.moveTo(x - 100, y);
      ctx.lineTo(x + 100, y);
    } else if (type === 'concave') {
      ctx.arc(x, y - 50, 150, Math.PI * 0.2, Math.PI * 0.8);
    } else if (type === 'convex') {
      ctx.arc(x, y + 50, 150, Math.PI * 1.2, Math.PI * 1.8);
    }

    ctx.stroke();
  };

  const drawAngle = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const radius = 30;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (angle * Math.PI / 180);
    
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.stroke();

    // Angle label
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(`${Math.abs(angle)}°`, x + 35, y - 10);
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Reflection Simulator
          </h2>
          
          <div className="flex gap-6">
            <div className="flex-1">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white"
              />
            </div>
            
            <div className="w-80 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Controls
                </h3>
                
                <Slider
                  label="Incident Angle"
                  value={incidentAngle}
                  onChange={setIncidentAngle}
                  min={0}
                  max={90}
                  unit="°"
                />
                
                <Slider
                  label="Object Distance"
                  value={objectDistance}
                  onChange={setObjectDistance}
                  min={10}
                  max={100}
                  unit="cm"
                />
                
                <Slider
                  label="Object Height"
                  value={objectHeight}
                  onChange={setObjectHeight}
                  min={1}
                  max={20}
                  unit="cm"
                />
                
                <Slider
                  label="Focal Length"
                  value={focalLength}
                  onChange={setFocalLength}
                  min={5}
                  max={50}
                  unit="cm"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Display Options
                </h3>
                
                <Toggle
                  label="Show Normal"
                  checked={showNormal}
                  onChange={setShowNormal}
                />
                
                <Toggle
                  label="Show Angles"
                  checked={showAngles}
                  onChange={setShowAngles}
                />
                
                <Toggle
                  label="Show Image"
                  checked={showImage}
                  onChange={setShowImage}
                />
                
                <Toggle
                  label="Enable Animations"
                  checked={enableAnimations}
                  onChange={setEnableAnimations}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Mirror Type
                </h3>
                
                <div className="space-y-2">
                  {['plane', 'concave', 'convex'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="mirrorType"
                        value={type}
                        checked={mirrorType === type}
                        onChange={(e) => setMirrorType(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">
                        {type} Mirror
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <FormulaPanel
            formulas={[
              { name: "Law of Reflection", formula: "θᵢ = θᵣ" },
              { name: "Mirror Equation", formula: "1/f = 1/v + 1/u" },
              { name: "Magnification", formula: "m = -v/u" }
            ]}
          />
        </div>
      </div>
    </div>
  );
};