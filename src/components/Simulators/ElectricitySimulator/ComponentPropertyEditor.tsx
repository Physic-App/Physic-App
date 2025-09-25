import React, { useState, useEffect, useCallback } from 'react';
import { Component } from './types/circuit';
import { validateComponent } from './utils/validation';
import { X, Check, AlertCircle, RotateCw, RotateCcw } from 'lucide-react';

interface ComponentPropertyEditorProps {
  component: Component;
  isVisible: boolean;
  onClose: () => void;
  onSave: (componentId: string, updates: Partial<Component>) => void;
  themeMode: 'light' | 'dark';
}

export const ComponentPropertyEditor: React.FC<ComponentPropertyEditorProps> = ({
  component,
  isVisible,
  onClose,
  onSave,
  themeMode
}) => {
  const [editedProperties, setEditedProperties] = useState(component.properties);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  // Update local state when component changes
  useEffect(() => {
    setEditedProperties(component.properties);
  }, [component]);

  // Validate properties whenever they change
  useEffect(() => {
    const updatedComponent = { ...component, properties: editedProperties };
    const validation = validateComponent(updatedComponent);
    setValidationErrors(validation.errors.map(e => e.message));
    setIsValid(validation.isValid);
  }, [editedProperties, component]);

  const handlePropertyChange = useCallback((property: string, value: string | number | boolean) => {
    setEditedProperties(prev => ({
      ...prev,
      [property]: value
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (isValid) {
      onSave(component.id, { properties: editedProperties });
      onClose();
    }
  }, [isValid, component.id, editedProperties, onSave, onClose]);

  const handleRotate = useCallback((direction: 'clockwise' | 'counterclockwise') => {
    const currentRotation = component.properties.rotation || 0;
    const rotationStep = 90;
    const newRotation = direction === 'clockwise' 
      ? (currentRotation + rotationStep) % 360
      : (currentRotation - rotationStep + 360) % 360;
    
    onSave(component.id, { properties: { ...component.properties, rotation: newRotation } });
  }, [component.id, component.properties, onSave]);

  if (!isVisible) return null;

  const renderPropertyInput = (property: string, label: string, type: 'number' | 'boolean' | 'text' = 'number') => {
    const value = editedProperties[property as keyof typeof editedProperties];
    
    switch (type) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handlePropertyChange(property, e.target.checked)}
              className={`w-4 h-4 rounded ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-blue-500' 
                  : 'bg-white border-gray-300 text-blue-600'
              }`}
              aria-label={`Toggle ${label}`}
            />
            <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {label}
            </span>
          </label>
        );
      
      case 'text':
        return (
          <div className="space-y-1">
            <label className={`block text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {label}
            </label>
            <input
              type="text"
              value={String(value || '')}
              onChange={(e) => handlePropertyChange(property, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                themeMode === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              aria-label={label}
            />
          </div>
        );
      
      default: // number
        return (
          <div className="space-y-1">
            <label className={`block text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {label}
            </label>
            <input
              type="number"
              value={Number(value) || 0}
              onChange={(e) => handlePropertyChange(property, parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                themeMode === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              aria-label={label}
            />
          </div>
        );
    }
  };

  const getComponentSpecificProperties = () => {
    switch (component.type) {
      case 'battery':
        return (
          <>
            {renderPropertyInput('voltage', 'Voltage (V)', 'number')}
            {renderPropertyInput('resistance', 'Internal Resistance (Ω)', 'number')}
          </>
        );
      
      case 'bulb':
        return (
          <>
            {renderPropertyInput('resistance', 'Resistance (Ω)', 'number')}
            {renderPropertyInput('power', 'Power Rating (W)', 'number')}
          </>
        );
      
      case 'resistor':
        return (
          <>
            {renderPropertyInput('resistance', 'Resistance (Ω)', 'number')}
          </>
        );
      
      case 'switch':
        return (
          <>
            {renderPropertyInput('isOn', 'Switch State', 'boolean')}
            {renderPropertyInput('resistance', 'Contact Resistance (Ω)', 'number')}
          </>
        );
      
      case 'fuse':
        return (
          <>
            {renderPropertyInput('maxCurrent', 'Max Current (A)', 'number')}
            {renderPropertyInput('resistance', 'Resistance (Ω)', 'number')}
          </>
        );
      
      case 'capacitor':
        return (
          <>
            {renderPropertyInput('capacitance', 'Capacitance (F)', 'number')}
            {renderPropertyInput('resistance', 'ESR (Ω)', 'number')}
          </>
        );
      
      case 'inductor':
        return (
          <>
            {renderPropertyInput('inductance', 'Inductance (H)', 'number')}
            {renderPropertyInput('resistance', 'DCR (Ω)', 'number')}
          </>
        );
      
      case 'ammeter':
        return (
          <>
            {renderPropertyInput('resistance', 'Internal Resistance (Ω)', 'number')}
          </>
        );
      
      case 'voltmeter':
        return (
          <>
            {renderPropertyInput('resistance', 'Internal Resistance (Ω)', 'number')}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl border-2 ${
        themeMode === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${themeMode === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              Edit {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
            </h2>
            <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              ID: {component.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rotation Controls */}
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Orientation
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleRotate('counterclockwise')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                aria-label="Rotate counterclockwise"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {(component.properties.rotation || 0)}°
              </span>
              <button
                onClick={() => handleRotate('clockwise')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                aria-label="Rotate clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Component Properties */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Properties
            </h3>
            <div className="space-y-4">
              {getComponentSpecificProperties()}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className={`p-4 rounded-lg border-2 ${
              themeMode === 'dark' 
                ? 'bg-red-900/20 border-red-700 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Validation Errors:</h4>
                  <ul className="text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end space-x-3 p-6 border-t ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              themeMode === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 ${
              isValid
                ? themeMode === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                : themeMode === 'dark'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
