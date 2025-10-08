import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';

export const ReflectionSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [mirrorType, setMirrorType] = useState<'plane' | 'concave' | 'convex'>('plane');
  const [surfaceType, setSurfaceType] = useState<'smooth' | 'rough'>('smooth');
  const [objectDistance, setObjectDistance] = useState(30);
  const [focalLength, setFocalLength] = useState(20);

  const reflectedAngle = incidentAngle; // Law of reflection

  useEffect(() => {
    drawReflection();
  }, [incidentAngle, mirrorType, surfaceType, objectDistance, focalLength]);

  const drawReflection = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const mirrorLength = 200;

    // Draw mirror based on type
    drawMirror(ctx, centerX, centerY, mirrorLength, mirrorType);
    
    // Draw incident and reflected rays
    if (surfaceType === 'smooth') {
      drawRays(ctx, centerX, centerY, incidentAngle, reflectedAngle);
    } else {
      drawScatteredRays(ctx, centerX, centerY, incidentAngle);
    }

    // Draw normal line
    drawNormal(ctx, centerX, centerY);
    
    // Draw angle measurements
    drawAngles(ctx, centerX, centerY, incidentAngle, reflectedAngle);

    // Draw image formation for spherical mirrors
    if (mirrorType !== 'plane') {
      drawImageFormation(ctx, centerX, centerY, objectDistance, focalLength, mirrorType);
    }
  };

  const drawMirror = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, type: string) => {
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 4;
    
    if (type === 'plane') {
      ctx.beginPath();
      ctx.moveTo(x, y - length/2);
      ctx.lineTo(x, y + length/2);
      ctx.stroke();
    } else if (type === 'concave') {
      ctx.beginPath();
      ctx.arc(x + 50, y, length/2, Math.PI/2, 3*Math.PI/2);
      ctx.stroke();
    } else if (type === 'convex') {
      ctx.beginPath();
      ctx.arc(x - 50, y, length/2, -Math.PI/2, Math.PI/2);
      ctx.stroke();
    }
  };

  const drawRays = (ctx: CanvasRenderingContext2D, x: number, y: number, incident: number, reflected: number) => {
    const rayLength = 120;
    
    // Incident ray
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const incidentX = x - rayLength * Math.sin(incident * Math.PI / 180);
    const incidentY = y - rayLength * Math.cos(incident * Math.PI / 180);
    ctx.moveTo(incidentX, incidentY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Add arrow
    drawArrow(ctx, incidentX, incidentY, x, y, '#EF4444');
    
    // Reflected ray
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const reflectedX = x + rayLength * Math.sin(reflected * Math.PI / 180);
    const reflectedY = y - rayLength * Math.cos(reflected * Math.PI / 180);
    ctx.moveTo(x, y);
    ctx.lineTo(reflectedX, reflectedY);
    ctx.stroke();
    
    // Add arrow
    drawArrow(ctx, x, y, reflectedX, reflectedY, '#10B981');
  };

  const drawScatteredRays = (ctx: CanvasRenderingContext2D, x: number, y: number, incident: number) => {
    const rayLength = 120;
    
    // Incident ray
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const incidentX = x - rayLength * Math.sin(incident * Math.PI / 180);
    const incidentY = y - rayLength * Math.cos(incident * Math.PI / 180);
    ctx.moveTo(incidentX, incidentY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Multiple scattered rays
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const scatterAngle = incident + (Math.random() - 0.5) * 60;
      ctx.beginPath();
      const scatteredX = x + (rayLength * 0.6) * Math.sin(scatterAngle * Math.PI / 180);
      const scatteredY = y - (rayLength * 0.6) * Math.cos(scatterAngle * Math.PI / 180);
      ctx.moveTo(x, y);
      ctx.lineTo(scatteredX, scatteredY);
      ctx.stroke();
    }
  };

  const drawNormal = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, y - 100);
    ctx.lineTo(x, y + 100);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Label
    ctx.fillStyle = '#64748B';
    ctx.font = '14px sans-serif';
    ctx.fillText('Normal', x + 10, y - 80);
  };

  const drawAngles = (ctx: CanvasRenderingContext2D, x: number, y: number, incident: number, reflected: number) => {
    const radius = 40;
    
    // Incident angle arc
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI/2, (-Math.PI/2 - incident * Math.PI / 180), true);
    ctx.stroke();
    
    // Reflected angle arc
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI/2, (-Math.PI/2 + reflected * Math.PI / 180));
    ctx.stroke();
    
    // Angle labels
    ctx.fillStyle = '#EF4444';
    ctx.font = '14px sans-serif';
    ctx.fillText(`i = ${incident}°`, x - 80, y - 50);
    
    ctx.fillStyle = '#10B981';
    ctx.fillText(`r = ${reflected}°`, x + 50, y - 50);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 15;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(toX - arrowLength * Math.cos(angle - Math.PI/6), toY - arrowLength * Math.sin(angle - Math.PI/6));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - arrowLength * Math.cos(angle + Math.PI/6), toY - arrowLength * Math.sin(angle + Math.PI/6));
    ctx.stroke();
  };

  const drawImageFormation = (ctx: CanvasRenderingContext2D, x: number, y: number, objDist: number, focal: number, type: string) => {
    // Object
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const objX = x - objDist * 2;
    ctx.moveTo(objX, y);
    ctx.lineTo(objX, y - 40);
    ctx.stroke();
    
    // Object arrow
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(objX - 5, y - 35);
    ctx.lineTo(objX, y - 40);
    ctx.lineTo(objX + 5, y - 35);
    ctx.fill();
    
    // Calculate image position
    let imageDistance;
    if (type === 'concave') {
      imageDistance = (focal * objDist) / (objDist - focal);
    } else {
      imageDistance = (focal * objDist) / (objDist + focal);
    }
    
    if (imageDistance > 0 && imageDistance < 500) {
      // Real image
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const imgX = x + Math.abs(imageDistance) * 2;
      const magnification = -imageDistance / objDist;
      ctx.moveTo(imgX, y);
      ctx.lineTo(imgX, y + 40 * magnification);
      ctx.stroke();
    }
    
    // Focal points
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(x + focal * 2, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#F97316';
    ctx.font = '12px sans-serif';
    ctx.fillText('F', x + focal * 2, y + 20);
  };

  const magnification = mirrorType !== 'plane' ? (-objectDistance + focalLength) / objectDistance : 1;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Reflection of Light</h2>
      
      <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400 rounded-lg">
        <p className="text-blue-100 text-sm">
          <strong>Reflection:</strong> When light rays strike a surface and bounce back into the same medium. 
          The angle of incidence equals the angle of reflection (i = r), and both rays lie in the same plane as the normal.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-gray-900 rounded-lg border-2 border-blue-400/30"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">
              Angle of Incidence: {incidentAngle}°
            </label>
            <Slider
              min={0}
              max={80}
              value={incidentAngle}
              onChange={setIncidentAngle}
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Mirror Type</label>
            <select
              value={mirrorType}
              onChange={(e) => setMirrorType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
            >
              <option value="plane">Plane Mirror</option>
              <option value="concave">Concave Mirror</option>
              <option value="convex">Convex Mirror</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Surface Type</label>
            <Toggle
              checked={surfaceType === 'smooth'}
              onChange={(checked) => setSurfaceType(checked ? 'smooth' : 'rough')}
              label={surfaceType === 'smooth' ? 'Smooth Surface' : 'Rough Surface'}
            />
          </div>

          {mirrorType !== 'plane' && (
            <>
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
                  min={5}
                  max={40}
                  value={focalLength}
                  onChange={setFocalLength}
                />
              </div>
            </>
          )}

          <FormulaPanel
            title="Laws of Reflection"
            formulas={[
              `Angle of Incidence = ${incidentAngle}°`,
              `Angle of Reflection = ${reflectedAngle}°`,
              mirrorType !== 'plane' ? `Magnification = ${magnification.toFixed(2)}` : '',
              mirrorType !== 'plane' ? `1/f = 1/u + 1/v` : ''
            ].filter(Boolean)}
          />
        </div>
      </div>

      {incidentAngle === reflectedAngle && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-400 rounded-lg">
          <p className="text-green-200 font-semibold">
            🎉 Perfect! The incident and reflected rays follow the law of reflection!
          </p>
        </div>
      )}
    </div>
  );
};
