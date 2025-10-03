import React, { useState, useEffect, useCallback } from 'react';
import { Component, Connection, CircuitData } from './types/circuit';
import { Gauge, Activity, Zap, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface MeasurementInstrumentsProps {
  components: Component[];
  connections: Connection[];
  circuitData: CircuitData;
  isSimulating: boolean;
  themeMode: 'light' | 'dark';
}

interface InstrumentReading {
  value: number;
  unit: string;
  timestamp: number;
  isValid: boolean;
  error?: string;
}

interface OscilloscopeData {
  time: number[];
  voltage: number[];
  current: number[];
  frequency: number;
  amplitude: number;
  phase: number;
}

export const MeasurementInstruments: React.FC<MeasurementInstrumentsProps> = ({
  components,
  connections,
  circuitData,
  isSimulating,
  themeMode
}) => {
  const [ammeterReadings, setAmmeterReadings] = useState<Map<string, InstrumentReading>>(new Map());
  const [voltmeterReadings, setVoltmeterReadings] = useState<Map<string, InstrumentReading>>(new Map());
  const [oscilloscopeData, setOscilloscopeData] = useState<OscilloscopeData | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

  // Update instrument readings
  useEffect(() => {
    if (isSimulating) {
      updateInstrumentReadings();
    }
  }, [isSimulating, circuitData, components]);

  const updateInstrumentReadings = useCallback(() => {
    const newAmmeterReadings = new Map<string, InstrumentReading>();
    const newVoltmeterReadings = new Map<string, InstrumentReading>();

    components.forEach(component => {
      if (component.type === 'ammeter') {
        const current = component.properties.current || 0;
        const reading: InstrumentReading = {
          value: Math.abs(current),
          unit: 'A',
          timestamp: Date.now(),
          isValid: true
        };
        newAmmeterReadings.set(component.id, reading);
      } else if (component.type === 'voltmeter') {
        const voltage = component.properties.voltage || 0;
        const reading: InstrumentReading = {
          value: Math.abs(voltage),
          unit: 'V',
          timestamp: Date.now(),
          isValid: true
        };
        newVoltmeterReadings.set(component.id, reading);
      }
    });

    setAmmeterReadings(newAmmeterReadings);
    setVoltmeterReadings(newVoltmeterReadings);
  }, [components]);

  // Generate oscilloscope data
  const generateOscilloscopeData = useCallback((): OscilloscopeData => {
    const timePoints = 100;
    const time = Array.from({ length: timePoints }, (_, i) => i * 0.01);
    const frequency = 50; // 50 Hz
    const amplitude = circuitData.totalVoltage || 12;
    const phase = 0;

    const voltage = time.map(t => amplitude * Math.sin(2 * Math.PI * frequency * t + phase));
    const current = time.map(t => (circuitData.totalCurrent || 0.5) * Math.sin(2 * Math.PI * frequency * t + phase));

    return {
      time,
      voltage,
      current,
      frequency,
      amplitude,
      phase
    };
  }, [circuitData]);

  // Update oscilloscope data
  useEffect(() => {
    if (isSimulating) {
      const data = generateOscilloscopeData();
      setOscilloscopeData(data);
    }
  }, [isSimulating, generateOscilloscopeData]);

  const renderAmmeter = (component: Component) => {
    const reading = ammeterReadings.get(component.id);
    const current = reading?.value || 0;
    const isValid = reading?.isValid !== false;

    return (
      <div
        key={component.id}
        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
          isValid
            ? themeMode === 'dark'
              ? 'bg-green-900/20 border-green-700 text-green-300'
              : 'bg-green-50 border-green-200 text-green-800'
            : themeMode === 'dark'
              ? 'bg-red-900/20 border-red-700 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Ammeter {component.id}</h3>
            <div className="text-2xl font-bold">
              {isValid ? current.toFixed(3) : '---'} A
            </div>
            {!isValid && (
              <div className="text-sm opacity-75">
                {reading?.error || 'No reading available'}
              </div>
            )}
          </div>
        </div>
        
        {/* Analog gauge representation */}
        <div className="mt-3">
          <div className="relative w-20 h-20 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Gauge background */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={themeMode === 'dark' ? '#374151' : '#d1d5db'}
                strokeWidth="8"
              />
              
              {/* Gauge arc */}
              <path
                d="M 50 10 A 40 40 0 1 1 50 90"
                fill="none"
                stroke={isValid ? '#10b981' : '#ef4444'}
                strokeWidth="6"
                strokeLinecap="round"
              />
              
              {/* Needle */}
              <line
                x1="50"
                y1="50"
                x2={50 + 35 * Math.cos((current / 5) * Math.PI - Math.PI / 2)}
                y2={50 + 35 * Math.sin((current / 5) * Math.PI - Math.PI / 2)}
                stroke={isValid ? '#10b981' : '#ef4444'}
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Center dot */}
              <circle cx="50" cy="50" r="3" fill={isValid ? '#10b981' : '#ef4444'} />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderVoltmeter = (component: Component) => {
    const reading = voltmeterReadings.get(component.id);
    const voltage = reading?.value || 0;
    const isValid = reading?.isValid !== false;

    return (
      <div
        key={component.id}
        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
          isValid
            ? themeMode === 'dark'
              ? 'bg-blue-900/20 border-blue-700 text-blue-300'
              : 'bg-blue-50 border-blue-200 text-blue-800'
            : themeMode === 'dark'
              ? 'bg-red-900/20 border-red-700 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Voltmeter {component.id}</h3>
            <div className="text-2xl font-bold">
              {isValid ? voltage.toFixed(2) : '---'} V
            </div>
            {!isValid && (
              <div className="text-sm opacity-75">
                {reading?.error || 'No reading available'}
              </div>
            )}
          </div>
        </div>
        
        {/* Digital display representation */}
        <div className="mt-3">
          <div className={`p-3 rounded border-2 ${
            themeMode === 'dark'
              ? 'bg-black border-gray-600 text-green-400'
              : 'bg-black border-gray-300 text-green-500'
          }`}>
            <div className="font-mono text-lg text-center">
              {isValid ? voltage.toFixed(2) : '---.--'} V
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOscilloscope = () => {
    if (!oscilloscopeData) return null;

    return (
      <div className={`p-4 rounded-lg border-2 ${
        themeMode === 'dark'
          ? 'bg-purple-900/20 border-purple-700 text-purple-300'
          : 'bg-purple-50 border-purple-200 text-purple-800'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Oscilloscope</h3>
            <div className="text-sm opacity-75">
              Frequency: {oscilloscopeData.frequency} Hz | 
              Amplitude: {oscilloscopeData.amplitude.toFixed(2)} V
            </div>
          </div>
        </div>
        
        {/* Oscilloscope display */}
        <div className={`p-4 rounded border-2 ${
          themeMode === 'dark'
            ? 'bg-black border-gray-600'
            : 'bg-black border-gray-300'
        }`}>
          <svg viewBox="0 0 400 200" className="w-full h-48">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke={themeMode === 'dark' ? '#374151' : '#6b7280'}
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="400" height="200" fill="url(#grid)" />
            
            {/* Voltage waveform */}
            <polyline
              points={oscilloscopeData.time.map((t, i) => 
                `${t * 400},${100 - (oscilloscopeData.voltage[i] / oscilloscopeData.amplitude) * 80}`
              ).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            />
            
            {/* Current waveform */}
            <polyline
              points={oscilloscopeData.time.map((t, i) => 
                `${t * 400},${100 - (oscilloscopeData.current[i] / (circuitData.totalCurrent || 1)) * 40}`
              ).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            
            {/* Center line */}
            <line x1="0" y1="100" x2="400" y2="100" stroke="#6b7280" strokeWidth="1" />
          </svg>
        </div>
        
        {/* Controls */}
        <div className="mt-4 flex items-center space-x-4">
          <button
            className={`px-3 py-1 rounded text-sm ${
              themeMode === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Time/Div: 1ms
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${
              themeMode === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Volts/Div: 1V
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${
              themeMode === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Trigger: Auto
          </button>
        </div>
      </div>
    );
  };

  const ammeters = components.filter(c => c.type === 'ammeter');
  const voltmeters = components.filter(c => c.type === 'voltmeter');
  const hasOscilloscope = components.some(c => c.type === 'oscilloscope');

  if (ammeters.length === 0 && voltmeters.length === 0 && !hasOscilloscope) {
    return (
      <div className={`p-6 rounded-lg border-2 ${
        themeMode === 'dark'
          ? 'bg-gray-800 border-gray-700 text-gray-400'
          : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <div className="text-center">
          <Gauge className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Measurement Instruments</h3>
          <p className="text-sm">
            Add ammeters, voltmeters, or oscilloscopes to your circuit to see real-time measurements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-bold ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Measurement Instruments
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded ${
            isSimulating
              ? themeMode === 'dark'
                ? 'bg-green-900/20 text-green-300'
                : 'bg-green-50 text-green-800'
              : themeMode === 'dark'
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm">
              {isSimulating ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Ammeters */}
      {ammeters.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Ammeters ({ammeters.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ammeters.map(renderAmmeter)}
          </div>
        </div>
      )}

      {/* Voltmeters */}
      {voltmeters.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Voltmeters ({voltmeters.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voltmeters.map(renderVoltmeter)}
          </div>
        </div>
      )}

      {/* Oscilloscope */}
      {hasOscilloscope && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Oscilloscope
          </h3>
          {renderOscilloscope()}
        </div>
      )}

      {/* Circuit Summary */}
      <div className={`p-4 rounded-lg border ${
        themeMode === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Circuit Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {circuitData.totalVoltage.toFixed(2)} V
            </div>
            <div className="text-sm opacity-75">Total Voltage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {circuitData.totalCurrent.toFixed(3)} A
            </div>
            <div className="text-sm opacity-75">Total Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {circuitData.totalResistance.toFixed(2)} Ω
            </div>
            <div className="text-sm opacity-75">Total Resistance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {circuitData.totalPower.toFixed(2)} W
            </div>
            <div className="text-sm opacity-75">Total Power</div>
          </div>
        </div>
      </div>
    </div>
  );
};
