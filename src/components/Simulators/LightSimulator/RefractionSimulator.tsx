import React, { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import { Slider } from '../../ui/Slider';
import { FormulaPanel } from '../../ui/FormulaPanel';
=======
import { Slider } from './ui/Slider';
import { FormulaPanel } from './ui/FormulaPanel';
import { calculateSnellsLaw, validateAngle } from '../../../utils/physicsConstants';
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

export const RefractionSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
<<<<<<< HEAD
  const [mediumType, setMediumType] = useState<'air-glass' | 'glass-air' | 'air-water'>('air-glass');

  const getRefractiveIndices = () => {
    switch (mediumType) {
      case 'air-glass': return { n1: 1.0, n2: 1.5 };
      case 'glass-air': return { n1: 1.5, n2: 1.0 };
      case 'air-water': return { n1: 1.0, n2: 1.33 };
      default: return { n1: 1.0, n2: refractiveIndex };
    }
  };

  const { n1, n2 } = getRefractiveIndices();
  
  // Calculate refracted angle using Snell's law
  const sinRefracted = (n1 * Math.sin(incidentAngle * Math.PI / 180)) / n2;
  const refractedAngle = sinRefracted <= 1 
    ? Math.asin(sinRefracted) * 180 / Math.PI 
    : null; // Total internal reflection

  useEffect(() => {
    const timer = setTimeout(() => {
      drawRefraction();
    }, 100);
    return () => clearTimeout(timer);
=======
  const [mediumType, setMediumType] = useState<'air-glass' | 'glass-air' | 'air-water' | 'water-air' | 'air-diamond' | 'diamond-air' | 'glass-water' | 'water-glass'>('air-glass');

  const getRefractiveIndices = () => {
    switch (mediumType) {
      case 'air-glass': return { n1: 1.0, n2: 1.5, name1: 'Air', name2: 'Glass' };
      case 'glass-air': return { n1: 1.5, n2: 1.0, name1: 'Glass', name2: 'Air' };
      case 'air-water': return { n1: 1.0, n2: 1.33, name1: 'Air', name2: 'Water' };
      case 'water-air': return { n1: 1.33, n2: 1.0, name1: 'Water', name2: 'Air' };
      case 'air-diamond': return { n1: 1.0, n2: 2.42, name1: 'Air', name2: 'Diamond' };
      case 'diamond-air': return { n1: 2.42, n2: 1.0, name1: 'Diamond', name2: 'Air' };
      case 'glass-water': return { n1: 1.5, n2: 1.33, name1: 'Glass', name2: 'Water' };
      case 'water-glass': return { n1: 1.33, n2: 1.5, name1: 'Water', name2: 'Glass' };
      default: return { n1: 1.0, n2: refractiveIndex, name1: 'Medium 1', name2: 'Medium 2' };
    }
  };

  const { n1, n2, name1, name2 } = getRefractiveIndices();
  
  // Calculate refracted angle using Snell's law with error handling
  const calculateRefraction = () => {
    try {
      // Use validated physics calculations
      return calculateSnellsLaw(n1, n2, incidentAngle);
    } catch (error) {
      console.warn('Error calculating refraction:', error);
      return {
        refractedAngle: null,
        isTIR: false,
        error: 'Calculation error'
      };
    }
  };
  
  const { refractedAngle, isTIR, error: refractionError } = calculateRefraction();

  useEffect(() => {
    drawRefraction();
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
  }, [incidentAngle, refractiveIndex, mediumType]);

  const drawRefraction = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
<<<<<<< HEAD
    if (!ctx) return;
=======
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw interface
    drawInterface(ctx, canvas, centerX, centerY);
    
    // Draw media labels
<<<<<<< HEAD
    drawMediaLabels(ctx, centerX, centerY, mediumType);
=======
    drawMediaLabels(ctx, centerX, centerY);
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
    
    // Draw incident ray
    drawIncidentRay(ctx, centerX, centerY, incidentAngle);
    
    // Draw refracted ray or TIR
    if (refractedAngle !== null) {
      drawRefractedRay(ctx, centerX, centerY, refractedAngle);
<<<<<<< HEAD
    } else {
      drawTotalInternalReflection(ctx, centerX, centerY, incidentAngle);
=======
    } else if (isTIR) {
      drawTotalInternalReflection(ctx, centerX, centerY, incidentAngle);
    } else {
      // Show error state
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(refractionError || 'Error', centerX - 50, centerY - 100);
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
    }
    
    // Draw normal
    drawNormal(ctx, centerX, centerY);
    
    // Draw angles
    drawRefractionAngles(ctx, centerX, centerY, incidentAngle, refractedAngle);
  };

  const drawInterface = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, x: number, y: number) => {
    const { n1, n2 } = getRefractiveIndices();
    
    // First medium
    ctx.fillStyle = n1 < n2 ? '#DBEAFE' : '#FEF3C7';
    ctx.fillRect(0, 0, canvas.width, y);
    
    // Second medium
    ctx.fillStyle = n1 < n2 ? '#FEF3C7' : '#DBEAFE';
    ctx.fillRect(0, y, canvas.width, canvas.height);
    
    // Interface line
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  };

<<<<<<< HEAD
  const drawMediaLabels = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string) => {
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    
    const labels = {
      'air-glass': ['Air (n = 1.0)', 'Glass (n = 1.5)'],
      'glass-air': ['Glass (n = 1.5)', 'Air (n = 1.0)'],
      'air-water': ['Air (n = 1.0)', 'Water (n = 1.33)']
    };
    
    const [medium1, medium2] = labels[type];
    ctx.fillText(medium1, 20, y - 20);
    ctx.fillText(medium2, 20, y + 40);
=======
  const drawMediaLabels = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    
    ctx.fillText(`${name1} (n = ${n1})`, 20, y - 20);
    ctx.fillText(`${name2} (n = ${n2})`, 20, y + 40);
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
  };

  const drawIncidentRay = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const rayLength = 120;
    const startX = x - rayLength * Math.sin(angle * Math.PI / 180);
    const startY = y - rayLength * Math.cos(angle * Math.PI / 180);
    
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    drawArrow(ctx, startX, startY, x, y, '#EF4444');
  };

  const drawRefractedRay = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const rayLength = 120;
    const endX = x + rayLength * Math.sin(angle * Math.PI / 180);
    const endY = y + rayLength * Math.cos(angle * Math.PI / 180);
    
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    drawArrow(ctx, x, y, endX, endY, '#10B981');
  };

  const drawTotalInternalReflection = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const rayLength = 120;
    const endX = x + rayLength * Math.sin(angle * Math.PI / 180);
    const endY = y - rayLength * Math.cos(angle * Math.PI / 180);
    
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    drawArrow(ctx, x, y, endX, endY, '#8B5CF6');
    
    // TIR label
    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Total Internal Reflection!', x + 50, y - 80);
  };

  const drawRefractionAngles = (ctx: CanvasRenderingContext2D, x: number, y: number, incident: number, refracted: number | null) => {
    const radius = 50;
    
    // Incident angle arc
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI/2, (-Math.PI/2 - incident * Math.PI / 180), true);
    ctx.stroke();
    
    if (refracted !== null) {
      // Refracted angle arc
      ctx.strokeStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(x, y, radius, Math.PI/2, (Math.PI/2 - refracted * Math.PI / 180), true);
      ctx.stroke();
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 15;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(toX - arrowLength * Math.cos(angle - Math.PI/6), toY - arrowLength * Math.sin(angle - Math.PI/6));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - arrowLength * Math.cos(angle + Math.PI/6), toY - arrowLength * Math.sin(angle + Math.PI/6));
    ctx.stroke();
  };

  const drawNormal = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, y - 120);
    ctx.lineTo(x, y + 120);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Refraction of Light</h2>
      
      <div className="mb-6 p-4 bg-green-500/20 border border-green-400 rounded-lg">
        <p className="text-green-100 text-sm">
          <strong>Refraction:</strong> The bending of light when it passes from one medium to another with different optical density. 
          Governed by Snell's Law: n₁sinθ₁ = n₂sinθ₂, where n is the refractive index and θ is the angle with the normal.
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
              max={89}
              value={incidentAngle}
              onChange={setIncidentAngle}
