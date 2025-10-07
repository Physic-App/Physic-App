import React, { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import { Slider } from '../../ui/Slider';
import { Toggle } from '../../ui/Toggle';
import { FormulaPanel } from '../../ui/FormulaPanel';
=======
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';
import { InfoPanel } from './ui/InfoPanel';
import { getPhysicsExplanation } from '../../../data/physicsExplanations';
import { RayAnimation, VisualEffects } from '../../../utils/visualEffects';
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

export const ReflectionSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [mirrorType, setMirrorType] = useState<'plane' | 'concave' | 'convex'>('plane');
  const [surfaceType, setSurfaceType] = useState<'smooth' | 'rough'>('smooth');
  const [objectDistance, setObjectDistance] = useState(30);
<<<<<<< HEAD
  const [focalLength, setFocalLength] = useState(20);
=======
  const [objectHeight, setObjectHeight] = useState(10);
  const [focalLength, setFocalLength] = useState(20);
  const [showMultipleRays, setShowMultipleRays] = useState(false);
  const [showNormal, setShowNormal] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

  const reflectedAngle = incidentAngle; // Law of reflection

  useEffect(() => {
<<<<<<< HEAD
    const timer = setTimeout(() => {
      drawReflection();
    }, 100);
    return () => clearTimeout(timer);
  }, [incidentAngle, mirrorType, surfaceType, objectDistance, focalLength]);
=======
    if (enableAnimations) {
      // Add a small delay for smooth animations
      const timeoutId = setTimeout(() => {
        drawReflection();
      }, 50);
      return () => clearTimeout(timeoutId);
    } else {
      drawReflection();
    }
  }, [incidentAngle, mirrorType, surfaceType, objectDistance, objectHeight, focalLength, showMultipleRays, showNormal, showAngles, showImage, enableAnimations]);
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f

  const drawReflection = () => {
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
<<<<<<< HEAD
      drawRays(ctx, centerX, centerY, incidentAngle, reflectedAngle);
=======
      if (showMultipleRays) {
        drawMultipleRays(ctx, centerX, centerY, incidentAngle, reflectedAngle);
      } else {
        drawRays(ctx, centerX, centerY, incidentAngle, reflectedAngle);
      }
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
    } else {
      drawScatteredRays(ctx, centerX, centerY, incidentAngle);
    }

    // Draw normal line
