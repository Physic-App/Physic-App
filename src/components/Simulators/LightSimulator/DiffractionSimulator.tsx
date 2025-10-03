import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { FormulaPanel } from './ui/FormulaPanel';
import { MeasurementPanel } from './ui/MeasurementPanel';
import { InfoPanel } from './ui/InfoPanel';
import { validateWavelength, validateSlitWidth, validateSlitSpacing, getWavelengthColor, getWavelengthName } from '../../../utils/physicsConstants';

export const DiffractionSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wavelength, setWavelength] = useState(500); // nm
  const [slitWidth, setSlitWidth] = useState(0.1); // mm
  const [slitSpacing, setSlitSpacing] = useState(0.5); // mm
  const [numSlits, setNumSlits] = useState(2);
  const [screenDistance, setScreenDistance] = useState(100); // cm
  const [showIntensity, setShowIntensity] = useState(true);
  const [showCentralMax, setShowCentralMax] = useState(true);

  // Calculate diffraction pattern
  const calculateDiffraction = () => {
    try {
      const lambda = wavelength * 1e-9; // Convert to meters
      const a = slitWidth * 1e-3; // Convert to meters
      const d = slitSpacing * 1e-3; // Convert to meters
      const D = screenDistance * 1e-2; // Convert to meters

      // Single slit diffraction
      const singleSlitMinima = [];
      for (let n = 1; n <= 5; n++) {
        const angle = Math.asin((n * lambda) / a) * 180 / Math.PI;
        const position = D * Math.tan(angle * Math.PI / 180);
        singleSlitMinima.push({ n, angle, position });
      }

      // Double slit interference
      const doubleSlitMaxima = [];
      const doubleSlitMinima = [];
      
      if (numSlits >= 2) {
        // Maxima: d * sin(θ) = m * λ
        for (let m = 0; m <= 10; m++) {
          const angle = Math.asin((m * lambda) / d) * 180 / Math.PI;
          if (Math.abs(angle) < 90) {
            const position = D * Math.tan(angle * Math.PI / 180);
            doubleSlitMaxima.push({ m, angle, position });
          }
        }

        // Minima: d * sin(θ) = (m + 0.5) * λ
        for (let m = 0; m <= 10; m++) {
          const angle = Math.asin(((m + 0.5) * lambda) / d) * 180 / Math.PI;
          if (Math.abs(angle) < 90) {
            const position = D * Math.tan(angle * Math.PI / 180);
            doubleSlitMinima.push({ m, angle, position });
          }
        }
      }

      // Grating (multiple slits)
      const gratingMaxima = [];
      if (numSlits > 2) {
        for (let m = 0; m <= 5; m++) {
          const angle = Math.asin((m * lambda) / d) * 180 / Math.PI;
          if (Math.abs(angle) < 90) {
            const position = D * Math.tan(angle * Math.PI / 180);
            gratingMaxima.push({ m, angle, position });
          }
        }
      }

      return {
        singleSlitMinima,
        doubleSlitMaxima,
        doubleSlitMinima,
        gratingMaxima,
        centralAngle: 0,
        centralPosition: 0
      };
    } catch (error) {
      console.warn('Error calculating diffraction:', error);
      return {
        singleSlitMinima: [],
        doubleSlitMaxima: [],
        doubleSlitMinima: [],
        gratingMaxima: [],
        centralAngle: 0,
        centralPosition: 0
      };
    }
  };

  const diffractionData = calculateDiffraction();

  useEffect(() => {
    drawDiffraction();
  }, [wavelength, slitWidth, slitSpacing, numSlits, screenDistance, showIntensity, showCentralMax]);

  const drawDiffraction = () => {
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
    const screenWidth = canvas.width * 0.8;
    const screenHeight = canvas.height * 0.6;

    // Draw setup
    drawSetup(ctx, centerX, centerY, screenWidth, screenHeight);
    
    // Draw diffraction pattern
    drawDiffractionPattern(ctx, centerX, centerY, screenWidth, screenHeight);
    
    // Draw intensity profile
    if (showIntensity) {
      drawIntensityProfile(ctx, centerX, centerY, screenWidth, screenHeight);
    }
  };

  const drawSetup = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, screenWidth: number, screenHeight: number) => {
    // Draw slit(s)
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    
    const slitHeight = 40;
    const slitX = centerX - screenWidth / 2 + 50;
    
    if (numSlits === 1) {
      // Single slit
      ctx.beginPath();
      ctx.moveTo(slitX, centerY - slitHeight / 2);
      ctx.lineTo(slitX, centerY + slitHeight / 2);
      ctx.stroke();
    } else {
      // Multiple slits
      for (let i = 0; i < numSlits; i++) {
        const x = slitX + i * (slitSpacing * 20);
        ctx.beginPath();
        ctx.moveTo(x, centerY - slitHeight / 2);
        ctx.lineTo(x, centerY + slitHeight / 2);
        ctx.stroke();
      }
    }

    // Draw screen
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX + screenWidth / 2 - 50, centerY - screenHeight / 2);
    ctx.lineTo(centerX + screenWidth / 2 - 50, centerY + screenHeight / 2);
    ctx.stroke();

    // Draw rays
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < 3; i++) {
      const y = centerY - 20 + i * 20;
      ctx.beginPath();
      ctx.moveTo(slitX + 10, y);
      ctx.lineTo(centerX + screenWidth / 2 - 50, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  };

  const drawDiffractionPattern = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, screenWidth: number, screenHeight: number) => {
    const screenX = centerX + screenWidth / 2 - 50;
    const scale = screenHeight / 20; // Scale factor for positions

    // Central maximum
    if (showCentralMax) {
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(screenX - 2, centerY - 10, 4, 20);
      
      // Central maximum label
      ctx.fillStyle = '#EF4444';
      ctx.font = '12px sans-serif';
      ctx.fillText('Central Max', screenX + 10, centerY + 5);
    }

    // Single slit minima
    ctx.fillStyle = '#8B5CF6';
    ctx.font = '10px sans-serif';
    diffractionData.singleSlitMinima.forEach((minima, index) => {
      const y = centerY + minima.position * scale;
      if (Math.abs(y - centerY) < screenHeight / 2) {
        ctx.fillRect(screenX - 1, y - 5, 2, 10);
        if (index < 3) {
          ctx.fillText(`Min ${minima.n}`, screenX + 10, y + 3);
        }
      }
    });

    // Double slit maxima
    if (numSlits >= 2) {
      ctx.fillStyle = '#10B981';
      ctx.font = '10px sans-serif';
      diffractionData.doubleSlitMaxima.forEach((maxima, index) => {
        if (maxima.m === 0) return; // Skip central maximum
        const y = centerY + maxima.position * scale;
        if (Math.abs(y - centerY) < screenHeight / 2) {
          ctx.fillRect(screenX - 1.5, y - 7, 3, 14);
          if (index <= 2) {
            ctx.fillText(`Max ${maxima.m}`, screenX + 10, y + 3);
          }
        }
      });
    }

    // Grating maxima
    if (numSlits > 2) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = '10px sans-serif';
      diffractionData.gratingMaxima.forEach((maxima, index) => {
        if (maxima.m === 0) return; // Skip central maximum
        const y = centerY + maxima.position * scale;
        if (Math.abs(y - centerY) < screenHeight / 2) {
          ctx.fillRect(screenX - 2, y - 8, 4, 16);
          if (index <= 2) {
            ctx.fillText(`Order ${maxima.m}`, screenX + 10, y + 3);
          }
        }
      });
    }
  };

  const drawIntensityProfile = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, screenWidth: number, screenHeight: number) => {
    const profileWidth = 200;
    const profileHeight = 100;
    const profileX = centerX - profileWidth / 2;
    const profileY = centerY + screenHeight / 2 + 50;

    // Draw intensity curve
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const lambda = wavelength * 1e-9;
    const a = slitWidth * 1e-3;
    const d = slitSpacing * 1e-3;
    const D = screenDistance * 1e-2;
    
    for (let x = 0; x < profileWidth; x++) {
      const position = (x - profileWidth / 2) * 0.01; // Scale
      const angle = Math.atan(position / D);
      const beta = (Math.PI * a * Math.sin(angle)) / lambda;
      
      // Single slit intensity
      let intensity = Math.pow(Math.sin(beta) / beta, 2);
      if (isNaN(intensity)) intensity = 1;
      
      // Multiple slit modulation
      if (numSlits > 1) {
        const gamma = (Math.PI * d * Math.sin(angle)) / lambda;
        const interference = Math.pow(Math.sin(numSlits * gamma) / Math.sin(gamma), 2);
        if (!isNaN(interference)) {
          intensity *= interference;
        }
      }
      
      const y = profileY + profileHeight - intensity * profileHeight * 0.8;
      
      if (x === 0) {
        ctx.moveTo(profileX + x, y);
      } else {
        ctx.lineTo(profileX + x, y);
      }
    }
    
    ctx.stroke();

    // Draw profile border
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.strokeRect(profileX, profileY, profileWidth, profileHeight);

    // Label
    ctx.fillStyle = '#64748B';
    ctx.font = '12px sans-serif';
    ctx.fillText('Intensity Profile', profileX, profileY - 10);
  };

  const getWavelengthColor = (wavelength: number) => {
    if (wavelength < 450) return '#7C3AED'; // Violet
    if (wavelength < 490) return '#4F46E5'; // Blue
    if (wavelength < 560) return '#10B981'; // Green
    if (wavelength < 590) return '#EAB308'; // Yellow
    if (wavelength < 635) return '#EA580C'; // Orange
    return '#DC2626'; // Red
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-blue-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Diffraction & Interference</h2>
      
      <div className="mb-6 p-4 bg-purple-100 border border-purple-300 rounded-lg">
        <p className="text-purple-800 text-sm">
          <strong>Diffraction:</strong> The bending of light around obstacles and through apertures. 
          <strong>Interference:</strong> The superposition of waves creating constructive and destructive patterns. 
          Single slit: I = I₀(sin β/β)², where β = πa sin θ/λ. Multiple slits create interference patterns with sharper maxima.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-gray-100 rounded-lg p-4 border-2 border-gray-300 shadow-lg">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-white rounded-lg border-2 border-blue-400"
            style={{ minHeight: '500px' }}
          />
        </div>

        <div className="bg-gray-100 rounded-lg p-6 space-y-6 border-2 border-gray-300 shadow-lg">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Wavelength: {wavelength} nm
              <span 
                className="inline-block w-4 h-4 ml-2 rounded-full"
                style={{ backgroundColor: getWavelengthColor(wavelength) }}
              />
            </label>
            <Slider
              min={400}
              max={700}
              value={wavelength}
              onChange={setWavelength}
              unit="nm"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Slit Width: {slitWidth} mm
            </label>
            <Slider
              min={0.05}
              max={0.5}
              step={0.01}
              value={slitWidth}
              onChange={setSlitWidth}
              unit="mm"
              precision={2}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Slit Spacing: {slitSpacing} mm
            </label>
            <Slider
              min={0.2}
              max={2.0}
              step={0.1}
              value={slitSpacing}
              onChange={setSlitSpacing}
              unit="mm"
              precision={1}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Number of Slits: {numSlits}
            </label>
            <Slider
              min={1}
              max={10}
              value={numSlits}
              onChange={setNumSlits}
              unit=""
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Screen Distance: {screenDistance} cm
            </label>
            <Slider
              min={50}
              max={200}
              value={screenDistance}
              onChange={setScreenDistance}
              unit="cm"
              precision={0}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Display Options</label>
            <div className="space-y-2">
              <Toggle
                checked={showIntensity}
                onChange={setShowIntensity}
                label="Intensity Profile"
              />
              <Toggle
                checked={showCentralMax}
                onChange={setShowCentralMax}
                label="Central Maximum"
              />
            </div>
          </div>

          <MeasurementPanel
            title="Key Measurements"
            measurements={[
              { label: 'Angular Width (1st Min)', value: ((wavelength * 1e-9) / (slitWidth * 1e-3) * 180 / Math.PI).toFixed(2), unit: '°' },
              { label: 'Fringe Spacing', value: ((wavelength * 1e-9 * screenDistance * 1e-2) / (slitSpacing * 1e-3) * 1000).toFixed(2), unit: 'mm' },
              { label: 'Resolving Power', value: (numSlits * (wavelength * 1e-9) / (slitSpacing * 1e-3)).toFixed(0) },
            ]}
          />

          <FormulaPanel
            title="Diffraction Formulas"
            formulas={[
              `Single Slit: θ = λ/a`,
              `Double Slit: θ = λ/d`,
              `Grating: θ = mλ/d`,
              `Angular Width: ${((wavelength * 1e-9) / (slitWidth * 1e-3) * 180 / Math.PI).toFixed(2)}°`,
            ]}
          />

          <InfoPanel
            title="Diffraction & Interference"
            content={{
              definition: "Diffraction is the bending of light around obstacles or through apertures, while interference is the superposition of waves creating constructive and destructive patterns.",
              formula: "Single Slit: θ = λ/a, Double Slit: θ = λ/d, Grating: θ = mλ/d",
              explanation: "When light passes through narrow slits, it spreads out and interferes with itself. Single slits create broad diffraction patterns, double slits create interference fringes, and multiple slits (gratings) create sharp, bright maxima. The pattern depends on wavelength, slit width, and spacing.",
              applications: [
                "Spectroscopy for chemical analysis",
                "CD and DVD data storage",
                "Holography and 3D imaging",
                "X-ray crystallography",
                "Laser beam shaping and optics"
              ],
              examples: [
                "Rainbow colors in soap bubbles",
                "Light spreading through window blinds",
                "Laser pointer beam spreading",
                "Color patterns in peacock feathers",
                "Diffraction gratings in spectrometers"
              ]
            }}
          />
        </div>
      </div>

      {numSlits > 2 && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold flex items-center gap-2">
            🔬 Excellent! You're observing a diffraction grating with {numSlits} slits - notice the sharper, brighter maxima!
          </p>
        </div>
      )}
    </div>
  );
};
