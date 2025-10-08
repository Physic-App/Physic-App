import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';

export const PrismSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [prismAngle, setPrismAngle] = useState(60);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [showDispersion, setShowDispersion] = useState(false);

  // Calculate deviation
  const calculateDeviation = () => {
    const A = prismAngle * Math.PI / 180;
    const i1 = incidentAngle * Math.PI / 180;
    
    // First refraction
    const r1 = Math.asin(Math.sin(i1) / refractiveIndex);
    const r2 = A - r1;
    
    // Second refraction
    const i2 = Math.asin(refractiveIndex * Math.sin(r2));
    
    // Total deviation
    const deviation = (i1 + i2 - A) * 180 / Math.PI;
    
    return {
      r1: r1 * 180 / Math.PI,
      r2: r2 * 180 / Math.PI,
      i2: i2 * 180 / Math.PI,
      deviation
    };
  };

  const { deviation } = calculateDeviation();

  useEffect(() => {
    drawPrism();
  }, [incidentAngle, prismAngle, refractiveIndex, showDispersion]);

  const drawPrism = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw prism
    drawPrismShape(ctx, centerX, centerY, prismAngle);
    
    if (showDispersion) {
      drawDispersion(ctx, centerX, centerY);
    } else {
      drawSingleRay(ctx, centerX, centerY);
    }
  };

  const drawPrismShape = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    const size = 80;
    const A = angle * Math.PI / 180;
    
    ctx.fillStyle = 'rgba(147, 197, 253, 0.3)';
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(x - size, y + size/2);
    ctx.lineTo(x + size, y + size/2);
    ctx.lineTo(x, y - size * Math.tan(A/2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Prism angle label
    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`A = ${angle}°`, x - 15, y - size * Math.tan(A/2) - 10);
  };

  const drawSingleRay = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 80;
    
    // Incident ray
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const incidentLength = 100;
    const startX = x - size - incidentLength * Math.cos(incidentAngle * Math.PI / 180);
    const startY = y + size/2 - incidentLength * Math.sin(incidentAngle * Math.PI / 180);
    
    ctx.moveTo(startX, startY);
    ctx.lineTo(x - size, y + size/2);
    ctx.stroke();
    
    // Emergent ray
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    const emergentLength = 100;
    const endX = x + size + emergentLength * Math.cos((incidentAngle + deviation) * Math.PI / 180);
    const endY = y + size/2 + emergentLength * Math.sin((incidentAngle + deviation) * Math.PI / 180);
    
    ctx.moveTo(x + size, y + size/2);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Deviation angle
    drawDeviationAngle(ctx, x + size, y + size/2, deviation);
  };

  const drawDispersion = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 80;
    const colors = [
      { color: '#DC2626', n: 1.52, name: 'Red' },
      { color: '#EA580C', n: 1.51, name: 'Orange' },
      { color: '#EAB308', n: 1.50, name: 'Yellow' },
      { color: '#16A34A', n: 1.49, name: 'Green' },
      { color: '#2563EB', n: 1.48, name: 'Blue' },
      { color: '#4F46E5', n: 1.47, name: 'Indigo' },
      { color: '#7C3AED', n: 1.46, name: 'Violet' }
    ];

    colors.forEach((colorInfo, index) => {
      const deviation = calculateDeviationForN(colorInfo.n);
      
      ctx.strokeStyle = colorInfo.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const emergentLength = 120;
      const endX = x + size + emergentLength * Math.cos((incidentAngle + deviation) * Math.PI / 180);
      const endY = y + size/2 + emergentLength * Math.sin((incidentAngle + deviation) * Math.PI / 180);
      
      ctx.moveTo(x + size, y + size/2);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
    
    // White light label
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('White Light', x - size - 100, y + size/2 - 20);
    ctx.fillText('Spectrum', x + size + 50, y + size/2 + 50);
  };

  const calculateDeviationForN = (n: number) => {
    const A = prismAngle * Math.PI / 180;
    const i1 = incidentAngle * Math.PI / 180;
    
    try {
      const r1 = Math.asin(Math.sin(i1) / n);
      const r2 = A - r1;
      const i2 = Math.asin(n * Math.sin(r2));
      return (i1 + i2 - A) * 180 / Math.PI;
    } catch {
      return 0;
    }
  };

  const drawDeviationAngle = (ctx: CanvasRenderingContext2D, x: number, y: number, deviation: number) => {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    const radius = 60;
    ctx.arc(x, y, radius, 0, deviation * Math.PI / 180);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#F59E0B';
    ctx.font = '14px sans-serif';
    ctx.fillText(`δ = ${deviation.toFixed(1)}°`, x + 40, y - 40);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Prism Simulation</h2>
      
      <div className="mb-6 p-4 bg-indigo-500/20 border border-indigo-400 rounded-lg">
        <p className="text-indigo-100 text-sm">
          <strong>Prism:</strong> A transparent triangular optical element that deviates and disperses light. 
          Deviation (δ = i + e - A) depends on incident angle, prism angle, and refractive index. White light splits into spectrum due to dispersion.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-white rounded-lg border-2 border-blue-400/30"
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">
              Incident Angle: {incidentAngle}°
            </label>
            <Slider
              min={0}
              max={80}
              value={incidentAngle}
              onChange={setIncidentAngle}
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Prism Angle: {prismAngle}°
            </label>
            <Slider
              min={30}
              max={90}
              value={prismAngle}
              onChange={setPrismAngle}
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Refractive Index: {refractiveIndex}
            </label>
            <Slider
              min={1.3}
              max={2.0}
              step={0.05}
              value={refractiveIndex}
              onChange={setRefractiveIndex}
            />
          </div>

          <Toggle
            checked={showDispersion}
            onChange={setShowDispersion}
            label={showDispersion ? 'Showing Dispersion' : 'Single Ray'}
          />

          <FormulaPanel
            title="Prism Deviation"
            formulas={[
              `δ = i + e - A`,
              `Prism Angle: ${prismAngle}°`,
              `Deviation: ${deviation.toFixed(1)}°`,
              `Refractive Index: ${refractiveIndex}`
            ]}
          />
        </div>
      </div>

      {showDispersion && (
        <div className="mt-4 p-4 bg-indigo-500/20 border border-indigo-400 rounded-lg">
          <p className="text-indigo-200 font-semibold">
            🌈 Beautiful! You're seeing how white light separates into its rainbow colors!
          </p>
        </div>
      )}
    </div>
  );
};