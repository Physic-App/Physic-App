import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '../../ui/Slider';
import { FormulaPanel } from '../../ui/FormulaPanel';

export const PrismSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [prismAngle, setPrismAngle] = useState(60);
  const [wavelength, setWavelength] = useState(500);

  useEffect(() => {
    const timer = setTimeout(() => {
      drawPrism();
    }, 100);
    return () => clearTimeout(timer);
  }, [incidentAngle, prismAngle, wavelength]);

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
    
    // Draw incident ray
    drawIncidentRay(ctx, centerX, centerY, incidentAngle);
    
    // Draw refracted rays (dispersion)
    drawDispersion(ctx, centerX, centerY, incidentAngle);
  };

  const drawPrismShape = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    
    const size = 80;
    const radians = (angle * Math.PI) / 180;
    
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * Math.cos(radians/2), y + size * Math.sin(radians/2));
    ctx.lineTo(x - size * Math.cos(radians/2), y + size * Math.sin(radians/2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#4F46E5';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Prism (${angle}°)`, x - 30, y + size + 20);
  };

  const drawIncidentRay = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const rayLength = 100;
    const startX = x - rayLength * Math.sin(angle * Math.PI / 180);
    const startY = y - rayLength * Math.cos(angle * Math.PI / 180);
    
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#EF4444';
    ctx.font = '12px sans-serif';
    ctx.fillText('Incident', startX - 30, startY - 10);
  };

  const drawDispersion = (ctx: CanvasRenderingContext2D, x: number, y: number, incident: number) => {
    const wavelengths = [400, 500, 600, 700]; // nm
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#EF4444'];
    
    wavelengths.forEach((wl, index) => {
      const deviation = calculateDeviation(incident, wl);
      const color = colors[index];
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const rayLength = 120;
      const endX = x + rayLength * Math.sin(deviation * Math.PI / 180);
      const endY = y + rayLength * Math.cos(deviation * Math.PI / 180);
      
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = color;
      ctx.font = '10px sans-serif';
      ctx.fillText(`${wl}nm`, endX + 5, endY - 5);
    });
  };

  const calculateDeviation = (incident: number, wavelength: number) => {
    // Simplified dispersion calculation
    const baseDeviation = incident * 0.8;
    const wavelengthFactor = (wavelength - 500) / 1000;
    return baseDeviation + wavelengthFactor * 20;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Prism Simulator</h2>
      
      <div className="mb-6 p-4 bg-indigo-500/20 border border-indigo-400 rounded-lg">
        <p className="text-indigo-100 text-sm">
          <strong>Prism:</strong> A transparent triangular object that separates white light into its constituent colors. 
          Different wavelengths (colors) bend at different angles due to dispersion.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-gray-900 rounded-lg border-2 border-indigo-400/30"
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
              max={60}
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
              Wavelength: {wavelength} nm
            </label>
            <Slider
              min={400}
              max={700}
              value={wavelength}
              onChange={setWavelength}
            />
          </div>

          <FormulaPanel
            title="Dispersion"
            formulas={[
              `n = c/v`,
              `Different λ → Different n`,
              `Violet (400nm) bends most`,
              `Red (700nm) bends least`,
              `Rainbow colors emerge!`
            ]}
          />
        </div>
      </div>

      <div className="mt-4 p-4 bg-rainbow-gradient rounded-lg">
        <p className="text-white font-semibold text-center">
          🌈 Watch the beautiful dispersion of white light into its spectrum!
        </p>
      </div>
    </div>
  );
};
