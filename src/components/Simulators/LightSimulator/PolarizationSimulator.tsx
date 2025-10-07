import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';
import { MeasurementPanel } from './ui/MeasurementPanel';
import { InfoPanel } from './ui/InfoPanel';
import { calculateMalusLaw, validateAngle } from '../../../utils/physicsConstants';

export const PolarizationSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [polarizerAngle, setPolarizerAngle] = useState(0); // degrees
  const [analyzerAngle, setAnalyzerAngle] = useState(90); // degrees
  const [incidentIntensity, setIncidentIntensity] = useState(100); // percentage
  const [polarizationType, setPolarizationType] = useState<'linear' | 'circular' | 'elliptical'>('linear');
  const [showVector, setShowVector] = useState(true);
  const [showIntensity, setShowIntensity] = useState(true);

  // Calculate transmitted intensity using enhanced Malus's law
  const calculateTransmittedIntensity = () => {
    try {
      // Validate angles
      const polarizerError = validateAngle(polarizerAngle, 'polarizer angle');
      const analyzerError = validateAngle(analyzerAngle, 'analyzer angle');
      
      if (polarizerError || analyzerError) {
        return {
          transmittedIntensity: 0,
          angleDifference: 0,
          extinctionRatio: 0,
          error: polarizerError || analyzerError || 'Unknown error'
        };
      }
      
      const angleDiff = Math.abs(analyzerAngle - polarizerAngle);
      
      // Use physics constants calculation
      const transmittedIntensity = calculateMalusLaw(incidentIntensity, angleDiff);
      
      return {
        transmittedIntensity: Math.max(0, transmittedIntensity),
        angleDifference: angleDiff,
        extinctionRatio: transmittedIntensity > 0 ? incidentIntensity / transmittedIntensity : Infinity,
        error: null
      };
    } catch (error) {
      console.warn('Error calculating transmitted intensity:', error);
      return {
        transmittedIntensity: 0,
        angleDifference: 0,
        extinctionRatio: 0,
        error: 'Calculation error'
      };
    }
  };

  const intensityData = calculateTransmittedIntensity();

  useEffect(() => {
    drawPolarization();
  }, [polarizerAngle, analyzerAngle, incidentIntensity, polarizationType, showVector, showIntensity]);

  const drawPolarization = () => {
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
    const waveLength = 100;

    // Draw setup
    drawSetup(ctx, centerX, centerY);
    
    // Draw polarization vectors
    if (showVector) {
      drawPolarizationVectors(ctx, centerX, centerY, waveLength);
    }
    
    // Draw intensity visualization
    if (showIntensity) {
      drawIntensityVisualization(ctx, centerX, centerY, waveLength);
    }
  };

  const drawSetup = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    // Draw polarizer
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 150, centerY - 30);
    ctx.lineTo(centerX - 150, centerY + 30);
    ctx.stroke();
    
    // Polarizer label
    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Polarizer', centerX - 180, centerY + 50);

    // Draw analyzer
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX + 150, centerY - 30);
    ctx.lineTo(centerX + 150, centerY + 30);
    ctx.stroke();
    
    // Analyzer label
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Analyzer', centerX + 160, centerY + 50);

    // Draw light source
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(centerX - 200, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Light source label
    ctx.fillStyle = '#F59E0B';
    ctx.font = '12px sans-serif';
    ctx.fillText('Light Source', centerX - 230, centerY + 20);

    // Draw detector
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(centerX + 200, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Detector label
    ctx.fillStyle = '#EF4444';
    ctx.font = '12px sans-serif';
    ctx.fillText('Detector', centerX + 210, centerY + 20);
  };

  const drawPolarizationVectors = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, waveLength: number) => {
    const vectorLength = 60;
    
    // Incident light (unpolarized)
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = centerX - 180 + Math.cos(angle) * vectorLength * 0.3;
      const y = centerY + Math.sin(angle) * vectorLength * 0.3;
      ctx.beginPath();
      ctx.moveTo(centerX - 180, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // After polarizer (linearly polarized)
    const polX = centerX - 150 + Math.cos(polarizerAngle * Math.PI / 180) * vectorLength;
    const polY = centerY + Math.sin(polarizerAngle * Math.PI / 180) * vectorLength;
    
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX - 150, centerY);
    ctx.lineTo(polX, polY);
    ctx.stroke();
    
    // Add arrow
    drawArrow(ctx, centerX - 150, centerY, polX, polY, '#4F46E5');

    // After analyzer
    const analyzerComponent = Math.cos((analyzerAngle - polarizerAngle) * Math.PI / 180);
    const anaX = centerX + 150 + Math.cos(analyzerAngle * Math.PI / 180) * vectorLength * Math.abs(analyzerComponent);
    const anaY = centerY + Math.sin(analyzerAngle * Math.PI / 180) * vectorLength * Math.abs(analyzerComponent);
    
    if (Math.abs(analyzerComponent) > 0.01) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      ctx.globalAlpha = Math.abs(analyzerComponent);
      ctx.beginPath();
      ctx.moveTo(centerX + 150, centerY);
      ctx.lineTo(anaX, anaY);
      ctx.stroke();
      
      // Add arrow
      drawArrow(ctx, centerX + 150, centerY, anaX, anaY, '#10B981');
      ctx.globalAlpha = 1;
    }
  };

  const drawIntensityVisualization = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, waveLength: number) => {
    const barWidth = 40;
    const maxHeight = 80;
    
    // Incident intensity bar
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(centerX - 200, centerY + 60, barWidth, -maxHeight);
    
    // Transmitted intensity bar
    const transmittedHeight = (intensityData.transmittedIntensity / 100) * maxHeight;
    ctx.fillStyle = '#10B981';
    ctx.fillRect(centerX + 160, centerY + 60, barWidth, -transmittedHeight);
    
    // Intensity labels
    ctx.fillStyle = '#F59E0B';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${incidentIntensity}%`, centerX - 210, centerY + 90);
    
    ctx.fillStyle = '#10B981';
    ctx.fillText(`${intensityData.transmittedIntensity.toFixed(1)}%`, centerX + 150, centerY + 90);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 12;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(toX - arrowLength * Math.cos(angle - Math.PI/6), toY - arrowLength * Math.sin(angle - Math.PI/6));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - arrowLength * Math.cos(angle + Math.PI/6), toY - arrowLength * Math.sin(angle + Math.PI/6));
    ctx.stroke();
  };

  const getPolarizationDescription = () => {
    const angleDiff = Math.abs(analyzerAngle - polarizerAngle);
    if (angleDiff < 5) return "Nearly parallel - maximum transmission";
    if (angleDiff > 85 && angleDiff < 95) return "Nearly perpendicular - minimum transmission";
    if (angleDiff === 90) return "Perpendicular - complete extinction";
    return "Partial transmission";
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-blue-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Polarization of Light</h2>
      
      <div className="mb-6 p-4 bg-indigo-100 border border-indigo-300 rounded-lg">
        <p className="text-indigo-800 text-sm">
          <strong>Polarization:</strong> The orientation of light's electric field vector. 
          <strong>Malus's Law:</strong> I = I₀ cos²(θ), where θ is the angle between polarizer and analyzer transmission axes. 
          When polarizers are crossed (90°), light is completely blocked. Used in sunglasses, LCD displays, and optical instruments.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-gray-100 rounded-lg p-4 border-2 border-gray-300 shadow-lg">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-white rounded-lg border-2 border-blue-400"
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="bg-gray-100 rounded-lg p-6 space-y-6 border-2 border-gray-300 shadow-lg">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Polarizer Angle: {polarizerAngle}°
            </label>
            <Slider
              min={0}
              max={180}
              value={polarizerAngle}
              onChange={setPolarizerAngle}
              unit="°"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Analyzer Angle: {analyzerAngle}°
            </label>
            <Slider
              min={0}
              max={180}
              value={analyzerAngle}
              onChange={setAnalyzerAngle}
              unit="°"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Incident Intensity: {incidentIntensity}%
            </label>
            <Slider
              min={0}
              max={100}
              value={incidentIntensity}
              onChange={setIncidentIntensity}
              unit="%"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Display Options</label>
            <div className="space-y-2">
              <Toggle
                checked={showVector}
                onChange={setShowVector}
                label="Show Vectors"
              />
              <Toggle
                checked={showIntensity}
                onChange={setShowIntensity}
                label="Show Intensity Bars"
              />
            </div>
          </div>

          <MeasurementPanel
            title="Intensity Analysis"
            measurements={[
              { label: 'Transmitted Intensity', value: intensityData.transmittedIntensity.toFixed(1), unit: '%' },
              { label: 'Angle Difference', value: intensityData.angleDifference.toFixed(1), unit: '°' },
              { label: 'Extinction Ratio', value: intensityData.extinctionRatio === Infinity ? '∞' : intensityData.extinctionRatio.toFixed(1) },
              { label: 'Status', value: getPolarizationDescription() },
            ]}
          />

          <FormulaPanel
            title="Malus's Law"
            formulas={[
              `I = I₀ cos²(θ)`,
              `I₀ = ${incidentIntensity}%`,
              `θ = ${intensityData.angleDifference.toFixed(1)}°`,
              `I = ${intensityData.transmittedIntensity.toFixed(1)}%`,
              `cos²(${intensityData.angleDifference.toFixed(1)}°) = ${Math.pow(Math.cos(intensityData.angleDifference * Math.PI / 180), 2).toFixed(3)}`
            ]}
          />

          <InfoPanel
            title="Polarization of Light"
            content={{
              definition: "Polarization is the orientation of light's electric field vector. Natural light is unpolarized (random orientations), while polarized light has electric fields oscillating in a specific direction.",
              formula: "Malus's Law: I = I₀ cos²(θ), where θ is the angle between polarizer axes",
              explanation: "Polarizers filter light by only allowing waves oscillating in a specific direction to pass through. When two polarizers are crossed at 90°, light is completely blocked. The intensity of transmitted light depends on the angle between polarizer and analyzer according to Malus's law.",
              applications: [
                "Polarized sunglasses to reduce glare",
                "LCD displays and screens",
                "3D movie technology",
                "Optical microscopy and imaging",
                "Photography filters and effects"
              ],
              examples: [
                "Polarized sunglasses blocking reflected light",
                "LCD screen showing different colors",
                "3D glasses for movies",
                "Light reflected off water surfaces",
                "Polarized filters in cameras"
              ]
            }}
          />
        </div>
      </div>

      {intensityData.angleDifference === 90 && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded-lg">
          <p className="text-red-800 font-semibold flex items-center gap-2">
            🚫 Perfect! The polarizers are crossed - light is completely blocked (extinction)!
          </p>
        </div>
      )}

      {intensityData.angleDifference === 0 && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold flex items-center gap-2">
            ✅ Excellent! The polarizers are aligned - maximum light transmission!
          </p>
        </div>
      )}
    </div>
  );
};
