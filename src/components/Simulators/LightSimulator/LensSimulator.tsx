import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';

export const LensSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objectDistance, setObjectDistance] = useState(30);
  const [objectHeight, setObjectHeight] = useState(10);
  const [focalLength, setFocalLength] = useState(20);
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex');
  const [showRays, setShowRays] = useState(true);
  const [showImage, setShowImage] = useState(true);

  const imageDistance = lensType === 'convex' 
    ? (objectDistance * focalLength) / (objectDistance - focalLength)
    : (objectDistance * focalLength) / (objectDistance + focalLength);

  const magnification = -imageDistance / objectDistance;
  const imageHeight = objectHeight * magnification;

  useEffect(() => {
    drawLens();
  }, [objectDistance, objectHeight, focalLength, lensType, showRays, showImage]);

  const drawLens = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lens
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    if (lensType === 'convex') {
      ctx.arc(centerX - 30, centerY, 100, Math.PI * 0.25, Math.PI * 0.75);
      ctx.arc(centerX + 30, centerY, 100, Math.PI * 1.25, Math.PI * 1.75);
    } else {
      ctx.arc(centerX - 30, centerY, 100, Math.PI * 1.25, Math.PI * 1.75);
      ctx.arc(centerX + 30, centerY, 100, Math.PI * 0.25, Math.PI * 0.75);
    }
    
    ctx.stroke();

    // Draw object
    const objectX = centerX - objectDistance;
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(objectX - 5, centerY - objectHeight, 10, objectHeight * 2);

    // Draw image
    if (showImage && imageDistance > 0) {
      const imageX = centerX + imageDistance;
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(imageX - 5, centerY - imageHeight, 10, Math.abs(imageHeight) * 2);
    }

    // Draw rays
    if (showRays) {
      ctx.strokeStyle = '#ffa500';
      ctx.lineWidth = 2;
      
      // Parallel ray
      ctx.beginPath();
      ctx.moveTo(centerX - 100, centerY - objectHeight);
      ctx.lineTo(centerX - 30, centerY - objectHeight);
      if (lensType === 'convex') {
        ctx.lineTo(centerX + 30, centerY - objectHeight + (focalLength * 0.5));
        ctx.lineTo(centerX + 100, centerY - objectHeight + (focalLength * 0.5));
      }
      ctx.stroke();

      // Focal ray
      ctx.beginPath();
      ctx.moveTo(centerX - 100, centerY - objectHeight);
      ctx.lineTo(centerX - 30, centerY - objectHeight);
      if (lensType === 'convex') {
        ctx.lineTo(centerX + 30, centerY + objectHeight);
        ctx.lineTo(centerX + 100, centerY + objectHeight);
      }
      ctx.stroke();
    }
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Lens Simulator
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
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="lensType"
                    value="convex"
                    checked={lensType === 'convex'}
                    onChange={(e) => setLensType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Convex Lens</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="lensType"
                    value="concave"
                    checked={lensType === 'concave'}
                    onChange={(e) => setLensType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Concave Lens</span>
                </label>
              </div>
              
              <Toggle
                label="Show Rays"
                checked={showRays}
                onChange={setShowRays}
              />
              
              <Toggle
                label="Show Image"
                checked={showImage}
                onChange={setShowImage}
              />
            </div>
          </div>
          
          <FormulaPanel
            formulas={[
              { name: "Lens Equation", formula: "1/f = 1/v + 1/u" },
              { name: "Magnification", formula: "m = -v/u" }
            ]}
          />
        </div>
      </div>
    </div>
  );
};