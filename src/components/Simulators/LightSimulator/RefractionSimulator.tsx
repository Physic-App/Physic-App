import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';

export const RefractionSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [n1, setN1] = useState(1.0);
  const [n2, setN2] = useState(1.5);
  const [showNormal, setShowNormal] = useState(true);

  const refractedAngle = Math.asin((n1 * Math.sin(incidentAngle * Math.PI / 180)) / n2) * (180 / Math.PI);

  useEffect(() => {
    drawRefraction();
  }, [incidentAngle, n1, n2, showNormal]);

  const drawRefraction = () => {
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

    // Draw refracted ray
    const refractedRayEnd = {
      x: centerX + Math.cos(refractedAngle * Math.PI / 180) * 100,
      y: centerY + Math.sin(refractedRayEnd * Math.PI / 180) * 100
    };

    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(refractedRayEnd.x, refractedRayEnd.y);
    ctx.stroke();

    // Draw normal
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
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Refraction Simulator
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
                label="Refractive Index (n₁)"
                value={n1}
                onChange={setN1}
                min={1.0}
                max={2.5}
                step={0.1}
              />
              
              <Slider
                label="Refractive Index (n₂)"
                value={n2}
                onChange={setN2}
                min={1.0}
                max={2.5}
                step={0.1}
              />
              
              <Toggle
                label="Show Normal"
                checked={showNormal}
                onChange={setShowNormal}
              />
            </div>
          </div>
          
          <FormulaPanel
            formulas={[
              { name: "Snell's Law", formula: "n₁sinθ₁ = n₂sinθ₂" },
              { name: "Refractive Index", formula: "n = c/v" }
            ]}
          />
        </div>
      </div>
    </div>
  );
};