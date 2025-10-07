import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { FormulaPanel } from './ui/FormulaPanel';

export const LensSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex');
  const [focalLength, setFocalLength] = useState(40);
  const [objectDistance, setObjectDistance] = useState(60);
  const [objectHeight, setObjectHeight] = useState(30);

  // Calculate image properties
  const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
  const magnification = -imageDistance / objectDistance;
  const imageHeight = magnification * objectHeight;
  const imageType = imageDistance > 0 ? 'real' : 'virtual';

  useEffect(() => {
    drawLens();
  }, [lensType, focalLength, objectDistance, objectHeight]);

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
    const lensHeight = 120;

    // Draw optical axis
    drawOpticalAxis(ctx, canvas, centerY);
    
    // Draw lens
    drawLensShape(ctx, centerX, centerY, lensHeight, lensType);
    
    // Draw focal points
    drawFocalPoints(ctx, centerX, centerY, focalLength);
    
    // Draw object
    const objX = centerX - objectDistance * 2;
    drawObject(ctx, objX, centerY, objectHeight);
    
    // Draw principal rays
    drawPrincipalRays(ctx, centerX, centerY, objX, objectDistance, focalLength, objectHeight, lensType);
    
    // Draw image
    if (Math.abs(imageDistance) < 400) {
      const imgX = centerX + imageDistance * 2;
      drawImage(ctx, imgX, centerY, imageHeight, imageType);
    }
  };

  const drawOpticalAxis = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, y: number) => {
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawLensShape = (ctx: CanvasRenderingContext2D, x: number, y: number, height: number, type: string) => {
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 4;
    
    if (type === 'convex') {
      // Convex lens
      ctx.beginPath();
      ctx.arc(x - 20, y, height/2, -Math.PI/2, Math.PI/2);
      ctx.arc(x + 20, y, height/2, Math.PI/2, 3*Math.PI/2);
      ctx.stroke();
    } else {
      // Concave lens
      ctx.beginPath();
      ctx.arc(x + 30, y, height/2, Math.PI/2, 3*Math.PI/2, true);
      ctx.arc(x - 30, y, height/2, -Math.PI/2, Math.PI/2, true);
      ctx.stroke();
    }
  };

  const drawFocalPoints = (ctx: CanvasRenderingContext2D, x: number, y: number, f: number) => {
    ctx.fillStyle = '#F97316';
    
    // Primary focal point
    ctx.beginPath();
    ctx.arc(x - f * 2, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Secondary focal point
    ctx.beginPath();
    ctx.arc(x + f * 2, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#F97316';
    ctx.font = '14px sans-serif';
    ctx.fillText('F₁', x - f * 2 - 10, y + 20);
    ctx.fillText('F₂', x + f * 2 - 10, y + 20);
  };

  const drawObject = (ctx: CanvasRenderingContext2D, x: number, y: number, height: number) => {
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - height);
    ctx.stroke();
    
    // Object arrow
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(x - 5, y - height + 5);
    ctx.lineTo(x, y - height);
    ctx.lineTo(x + 5, y - height + 5);
    ctx.fill();
    
    ctx.font = '14px sans-serif';
    ctx.fillText('Object', x - 20, y + 20);
  };

  const drawImage = (ctx: CanvasRenderingContext2D, x: number, y: number, height: number, type: string) => {
    const color = type === 'real' ? '#059669' : '#8B5CF6';
    const lineStyle = type === 'real' ? [] : [5, 5];
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.setLineDash(lineStyle);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Image arrow
    ctx.fillStyle = color;
    ctx.beginPath();
    if (height > 0) {
      ctx.moveTo(x - 5, y - height + 5);
      ctx.lineTo(x, y - height);
      ctx.lineTo(x + 5, y - height + 5);
    } else {
      ctx.moveTo(x - 5, y - height - 5);
      ctx.lineTo(x, y - height);
      ctx.lineTo(x + 5, y - height - 5);
    }
    ctx.fill();
    
    ctx.font = '14px sans-serif';
    ctx.fillText(`${type} Image`, x - 30, y + 20);
  };

  const drawPrincipalRays = (ctx: CanvasRenderingContext2D, lensX: number, lensY: number, objX: number, objDist: number, f: number, objHeight: number, type: string) => {
    const objTopY = lensY - objHeight;
    
    // Ray 1: Parallel to axis, passes through focus
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(objX, objTopY);
    ctx.lineTo(lensX, objTopY);
    ctx.stroke();
    
    // After lens
    ctx.beginPath();
    ctx.moveTo(lensX, objTopY);
    if (type === 'convex') {
      ctx.lineTo(lensX + f * 2, lensY);
    } else {
      // For concave, ray appears to come from virtual focus
      ctx.lineTo(lensX + 100, objTopY + 100 * Math.tan(Math.atan(objHeight / (f * 2))));
    }
    ctx.stroke();
    
    // Ray 2: Through optical center
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(objX, objTopY);
    ctx.lineTo(lensX + 150, objTopY);
    ctx.stroke();
    
    // Ray 3: Through focus, becomes parallel
    ctx.strokeStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.moveTo(objX, objTopY);
    ctx.lineTo(lensX, lensY - (objTopY - lensY) * f * 2 / Math.abs(objX - lensX));
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(lensX, lensY - (objTopY - lensY) * f * 2 / Math.abs(objX - lensX));
    ctx.lineTo(lensX + 100, lensY - (objTopY - lensY) * f * 2 / Math.abs(objX - lensX));
    ctx.stroke();
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Lens Simulator</h2>
      
      <div className="mb-6 p-4 bg-purple-500/20 border border-purple-400 rounded-lg">
        <p className="text-purple-100 text-sm">
          <strong>Lenses:</strong> Transparent optical devices that converge (convex) or diverge (concave) light rays. 
          They form real or virtual images based on object position. Lens formula: 1/f = 1/u + 1/v, where f is focal length, u is object distance, v is image distance.
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
              Focal Length: {focalLength} cm
            </label>
            <Slider
              min={10}
              max={80}
              value={focalLength}
              onChange={setFocalLength}
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Object Distance: {objectDistance} cm
            </label>
            <Slider
              min={10}
              max={120}
              value={objectDistance}
              onChange={setObjectDistance}
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Object Height: {objectHeight} cm
            </label>
            <Slider
              min={10}
              max={50}
              value={objectHeight}
              onChange={setObjectHeight}
            />
          </div>

          <FormulaPanel
            title="Lens Formula"
            formulas={[
              `1/f = 1/u + 1/v`,
              `f = ${focalLength} cm`,
              `u = ${objectDistance} cm`,
              `v = ${imageDistance.toFixed(1)} cm`,
              `m = ${magnification.toFixed(2)}`,
              `Image: ${imageType}`,
              `Power = ${(100/focalLength).toFixed(1)} D`
            ]}
          />
        </div>
      </div>

      {Math.abs(magnification) > 1 && (
        <div className="mt-4 p-4 bg-blue-500/20 border border-blue-400 rounded-lg">
          <p className="text-blue-200 font-semibold">
            🔍 Excellent! The lens is acting as a magnifier with {Math.abs(magnification).toFixed(1)}x magnification!
          </p>
        </div>
      )}
    </div>
  );
};