<<<<<<< HEAD
    drawNormal(ctx, centerX, centerY);
    
    // Draw angle measurements
    drawAngles(ctx, centerX, centerY, incidentAngle, reflectedAngle);

    // Draw image formation for spherical mirrors
    if (mirrorType !== 'plane') {
=======
    if (showNormal) {
      drawNormal(ctx, centerX, centerY);
    }
    
    // Draw angle measurements
    if (showAngles) {
      drawAngles(ctx, centerX, centerY, incidentAngle, reflectedAngle);
    }

    // Draw image formation for spherical mirrors
    if (mirrorType !== 'plane' && showImage) {
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
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
    
<<<<<<< HEAD
    // Incident ray
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const incidentX = x - rayLength * Math.sin(incident * Math.PI / 180);
    const incidentY = y - rayLength * Math.cos(incident * Math.PI / 180);
=======
    // Convert angles to radians for proper calculation
    const incidentRad = incident * Math.PI / 180;
    const reflectedRad = reflected * Math.PI / 180;
    
    // Incident ray - corrected coordinate system
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const incidentX = x - rayLength * Math.sin(incidentRad);
    const incidentY = y - rayLength * Math.cos(incidentRad);
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
    ctx.moveTo(incidentX, incidentY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Add arrow
    drawArrow(ctx, incidentX, incidentY, x, y, '#EF4444');
    
<<<<<<< HEAD
    // Reflected ray
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const reflectedX = x + rayLength * Math.sin(reflected * Math.PI / 180);
    const reflectedY = y - rayLength * Math.cos(reflected * Math.PI / 180);
=======
    // Reflected ray - corrected coordinate system
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const reflectedX = x + rayLength * Math.sin(reflectedRad);
    const reflectedY = y - rayLength * Math.cos(reflectedRad);
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
    ctx.moveTo(x, y);
    ctx.lineTo(reflectedX, reflectedY);
    ctx.stroke();
    
    // Add arrow
    drawArrow(ctx, x, y, reflectedX, reflectedY, '#10B981');
  };

<<<<<<< HEAD
=======
  const drawMultipleRays = (ctx: CanvasRenderingContext2D, x: number, y: number, incident: number, reflected: number) => {
    const rayLength = 120;
    const rayCount = 5;
    
    // Draw multiple incident rays from different points
    for (let i = 0; i < rayCount; i++) {
      const offset = (i - (rayCount - 1) / 2) * 20;
      const incidentX = x - rayLength * Math.sin(incident * Math.PI / 180) + offset;
      const incidentY = y - rayLength * Math.cos(incident * Math.PI / 180);
      const intersectionX = x + offset * Math.sin(incident * Math.PI / 180) / Math.cos(incident * Math.PI / 180);
      const intersectionY = y;
      
      // Incident ray
      ctx.strokeStyle = `rgba(239, 68, 68, ${1 - i * 0.1})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(incidentX, incidentY);
      ctx.lineTo(intersectionX, intersectionY);
      ctx.stroke();
      
      // Reflected ray
      ctx.strokeStyle = `rgba(16, 185, 129, ${1 - i * 0.1})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const reflectedX = intersectionX + rayLength * Math.sin(reflected * Math.PI / 180);
      const reflectedY = intersectionY - rayLength * Math.cos(reflected * Math.PI / 180);
      ctx.moveTo(intersectionX, intersectionY);
      ctx.lineTo(reflectedX, reflectedY);
      ctx.stroke();
      
      // Add arrows
      drawArrow(ctx, incidentX, incidentY, intersectionX, intersectionY, `rgba(239, 68, 68, ${1 - i * 0.1})`);
      drawArrow(ctx, intersectionX, intersectionY, reflectedX, reflectedY, `rgba(16, 185, 129, ${1 - i * 0.1})`);
    }
  };

>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
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

<<<<<<< HEAD
  const magnification = mirrorType !== 'plane' ? (-objectDistance + focalLength) / objectDistance : 1;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Reflection of Light</h2>
      
      <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400 rounded-lg">
        <p className="text-blue-100 text-sm">
=======
  // Correct magnification formula for spherical mirrors: m = -v/u
  // where v = image distance, u = object distance
  const calculateMagnification = () => {
    if (mirrorType === 'plane') return 1;
    
    // For spherical mirrors: 1/f = 1/v + 1/u, so v = (f*u)/(u-f)
    // Magnification m = -v/u = -f/(u-f)
    const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
    return -imageDistance / objectDistance;
  };
  
  const magnification = calculateMagnification();
  
  // Calculate image properties for spherical mirrors
  const calculateImageProperties = () => {
    if (mirrorType === 'plane') {
      return {
        imageDistance: -objectDistance, // Virtual image behind mirror
        imageHeight: objectHeight,
        imageType: 'virtual' as const
      };
    }
    
    // Spherical mirror formula: 1/f = 1/v + 1/u
    // Solving for v: v = (f*u)/(u-f)
    const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
    const imageHeight = Math.abs(magnification) * objectHeight;
    
    // Determine image characteristics
    let imageType: 'real' | 'virtual';
    if (imageDistance > 0) {
      imageType = 'real';
    } else {
      imageType = 'virtual';
    }
    
    return {
      imageDistance,
      imageHeight,
      imageType
    };
  };
  
  const imageProps = calculateImageProperties();

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-blue-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reflection of Light</h2>
          <p className="text-blue-600 text-sm">Law of Reflection & Mirror Physics</p>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
        <p className="text-blue-800 text-sm">
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
          <strong>Reflection:</strong> When light rays strike a surface and bounce back into the same medium. 
          The angle of incidence equals the angle of reflection (i = r), and both rays lie in the same plane as the normal.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
<<<<<<< HEAD
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
=======
        <div className="lg:col-span-2 bg-gray-100 rounded-lg p-4 border-2 border-gray-300 shadow-lg">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-96 bg-white rounded-xl border-2 border-blue-400 shadow-2xl"
              style={{ minHeight: '400px' }}
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-blue-600 text-sm font-medium">Interactive Canvas</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-100 rounded-lg p-6 space-y-6 border-2 border-gray-300 shadow-lg">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
              Angle of Incidence: {incidentAngle}°
            </label>
            <Slider
              min={0}
              max={80}
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
<<<<<<< HEAD
            <label className="block text-white font-semibold mb-2">Mirror Type</label>
=======
            <label className="block text-gray-800 font-semibold mb-2">Mirror Type</label>
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
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
<<<<<<< HEAD
            <label className="block text-white font-semibold mb-2">Surface Type</label>
=======
            <label className="block text-gray-800 font-semibold mb-2">Surface Type</label>
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
            <Toggle
              checked={surfaceType === 'smooth'}
              onChange={(checked) => setSurfaceType(checked ? 'smooth' : 'rough')}
              label={surfaceType === 'smooth' ? 'Smooth Surface' : 'Rough Surface'}
            />
          </div>

<<<<<<< HEAD
          {mirrorType !== 'plane' && (
            <>
              <div>
                <label className="block text-white font-semibold mb-2">
=======
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Display Options</label>
            <div className="space-y-2">
              <Toggle
                checked={showMultipleRays}
                onChange={setShowMultipleRays}
                label="Multiple Rays"
              />
              <Toggle
                checked={showNormal}
                onChange={setShowNormal}
                label="Show Normal"
              />
              <Toggle
                checked={showAngles}
                onChange={setShowAngles}
                label="Show Angles"
              />
              {mirrorType !== 'plane' && (
                <Toggle
                  checked={showImage}
                  onChange={setShowImage}
                  label="Show Image Formation"
                />
              )}
              <Toggle
                checked={enableAnimations}
                onChange={setEnableAnimations}
                label="Enable Animations"
              />
            </div>
          </div>

          {mirrorType !== 'plane' && (
            <>
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
                  Object Distance: {objectDistance} cm
                </label>
                <Slider
                  min={10}
                  max={80}
                  value={objectDistance}
                  onChange={setObjectDistance}
<<<<<<< HEAD
=======
                  unit="cm"
                  precision={0}
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
                />
              </div>

              <div>
<<<<<<< HEAD
                <label className="block text-white font-semibold mb-2">
=======
                <label className="block text-gray-800 font-semibold mb-2">
                  Object Height: {objectHeight} cm
                </label>
                <Slider
                  min={2}
                  max={20}
                  value={objectHeight}
                  onChange={setObjectHeight}
                  unit="cm"
                  precision={0}
                />
              </div>

              <div>
                <label className="block text-gray-800 font-semibold mb-2">
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
                  Focal Length: {focalLength} cm
                </label>
                <Slider
                  min={5}
                  max={40}
                  value={focalLength}
                  onChange={setFocalLength}
<<<<<<< HEAD
=======
                  unit="cm"
                  precision={0}
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
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
<<<<<<< HEAD
=======


          <InfoPanel
            title={getPhysicsExplanation('reflection')?.title || "Reflection Physics"}
            content={getPhysicsExplanation('reflection') || {
              definition: "Reflection is the change in direction of a wave at a boundary between two different media so that the wave returns into the medium from which it originated.",
              formula: "Law of Reflection: θᵢ = θᵣ (angle of incidence = angle of reflection)",
              explanation: "When light strikes a surface, it bounces back according to the law of reflection. The incident ray, reflected ray, and normal all lie in the same plane. For smooth surfaces (specular reflection), light reflects in a single direction. For rough surfaces (diffuse reflection), light scatters in multiple directions.",
              applications: [
                "Mirrors in telescopes and microscopes",
                "Periscopes in submarines",
                "Solar concentrators for energy",
                "Automotive mirrors and headlights",
                "Optical instruments and cameras"
              ],
              examples: [
                "Looking at yourself in a bathroom mirror",
                "Sunlight reflecting off a lake",
                "Laser beam bouncing off a mirror",
                "Light reflecting inside a kaleidoscope",
                "Reflection in curved mirrors (concave/convex)"
              ]
            }}
          />
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
        </div>
      </div>

      {incidentAngle === reflectedAngle && (
<<<<<<< HEAD
        <div className="mt-4 p-4 bg-green-500/20 border border-green-400 rounded-lg">
          <p className="text-green-200 font-semibold">
=======
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold flex items-center gap-2">
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
            🎉 Perfect! The incident and reflected rays follow the law of reflection!
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
