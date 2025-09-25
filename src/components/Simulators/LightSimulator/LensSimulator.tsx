import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';
import { calculateThinLensFormula, validateFocalLength, validateDistance } from '../../../utils/physicsConstants';

export const LensSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex');
  const [focalLength, setFocalLength] = useState(40);
  const [objectDistance, setObjectDistance] = useState(60);
  const [objectHeight, setObjectHeight] = useState(30);
  const [showAllRays, setShowAllRays] = useState(true);
  const [showImageRays, setShowImageRays] = useState(true);
  const [showFocalPoints, setShowFocalPoints] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);

  // Calculate image properties with enhanced physics validation
  const calculateImageProperties = () => {
    try {
      // Use physics constants validation
      const fError = validateFocalLength(focalLength);
      const uError = validateDistance(objectDistance, 'object distance');
      
      if (fError || uError) {
        return {
          imageDistance: 0,
          magnification: 1,
          imageHeight: objectHeight,
          imageType: 'virtual' as const,
          error: fError || uError || 'Unknown error'
        };
      }
      
      if (objectHeight <= 0) {
        return {
          imageDistance: 0,
          magnification: 1,
          imageHeight: 0,
          imageType: 'virtual' as const,
          error: 'Object height must be positive'
        };
      }
      
      // Check for object at focal point
      if (Math.abs(objectDistance - focalLength) < 0.1) {
        return {
          imageDistance: Infinity,
          magnification: Infinity,
          imageHeight: Infinity,
          imageType: 'real',
          error: 'Object at focal point - parallel rays'
        };
      }
      
      const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
      const magnification = -imageDistance / objectDistance;
      const imageHeight = magnification * objectHeight;
      
      // Determine image type and characteristics
      let imageType: 'real' | 'virtual';
      if (imageDistance > 0) {
        imageType = 'real';
      } else {
        imageType = 'virtual';
      }
      
      return {
        imageDistance: isFinite(imageDistance) ? imageDistance : 0,
        magnification: isFinite(magnification) ? magnification : 0,
        imageHeight: isFinite(imageHeight) ? imageHeight : 0,
        imageType,
        error: null
      };
    } catch (error) {
      console.warn('Error calculating image properties:', error);
      return {
        imageDistance: 0,
        magnification: 1,
        imageHeight: objectHeight,
        imageType: 'virtual',
        error: 'Calculation error'
      };
    }
  };
  
  const { imageDistance, magnification, imageHeight, imageType, error: calcError } = calculateImageProperties();

  useEffect(() => {
    drawLens();
  }, [lensType, focalLength, objectDistance, objectHeight, showAllRays, showImageRays, showFocalPoints, showMeasurements]);

  const drawLens = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }

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
    if (showFocalPoints) {
      drawFocalPoints(ctx, centerX, centerY, focalLength);
    }
    
    // Draw object
    const objX = centerX - objectDistance * 2;
    drawObject(ctx, objX, centerY, objectHeight);
    
    // Draw principal rays
    if (showAllRays) {
      drawPrincipalRays(ctx, centerX, centerY, objX, objectDistance, focalLength, objectHeight, lensType);
    }
    
    // Draw image
    if (Math.abs(imageDistance) < 400 && showImageRays) {
      const imgX = centerX + imageDistance * 2;
      drawImage(ctx, imgX, centerY, imageHeight, imageType);
    }

    // Draw measurements
    if (showMeasurements) {
      drawMeasurements(ctx, centerX, centerY, objX, objectDistance, imageDistance, focalLength);
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

  const drawMeasurements = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, objX: number, objDist: number, imgDist: number, f: number) => {
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.font = '12px sans-serif';
    
    // Object distance measurement
    ctx.beginPath();
    ctx.moveTo(objX, centerY + 60);
    ctx.lineTo(centerX, centerY + 60);
    ctx.stroke();
    
    ctx.fillStyle = '#64748B';
    ctx.fillText(`u = ${objDist} cm`, (objX + centerX) / 2 - 20, centerY + 80);
    
    // Image distance measurement
    if (Math.abs(imgDist) < 400) {
      const imgX = centerX + imgDist * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 60);
      ctx.lineTo(imgX, centerY + 60);
      ctx.stroke();
      
      ctx.fillText(`v = ${imgDist.toFixed(1)} cm`, (centerX + imgX) / 2 - 20, centerY + 80);
    }
    
    // Focal length measurement
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 60);
    ctx.lineTo(centerX + f * 2, centerY + 60);
    ctx.stroke();
    
    ctx.fillText(`f = ${f} cm`, centerX + f - 15, centerY + 80);
    
    ctx.setLineDash([]);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-blue-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Lens Simulator</h2>
      
      <div className="mb-6 p-4 bg-purple-100 border border-purple-300 rounded-lg">
        <p className="text-purple-800 text-sm">
          <strong>Lenses:</strong> Transparent optical devices that converge (convex) or diverge (concave) light rays. 
          They form real or virtual images based on object position. Lens formula: 1/f = 1/u + 1/v, where f is focal length, u is object distance, v is image distance.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-100 rounded-lg p-4 border-2 border-gray-300 shadow-lg">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-white rounded-lg border-2 border-blue-400"
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="bg-gray-100 rounded-lg p-6 space-y-6 border-2 border-gray-300 shadow-lg">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Lens Type</label>
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
            <label className="block text-gray-800 font-semibold mb-2">
              Focal Length: {focalLength} cm
            </label>
            <Slider
              min={10}
              max={80}
              value={focalLength}
              onChange={setFocalLength}
              unit="cm"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Object Distance: {objectDistance} cm
            </label>
            <Slider
              min={10}
              max={120}
              value={objectDistance}
              onChange={setObjectDistance}
              unit="cm"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Object Height: {objectHeight} cm
            </label>
            <Slider
              min={10}
              max={50}
              value={objectHeight}
              onChange={setObjectHeight}
              unit="cm"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Display Options</label>
            <div className="space-y-2">
              <Toggle
                checked={showAllRays}
                onChange={setShowAllRays}
                label="Show All Rays"
              />
              <Toggle
                checked={showImageRays}
                onChange={setShowImageRays}
                label="Show Image Formation"
              />
              <Toggle
                checked={showFocalPoints}
                onChange={setShowFocalPoints}
                label="Show Focal Points"
              />
              <Toggle
                checked={showMeasurements}
                onChange={setShowMeasurements}
                label="Show Measurements"
              />
            </div>
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
              `Power = ${(100/focalLength).toFixed(1)} D`,
              calcError ? `⚠️ ${calcError}` : ''
            ].filter(Boolean)}
          />
        </div>
      </div>

      {Math.abs(magnification) > 1 && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold flex items-center gap-2">
            🔍 Excellent! The lens is acting as a magnifier with {Math.abs(magnification).toFixed(1)}x magnification!
          </p>
        </div>
      )}
    </div>
  );
};