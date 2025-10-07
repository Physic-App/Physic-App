import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '../../ui/Slider';
import { FormulaPanel } from '../../ui/FormulaPanel';

export const LensSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objectDistance, setObjectDistance] = useState(50);
  const [focalLength, setFocalLength] = useState(30);
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex');

  const imageDistance = lensType === 'convex' 
    ? (focalLength * objectDistance) / (objectDistance - focalLength)
    : (focalLength * objectDistance) / (objectDistance + focalLength);

  const magnification = -imageDistance / objectDistance;

  useEffect(() => {
    const timer = setTimeout(() => {
      drawLens();
    }, 100);
    return () => clearTimeout(timer);
  }, [objectDistance, focalLength, lensType]);

  useEffect(() => {
    const handleResize = () => {
      drawLens();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawLens = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw lens
    drawLensShape(ctx, centerX, centerY, lensType);
    
    // Draw object
    drawObject(ctx, centerX, centerY, objectDistance);
    
    // Draw image
    if (Math.abs(imageDistance) < 500) {
      drawImage(ctx, centerX, centerY, imageDistance, magnification);
    }
    
    // Draw principal axis
    drawPrincipalAxis(ctx, centerX, centerY);
    
    // Draw focal points
    drawFocalPoints(ctx, centerX, centerY, focalLength);
  };

  const drawLensShape = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string) => {
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 4;
    
    if (type === 'convex') {
      // Convex lens
      ctx.beginPath();
      ctx.arc(x - 20, y, 60, Math.PI/2, 3*Math.PI/2);
      ctx.arc(x + 20, y, 60, -Math.PI/2, Math.PI/2);
      ctx.stroke();
    } else {
      // Concave lens
      ctx.beginPath();
      ctx.arc(x + 20, y, 60, Math.PI/2, 3*Math.PI/2);
      ctx.arc(x - 20, y, 60, -Math.PI/2, Math.PI/2);
      ctx.stroke();
    }
  };

  const drawObject = (ctx: CanvasRenderingContext2D, x: number, y: number, distance: number) => {
    const objX = x - distance * 2;
    
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objX, y);
    ctx.lineTo(objX, y - 40);
    ctx.stroke();
    
    // Arrow head
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(objX - 5, y - 35);
    ctx.lineTo(objX, y - 40);
    ctx.lineTo(objX + 5, y - 35);
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#F59E0B';
    ctx.font = '14px sans-serif';
    ctx.fillText('Object', objX - 20, y - 50);
  };

  const drawImage = (ctx: CanvasRenderingContext2D, x: number, y: number, distance: number, mag: number) => {
    const imgX = x + Math.abs(distance) * 2;
    const imgHeight = 40 * Math.abs(mag);
    
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(imgX, y);
    ctx.lineTo(imgX, y + imgHeight);
    ctx.stroke();
    
    // Arrow head
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.moveTo(imgX - 5, y + imgHeight - 5);
    ctx.lineTo(imgX, y + imgHeight);
    ctx.lineTo(imgX + 5, y + imgHeight - 5);
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#8B5CF6';
    ctx.font = '14px sans-serif';
    ctx.fillText('Image', imgX - 15, y + imgHeight + 20);
  };

  const drawPrincipalAxis = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawFocalPoints = (ctx: CanvasRenderingContext2D, x: number, y: number, focal: number) => {
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(x + focal * 2, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x - focal * 2, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#F97316';
    ctx.font = '12px sans-serif';
    ctx.fillText('F', x + focal * 2, y + 20);
    ctx.fillText('F', x - focal * 2, y + 20);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Lens Simulator</h2>
      
      <div className="mb-6 p-4 bg-purple-500/20 border border-purple-400 rounded-lg">
        <p className="text-purple-100 text-sm">
          <strong>Lens:</strong> A transparent material that bends light rays to form images. 
          Convex lenses converge light rays, while concave lenses diverge them.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-gray-900 rounded-lg border-2 border-purple-400/30"
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">Lens Type</label>
            <select
              value={lensType}
              onChange={(e) => setLensType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
            >
              <option value="convex">Convex Lens</option>
              <option value="concave">Concave Lens</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Object Distance: {objectDistance} cm
            </label>
            <Slider
              min={10}
              max={80}
              value={objectDistance}
              onChange={setObjectDistance}
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Focal Length: {focalLength} cm
            </label>
            <Slider
              min={10}
              max={50}
              value={focalLength}
              onChange={setFocalLength}
            />
          </div>

          <FormulaPanel
            title="Lens Formula"
            formulas={[
              `1/f = 1/u + 1/v`,
              `f = ${focalLength} cm`,
              `u = ${objectDistance} cm`,
              `v = ${imageDistance.toFixed(1)} cm`,
              `m = ${magnification.toFixed(2)}`
            ]}
          />
        </div>
      </div>
    </div>
  );
};
