import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';
import { calculatePrismDeviation, validatePrismAngle, validateAngle } from '../../../utils/physicsConstants';

export const PrismSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [prismAngle, setPrismAngle] = useState(60);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [showDispersion, setShowDispersion] = useState(false);
  const [showSpectrum, setShowSpectrum] = useState(true);
  const [showDeviation, setShowDeviation] = useState(true);
  const [spectrumType, setSpectrumType] = useState<'continuous' | 'discrete' | 'absorption'>('continuous');
  const [temperature, setTemperature] = useState(20); // Celsius

  // Calculate deviation with enhanced physics validation
  const calculateDeviation = () => {
    try {
      // Use enhanced physics validation from constants
      return calculatePrismDeviation(refractiveIndex, prismAngle, incidentAngle);
    } catch (error) {
      console.warn('Error in deviation calculation:', error);
      return {
        r1: 0,
        r2: 0,
        i2: 0,
        deviation: 0,
        error: 'Calculation error'
      };
    }
  };

  const deviationResult = calculateDeviation();
  const { deviation, error } = deviationResult;

  useEffect(() => {
    drawPrism();
  }, [incidentAngle, prismAngle, refractiveIndex, showDispersion, showSpectrum, showDeviation, spectrumType, temperature]);

  const drawPrism = () => {
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

    // Draw prism
    drawPrismShape(ctx, centerX, centerY, prismAngle);
    
    if (showDispersion) {
      drawAdvancedDispersion(ctx, centerX, centerY);
    } else {
      drawSingleRay(ctx, centerX, centerY);
    }

    // Draw spectrum analysis
    if (showSpectrum) {
      drawSpectrumAnalysis(ctx, centerX, centerY);
    }
  };

  const drawPrismShape = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    const size = 80;
    const A = angle * Math.PI / 180;
    
    ctx.fillStyle = 'rgba(147, 197, 253, 0.3)';
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(x - size, y + size/2);
    ctx.lineTo(x + size, y + size/2);
    ctx.lineTo(x, y - size * Math.tan(A/2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Prism angle label
    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`A = ${angle}°`, x - 15, y - size * Math.tan(A/2) - 10);
  };

  const drawSingleRay = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 80; // Define size locally
    // Incident ray
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const incidentLength = 100;
    const startX = x - size - incidentLength * Math.cos(incidentAngle * Math.PI / 180);
    const startY = y + size/2 - incidentLength * Math.sin(incidentAngle * Math.PI / 180);
    
    ctx.moveTo(startX, startY);
    ctx.lineTo(x - size, y + size/2);
    ctx.stroke();
    
    // Emergent ray
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    const emergentLength = 100;
    const endX = x + size + emergentLength * Math.cos((incidentAngle + deviation) * Math.PI / 180);
    const endY = y + size/2 + emergentLength * Math.sin((incidentAngle + deviation) * Math.PI / 180);
    
    ctx.moveTo(x + size, y + size/2);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Deviation angle
    drawDeviationAngle(ctx, x + size, y + size/2, deviation);
  };

  const drawDispersion = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 80; // Define size locally
    const colors = [
      { color: '#DC2626', n: 1.52, name: 'Red' },
      { color: '#EA580C', n: 1.51, name: 'Orange' },
      { color: '#EAB308', n: 1.50, name: 'Yellow' },
      { color: '#16A34A', n: 1.49, name: 'Green' },
      { color: '#2563EB', n: 1.48, name: 'Blue' },
      { color: '#4F46E5', n: 1.47, name: 'Indigo' },
      { color: '#7C3AED', n: 1.46, name: 'Violet' }
    ];

    colors.forEach((colorInfo, index) => {
      const deviation = calculateDeviationForN(colorInfo.n);
      
      ctx.strokeStyle = colorInfo.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const emergentLength = 120;
      const endX = x + size + emergentLength * Math.cos((incidentAngle + deviation) * Math.PI / 180);
      const endY = y + size/2 + emergentLength * Math.sin((incidentAngle + deviation) * Math.PI / 180);
      
      ctx.moveTo(x + size, y + size/2);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
    
    // White light label
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('White Light', x - size - 100, y + size/2 - 20);
    ctx.fillText('Spectrum', x + size + 50, y + size/2 + 50);
  };

  const drawAdvancedDispersion = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 80;
    
    // Enhanced color data with more wavelengths
    const colors = [
      { color: '#8B00FF', n: 1.532, name: 'Violet', wavelength: 400 },
      { color: '#4B0082', n: 1.530, name: 'Indigo', wavelength: 450 },
      { color: '#0000FF', n: 1.528, name: 'Blue', wavelength: 500 },
      { color: '#00FFFF', n: 1.526, name: 'Cyan', wavelength: 520 },
      { color: '#00FF00', n: 1.524, name: 'Green', wavelength: 550 },
      { color: '#FFFF00', n: 1.522, name: 'Yellow', wavelength: 580 },
      { color: '#FF8C00', n: 1.520, name: 'Orange', wavelength: 620 },
      { color: '#FF0000', n: 1.518, name: 'Red', wavelength: 700 }
    ];

    colors.forEach((colorInfo, index) => {
      const deviation = calculateDeviationForN(colorInfo.n);
      
      ctx.strokeStyle = colorInfo.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const emergentLength = 120;
      const endX = x + size + emergentLength * Math.cos((incidentAngle + deviation) * Math.PI / 180);
      const endY = y + size/2 + emergentLength * Math.sin((incidentAngle + deviation) * Math.PI / 180);
      
      ctx.moveTo(x + size, y + size/2);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Add wavelength labels for discrete spectrum
      if (spectrumType === 'discrete') {
        ctx.fillStyle = colorInfo.color;
        ctx.font = '10px sans-serif';
        ctx.fillText(`${colorInfo.wavelength}nm`, endX + 5, endY);
      }
    });

    // Draw spectrum type indicators
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('White Light', x - size - 100, y + size/2 - 20);
    
    if (spectrumType === 'continuous') {
      ctx.fillText('Continuous Spectrum', x + size + 50, y + size/2 + 50);
    } else if (spectrumType === 'discrete') {
      ctx.fillText('Line Spectrum', x + size + 50, y + size/2 + 50);
    } else {
      ctx.fillText('Absorption Spectrum', x + size + 50, y + size/2 + 50);
    }
  };

  const drawSpectrumAnalysis = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 80; // Define size locally
    const spectrumWidth = 200;
    const spectrumHeight = 40;
    const spectrumX = x + size + 50;
    const spectrumY = y + size/2 + 80;

    // Draw spectrum background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(spectrumX, spectrumY, spectrumWidth, spectrumHeight);

    // Draw spectrum bars
    const colors = [
      { color: '#8B00FF', wavelength: 400 },
      { color: '#4B0082', wavelength: 450 },
      { color: '#0000FF', wavelength: 500 },
      { color: '#00FFFF', wavelength: 520 },
      { color: '#00FF00', wavelength: 550 },
      { color: '#FFFF00', wavelength: 580 },
      { color: '#FF8C00', wavelength: 620 },
      { color: '#FF0000', wavelength: 700 }
    ];

    const barWidth = spectrumWidth / colors.length;
    
    colors.forEach((colorInfo, index) => {
      let intensity = 1;
      
      // Modify intensity based on spectrum type and temperature
      if (spectrumType === 'discrete') {
        intensity = index % 2 === 0 ? 1 : 0.3; // Alternating intensity
      } else if (spectrumType === 'absorption') {
        intensity = 0.2 + 0.8 * Math.sin((index / colors.length) * Math.PI);
      } else {
        intensity = 0.7 + 0.3 * Math.sin((index / colors.length) * Math.PI * 2);
      }

      // Temperature effect
      const tempFactor = 1 - Math.abs(temperature - 20) / 100;
      intensity *= Math.max(0.3, tempFactor);

      ctx.fillStyle = colorInfo.color;
      ctx.globalAlpha = intensity;
      ctx.fillRect(spectrumX + index * barWidth, spectrumY, barWidth, spectrumHeight);
    });

    ctx.globalAlpha = 1;

    // Draw spectrum labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText('Spectrum Analysis', spectrumX, spectrumY - 10);
    
    // Draw intensity scale
    ctx.fillStyle = '#64748B';
    ctx.font = '10px sans-serif';
    for (let i = 0; i <= 5; i++) {
      const scaleY = spectrumY + spectrumHeight + 15;
      const scaleX = spectrumX + (i * spectrumWidth) / 5;
      ctx.fillText(`${i * 20}%`, scaleX, scaleY);
    }
  };

  const calculateDeviationForN = (n: number) => {
    const A = prismAngle * Math.PI / 180;
    const i1 = incidentAngle * Math.PI / 180;
    
    try {
      // Validate input parameters
      if (n <= 0 || A <= 0 || i1 < 0 || i1 >= Math.PI/2) {
        return 0;
      }
      
      const sinR1 = Math.sin(i1) / n;
      if (Math.abs(sinR1) > 1) {
        return 0; // Total internal reflection
      }
      
      const r1 = Math.asin(sinR1);
      const r2 = A - r1;
      
      if (r2 <= 0 || r2 >= A) {
        return 0; // Invalid internal angle
      }
      
      const sinI2 = n * Math.sin(r2);
      if (Math.abs(sinI2) > 1) {
        return 0; // Total internal reflection at exit
      }
      
      const i2 = Math.asin(sinI2);
      return (i1 + i2 - A) * 180 / Math.PI;
    } catch (error) {
      console.warn('Error calculating deviation:', error);
      return 0;
    }
  };

  const drawDeviationAngle = (ctx: CanvasRenderingContext2D, x: number, y: number, deviation: number) => {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    const radius = 60;
    ctx.arc(x, y, radius, 0, deviation * Math.PI / 180);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#F59E0B';
    ctx.font = '14px sans-serif';
    ctx.fillText(`δ = ${deviation.toFixed(1)}°`, x + 40, y - 40);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 12;
    
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Prism Simulation</h2>
      
      <div className="mb-6 p-4 bg-indigo-100 border border-indigo-300 rounded-lg">
        <p className="text-indigo-800 text-sm">
          <strong>Prism:</strong> A transparent triangular optical element that deviates and disperses light. 
          Deviation (δ = i + e - A) depends on incident angle, prism angle, and refractive index. White light splits into spectrum due to dispersion.
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
              max={80}
              value={incidentAngle}
              onChange={setIncidentAngle}
              unit="°"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Prism Angle: {prismAngle}°
            </label>
            <Slider
              min={30}
              max={90}
              value={prismAngle}
              onChange={setPrismAngle}
              unit="°"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Refractive Index: {refractiveIndex}
            </label>
            <Slider
              min={1.3}
              max={2.0}
              step={0.05}
              value={refractiveIndex}
              onChange={setRefractiveIndex}
              unit=""
              precision={2}
            />
          </div>

          <Toggle
            checked={showDispersion}
            onChange={setShowDispersion}
            label={showDispersion ? 'Showing Dispersion' : 'Single Ray'}
          />

          {showDispersion && (
            <>
              <div>
                <label className="block text-gray-800 font-semibold mb-2">Spectrum Type</label>
                <select
                  value={spectrumType}
                  onChange={(e) => setSpectrumType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
                >
                  <option value="continuous">Continuous Spectrum</option>
                  <option value="discrete">Line Spectrum</option>
                  <option value="absorption">Absorption Spectrum</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Temperature: {temperature}°C
                </label>
                <Slider
                  min={0}
                  max={100}
                  value={temperature}
                  onChange={setTemperature}
                  unit="°C"
                  precision={0}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Display Options</label>
            <div className="space-y-2">
              <Toggle
                checked={showSpectrum}
                onChange={setShowSpectrum}
                label="Show Spectrum Analysis"
              />
              <Toggle
                checked={showDeviation}
                onChange={setShowDeviation}
                label="Show Deviation Angle"
              />
            </div>
          </div>

          <FormulaPanel
            title="Prism Deviation"
            formulas={[
              `δ = i + e - A`,
              `Prism Angle: ${prismAngle}°`,
              `Deviation: ${deviation.toFixed(1)}°`,
              `Refractive Index: ${refractiveIndex}`,
              error ? `⚠️ ${error}` : ''
            ].filter(Boolean)}
          />
        </div>
      </div>

      {showDispersion && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold flex items-center gap-2">
            🌈 Beautiful! You're seeing how white light separates into its rainbow colors!
          </p>
        </div>
      )}
    </div>
  );
};