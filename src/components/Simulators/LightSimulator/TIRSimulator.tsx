import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';
import { calculateCriticalAngle, validateAngle, validateRefractiveIndex } from '../../../utils/physicsConstants';

export const TIRSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [n1, setN1] = useState(1.5); // Glass
  const [n2] = useState(1.0); // Air
  const [showFiber, setShowFiber] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [applicationType, setApplicationType] = useState<'fiber' | 'prism' | 'diamond' | 'endoscope'>('fiber');
  const [showMultipleRays, setShowMultipleRays] = useState(false);

  // Calculate critical angle with enhanced physics validation
  const calculateCriticalAngleData = () => {
    // Validate inputs first
    const n1Error = validateRefractiveIndex(n1, 'n₁');
    const n2Error = validateRefractiveIndex(n2, 'n₂');
    const angleError = validateAngle(incidentAngle, 'incident angle');
    
    if (n1Error || n2Error || angleError) {
      return {
        criticalAngle: null,
        isTIR: false,
        error: n1Error || n2Error || angleError || 'Unknown error'
      };
    }
    
    // Use physics constants validation
    const result = calculateCriticalAngle(n1, n2);
    
    return {
      criticalAngle: result.angle,
      isTIR: result.angle ? incidentAngle > result.angle : false,
      error: result.error
    };
  };
  
  const { criticalAngle, isTIR, error: criticalAngleError } = calculateCriticalAngleData();

  useEffect(() => {
    drawTIR();
  }, [incidentAngle, n1, showFiber, showApplications, applicationType, showMultipleRays]);

  const drawTIR = () => {
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

    if (showApplications) {
      drawApplication(ctx, canvas, applicationType);
    } else if (showFiber) {
      drawOpticalFiber(ctx, canvas);
    } else {
      drawTIRInterface(ctx, canvas, centerX, centerY);
    }
  };

  const drawTIRInterface = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, x: number, y: number) => {
    // Draw media
    ctx.fillStyle = '#FEF3C7'; // Glass (denser)
    ctx.fillRect(0, 0, canvas.width, y);
    
    ctx.fillStyle = '#DBEAFE'; // Air (rarer)
    ctx.fillRect(0, y, canvas.width, canvas.height);
    
    // Interface
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    
    // Normal
    drawNormal(ctx, x, y);
    
    // Critical angle indicator
    drawCriticalAngle(ctx, x, y, criticalAngle);
    
    // Incident ray
    drawIncidentRay(ctx, x, y, incidentAngle);
    
    if (isTIR) {
      // Total internal reflection
      drawReflectedRay(ctx, x, y, incidentAngle);
    } else {
      // Refracted ray
      const refractedAngle = Math.asin((n1 * Math.sin(incidentAngle * Math.PI / 180)) / n2) * 180 / Math.PI;
      drawRefractedRay(ctx, x, y, refractedAngle);
    }
    
    // Labels
    drawMediaLabels(ctx, y);
  };

  const drawOpticalFiber = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const fiberY = canvas.height / 2;
    const fiberHeight = 40;
    
    // Fiber core
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(0, fiberY - fiberHeight/2, canvas.width, fiberHeight);
    
    // Fiber cladding
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, fiberY - fiberHeight/2);
    ctx.lineTo(canvas.width, fiberY - fiberHeight/2);
    ctx.moveTo(0, fiberY + fiberHeight/2);
    ctx.lineTo(canvas.width, fiberY + fiberHeight/2);
    ctx.stroke();
    
    // Light ray bouncing through fiber
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let x = 50;
    let y = fiberY;
    let angle = incidentAngle * Math.PI / 180;
    const step = 40;
    
    ctx.moveTo(x, y);
    
    for (let i = 0; i < 10; i++) {
      const nextX = x + step * Math.cos(angle);
      const nextY = y + step * Math.sin(angle);
      
      if (nextY <= fiberY - fiberHeight/2 || nextY >= fiberY + fiberHeight/2) {
        // Hit fiber boundary - reflect
        angle = -angle;
        const boundaryY = nextY <= fiberY - fiberHeight/2 ? fiberY - fiberHeight/2 : fiberY + fiberHeight/2;
        ctx.lineTo(x + step * Math.cos(-angle), boundaryY);
        y = boundaryY;
      } else {
        ctx.lineTo(nextX, nextY);
        y = nextY;
      }
      
      x += step * Math.cos(Math.abs(angle));
      
      if (x >= canvas.width - 50) break;
    }
    
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Optical Fiber - Light Guiding via TIR', 20, 30);
    ctx.fillText('Core (n = 1.5)', 20, fiberY - fiberHeight/2 - 10);
    ctx.fillText('Cladding (n = 1.4)', 20, fiberY + fiberHeight/2 + 25);
  };

  const drawApplication = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, appType: string) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (appType) {
      case 'fiber':
        drawOpticalFiber(ctx, canvas);
        break;
      case 'prism':
        drawPrismApplication(ctx, centerX, centerY);
        break;
      case 'diamond':
        drawDiamondApplication(ctx, centerX, centerY);
        break;
      case 'endoscope':
        drawEndoscopeApplication(ctx, centerX, centerY);
        break;
    }
  };

  const drawPrismApplication = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw prism
    ctx.fillStyle = 'rgba(147, 197, 253, 0.3)';
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    
    const size = 60;
    ctx.beginPath();
    ctx.moveTo(x - size, y + size/2);
    ctx.lineTo(x + size, y + size/2);
    ctx.lineTo(x, y - size * 0.866); // 60-60-60 triangle
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw TIR rays
    const rayLength = 80;
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    
    // Incident ray
    ctx.beginPath();
    const incidentX = x - size - rayLength * Math.cos(incidentAngle * Math.PI / 180);
    const incidentY = y + size/2 - rayLength * Math.sin(incidentAngle * Math.PI / 180);
    ctx.moveTo(incidentX, incidentY);
    ctx.lineTo(x - size, y + size/2);
    ctx.stroke();

    // TIR ray (reflected)
    if (isTIR) {
      ctx.strokeStyle = '#10B981';
      ctx.beginPath();
      const reflectedX = x + size + rayLength * Math.cos(incidentAngle * Math.PI / 180);
      const reflectedY = y + size/2 - rayLength * Math.sin(incidentAngle * Math.PI / 180);
      ctx.moveTo(x + size, y + size/2);
      ctx.lineTo(reflectedX, reflectedY);
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Prism (TIR)', x - 30, y - size * 0.866 - 20);
  };

  const drawDiamondApplication = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw diamond shape
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    const size = 50;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.6, y - size * 0.3);
    ctx.lineTo(x + size * 0.6, y + size * 0.3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.6, y + size * 0.3);
    ctx.lineTo(x - size * 0.6, y - size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw multiple TIR rays for brilliance
    if (isTIR) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 5; i++) {
        const angle = incidentAngle + (i - 2) * 10;
        const rayLength = 60;
        
        ctx.beginPath();
        const endX = x + rayLength * Math.cos(angle * Math.PI / 180);
        const endY = y - rayLength * Math.sin(angle * Math.PI / 180);
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Diamond (Brilliance)', x - 40, y + size + 20);
  };

  const drawEndoscopeApplication = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw endoscope tube
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x - 100, y);
    ctx.lineTo(x + 100, y);
    ctx.stroke();

    // Draw fiber bundle
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const offset = (i - 3) * 8;
      ctx.beginPath();
      ctx.moveTo(x - 100, y + offset);
      ctx.lineTo(x + 100, y + offset);
      ctx.stroke();
    }

    // Draw light source
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x - 120, y, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw camera/eye
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(x + 120, y, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw light rays
    if (isTIR) {
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * 15;
        ctx.beginPath();
        ctx.moveTo(x - 100, y + offset);
        ctx.lineTo(x + 100, y + offset);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Endoscope', x - 40, y + 50);
    ctx.font = '12px sans-serif';
    ctx.fillText('Light Source', x - 130, y - 15);
    ctx.fillText('Camera', x + 125, y - 15);
  };

  const drawCriticalAngle = (ctx: CanvasRenderingContext2D, x: number, y: number, critical: number) => {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(x, y, 60, -Math.PI/2, (-Math.PI/2 - critical * Math.PI / 180), true);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#F59E0B';
    ctx.font = '12px sans-serif';
    ctx.fillText(`θc = ${critical.toFixed(1)}°`, x - 100, y - 70);
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
    
    drawArrow(ctx, startX, startY, x, y, '#EF4444');
  };

  const drawReflectedRay = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const rayLength = 100;
    const endX = x + rayLength * Math.sin(angle * Math.PI / 180);
    const endY = y - rayLength * Math.cos(angle * Math.PI / 180);
    
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    drawArrow(ctx, x, y, endX, endY, '#8B5CF6');
  };

  const drawRefractedRay = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const rayLength = 100;
    const endX = x + rayLength * Math.sin(angle * Math.PI / 180);
    const endY = y + rayLength * Math.cos(angle * Math.PI / 180);
    
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    drawArrow(ctx, x, y, endX, endY, '#10B981');
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

  const drawMediaLabels = (ctx: CanvasRenderingContext2D, y: number) => {
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Glass (n = ${n1})`, 20, y - 20);
    ctx.fillText(`Air (n = ${n2})`, 20, y + 40);
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

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-blue-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Total Internal Reflection</h2>
      
      <div className="mb-6 p-4 bg-orange-100 border border-orange-300 rounded-lg">
        <p className="text-orange-800 text-sm">
          <strong>Total Internal Reflection:</strong> Complete reflection of light at the interface when traveling from denser to rarer medium 
          at angles greater than the critical angle (θc = sin⁻¹(n₂/n₁)). Used in optical fibers and diamond cutting.
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
            <label className="block text-gray-800 font-semibold mb-2">
              Incident Angle: {incidentAngle}°
            </label>
            <Slider
              min={0}
              max={89}
              value={incidentAngle}
              onChange={setIncidentAngle}
              unit="°"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Refractive Index (n₁): {n1.toFixed(2)}
            </label>
            <Slider
              min={1.3}
              max={2.0}
              step={0.05}
              value={n1}
              onChange={setN1}
              unit=""
              precision={2}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Demonstration</label>
            <div className="space-y-2">
              <button
                onClick={() => setShowFiber(!showFiber)}
                className={`w-full px-4 py-2 rounded-md font-semibold transition-colors ${
                  showFiber 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {showFiber ? 'Interface View' : 'Optical Fiber'}
              </button>
              
              <button
                onClick={() => setShowApplications(!showApplications)}
                className={`w-full px-4 py-2 rounded-md font-semibold transition-colors ${
                  showApplications 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {showApplications ? 'Basic View' : 'TIR Applications'}
              </button>
            </div>
          </div>

          {showApplications && (
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Application Type</label>
              <select
                value={applicationType}
                onChange={(e) => setApplicationType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
              >
                <option value="fiber">Optical Fiber</option>
                <option value="prism">Prism Reflector</option>
                <option value="diamond">Diamond Brilliance</option>
                <option value="endoscope">Endoscope</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Display Options</label>
            <div className="space-y-2">
              <Toggle
                checked={showMultipleRays}
                onChange={setShowMultipleRays}
                label="Show Multiple Rays"
              />
            </div>
          </div>

          <FormulaPanel
            title="Critical Angle"
            formulas={[
              `sin θc = n₂/n₁`,
              `θc = ${criticalAngle.toFixed(1)}°`,
              `Current angle: ${incidentAngle}°`,
              isTIR ? 'TIR Occurring!' : 'Refraction Occurring'
            ]}
          />
        </div>
      </div>

      {isTIR && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold flex items-center gap-2">
            ✨ Fantastic! Total Internal Reflection is happening - this is how optical fibers work!
          </p>
        </div>
      )}
    </div>
  );
};