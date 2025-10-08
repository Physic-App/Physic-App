import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';

export const PrismSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [prismAngle, setPrismAngle] = useState(60);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [wavelength, setWavelength] = useState(550);

  useEffect(() => {
    drawPrism();
  }, [incidentAngle, prismAngle, refractiveIndex, wavelength]);

  const drawPrism = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw prism
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    const prismSize = 100;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - prismSize);
    ctx.lineTo(centerX + prismSize * Math.cos(Math.PI / 6), centerY + prismSize * Math.sin(Math.PI / 6));
    ctx.lineTo(centerX - prismSize * Math.cos(Math.PI / 6), centerY + prismSize * Math.sin(Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw incident ray
    const incidentRayEnd = {
      x: centerX - Math.cos(incidentAngle * Math.PI / 180) * 120,
      y: centerY - Math.sin(incidentAngle * Math.PI / 180) * 120
    };

    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(incidentRayEnd.x, incidentRayEnd.y);
    ctx.lineTo(centerX - 50, centerY);
    ctx.stroke();
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Prism Simulator
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
                label="Prism Angle"
                value={prismAngle}
                onChange={setPrismAngle}
                min={30}
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
              
              <Slider
                label="Wavelength"
                value={wavelength}
                onChange={setWavelength}
                min={400}
                max={700}
                unit="nm"
              />
            </div>
          </div>
          
          <FormulaPanel
            formulas={[
              { name: "Angle of Deviation", formula: "δ = (n - 1)A" },
              { name: "Minimum Deviation", formula: "δmin = 2i - A" }
            ]}
          />
        </div>
      </div>
    </div>
  );
};