<<<<<<< HEAD
=======
              unit="°"
              precision={0}
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Medium Combination</label>
            <select
              value={mediumType}
              onChange={(e) => setMediumType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
            >
              <option value="air-glass">Air → Glass</option>
              <option value="glass-air">Glass → Air</option>
              <option value="air-water">Air → Water</option>
<<<<<<< HEAD
=======
              <option value="water-air">Water → Air</option>
              <option value="air-diamond">Air → Diamond</option>
              <option value="diamond-air">Diamond → Air</option>
              <option value="glass-water">Glass → Water</option>
              <option value="water-glass">Water → Glass</option>
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
            </select>
          </div>

          <FormulaPanel
            title="Snell's Law"
            formulas={[
              `n₁ sin θ₁ = n₂ sin θ₂`,
              `n₁ = ${n1.toFixed(2)}`,
              `n₂ = ${n2.toFixed(2)}`,
              `θ₁ = ${incidentAngle}°`,
<<<<<<< HEAD
              refractedAngle ? `θ₂ = ${refractedAngle.toFixed(1)}°` : 'Total Internal Reflection!'
            ]}
=======
              refractedAngle ? `θ₂ = ${refractedAngle.toFixed(1)}°` : 'Total Internal Reflection!',
              refractionError ? `⚠️ ${refractionError}` : ''
            ].filter(Boolean)}
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
          />
        </div>
      </div>

      {refractedAngle === null && (
        <div className="mt-4 p-4 bg-purple-500/20 border border-purple-400 rounded-lg">
          <p className="text-purple-200 font-semibold">
            ⚡ Amazing! You've achieved Total Internal Reflection - the light cannot pass through!
          </p>
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
