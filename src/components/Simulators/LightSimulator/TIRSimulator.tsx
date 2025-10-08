import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';

export const TIRSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [showCriticalAngle, setShowCriticalAngle] = useState(true);

  const criticalAngle = Math.asin(1 / refractiveIndex) * (180 / Math.PI);

  useEffect(() => {
    drawTIR();
  }, [incidentAngle, refractiveIndex, showCriticalAngle]);

  const drawTIR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw interface
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

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

    if (incidentAngle > criticalAngle) {
      // Total Internal Reflection
      const reflectedRayEnd = {
        x: centerX + Math.cos(incidentAngle * Math.PI / 180) * 100,
        y: centerY - Math.sin(incidentAngle * Math.PI / 180) * 100
      };

      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(reflectedRayEnd.x, reflectedRayEnd.y);
      ctx.stroke();
    } else {
      // Refraction
      const refractedAngle = Math.asin(Math.sin(incidentAngle * Math.PI / 180) / refractiveIndex) * (180 / Math.PI);
      const refractedRayEnd = {
        x: centerX + Math.cos(refractedAngle * Math.PI / 180) * 100,
        y: centerY + Math.sin(refractedAngle * Math.PI / 180) * 100
      };

      ctx.strokeStyle = '#45b7d1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(refractedRayEnd.x, refractedRayEnd.y);
      ctx.stroke();
    }

    // Draw critical angle line
    if (showCriticalAngle) {
      ctx.strokeStyle = '#ffa500';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(criticalAngle * Math.PI / 180) * 80,
        centerY - Math.sin(criticalAngle * Math.PI / 180) * 80
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Total Internal Reflection Simulator
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
              <Slider
                label="Incident Angle"
                value={incidentAngle}
                onChange={setIncidentAngle}
                min={0}
                max={90}
                unit="°"
              />
              
              <Slider
                label="Refractive Index"
                value={refractiveIndex}
                onChange={setRefractiveIndex}
                min={1.1}
                max={2.5}
                step={0.1}
              />
              
              <Toggle
                label="Show Critical Angle"
                checked={showCriticalAngle}
                onChange={setShowCriticalAngle}
              />
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Critical Angle:</strong> {criticalAngle.toFixed(1)}°
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                  {incidentAngle > criticalAngle ? 'Total Internal Reflection occurs' : 'Refraction occurs'}
                </p>
              </div>
            </div>
          </div>
          
          <FormulaPanel
            formulas={[
              { name: "Critical Angle", formula: "θc = sin⁻¹(1/n)" },
              { name: "Snell's Law", formula: "n₁sinθ₁ = n₂sinθ₂" }
            ]}
          />
        </div>
      </div>
    </div>
  );
};