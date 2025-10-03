/**
 * Data Collection System
 * Automatically collects and manages simulation data for analysis
 */

export interface DataPoint {
  timestamp: Date;
  parameter: string;
  value: number;
  unit: string;
  simulator: string;
  metadata?: { [key: string]: any };
}

export interface DataCollectionConfig {
  autoCollect: boolean;
  collectionInterval: number; // milliseconds
  maxDataPoints: number;
  parameters: string[];
  simulators: string[];
}

export class DataCollector {
  private dataPoints: DataPoint[] = [];
  private config: DataCollectionConfig;
  private collectionTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(data: DataPoint[]) => void> = [];

  constructor(config: Partial<DataCollectionConfig> = {}) {
    this.config = {
      autoCollect: true,
      collectionInterval: 1000, // 1 second
      maxDataPoints: 1000,
      parameters: ['incidentAngle', 'refractedAngle', 'deviation', 'magnification'],
      simulators: ['reflection', 'refraction', 'lens', 'tir', 'prism', 'diffraction', 'polarization'],
      ...config
    };

    // Load saved data from localStorage
    this.loadData();
  }

  startCollection(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
    }

    if (this.config.autoCollect) {
      this.collectionTimer = setInterval(() => {
        this.collectCurrentData();
      }, this.config.collectionInterval);
    }
  }

  stopCollection(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }
  }

  addDataPoint(dataPoint: DataPoint): void {
    this.dataPoints.push(dataPoint);
    
    // Limit data points to prevent memory issues
    if (this.dataPoints.length > this.config.maxDataPoints) {
      this.dataPoints = this.dataPoints.slice(-this.config.maxDataPoints);
    }

    // Save to localStorage
    this.saveData();
    
    // Notify listeners
    this.notifyListeners();
  }

  addMultipleDataPoints(dataPoints: DataPoint[]): void {
    this.dataPoints.push(...dataPoints);
    
    if (this.dataPoints.length > this.config.maxDataPoints) {
      this.dataPoints = this.dataPoints.slice(-this.config.maxDataPoints);
    }

    this.saveData();
    this.notifyListeners();
  }

  collectCurrentData(): void {
    // This would be called by simulators to collect current state
    // Implementation depends on how simulators expose their data
  }

  getDataPoints(): DataPoint[] {
    return [...this.dataPoints];
  }

  getDataPointsBySimulator(simulator: string): DataPoint[] {
    return this.dataPoints.filter(dp => dp.simulator === simulator);
  }

  getDataPointsByParameter(parameter: string): DataPoint[] {
    return this.dataPoints.filter(dp => dp.parameter === parameter);
  }

  getDataPointsByTimeRange(startTime: Date, endTime: Date): DataPoint[] {
    return this.dataPoints.filter(dp => 
      dp.timestamp >= startTime && dp.timestamp <= endTime
    );
  }

  getLatestDataPoint(parameter?: string, simulator?: string): DataPoint | null {
    let filtered = this.dataPoints;
    
    if (parameter) {
      filtered = filtered.filter(dp => dp.parameter === parameter);
    }
    
    if (simulator) {
      filtered = filtered.filter(dp => dp.simulator === simulator);
    }
    
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }

  getDataSummary(): {
    totalPoints: number;
    simulators: string[];
    parameters: string[];
    timeRange: { start: Date | null; end: Date | null };
    averageValues: { [parameter: string]: number };
  } {
    const simulators = [...new Set(this.dataPoints.map(dp => dp.simulator))];
    const parameters = [...new Set(this.dataPoints.map(dp => dp.parameter))];
    
    const timestamps = this.dataPoints.map(dp => dp.timestamp);
    const timeRange = {
      start: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : null,
      end: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : null
    };

    const averageValues: { [parameter: string]: number } = {};
    parameters.forEach(param => {
      const values = this.dataPoints
        .filter(dp => dp.parameter === param)
        .map(dp => dp.value);
      averageValues[param] = values.length > 0 ? 
        values.reduce((a, b) => a + b, 0) / values.length : 0;
    });

    return {
      totalPoints: this.dataPoints.length,
      simulators,
      parameters,
      timeRange,
      averageValues
    };
  }

  clearData(): void {
    this.dataPoints = [];
    this.saveData();
    this.notifyListeners();
  }

  exportData(format: 'json' | 'csv'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.dataPoints, null, 2);
      case 'csv':
        return this.exportToCSV();
      default:
        return '';
    }
  }

  private exportToCSV(): string {
    const headers = ['Timestamp', 'Parameter', 'Value', 'Unit', 'Simulator'];
    const rows = this.dataPoints.map(dp => [
      dp.timestamp.toISOString(),
      dp.parameter,
      dp.value.toString(),
      dp.unit,
      dp.simulator
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private saveData(): void {
    try {
      localStorage.setItem('lightSimulatorData', JSON.stringify(this.dataPoints));
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error);
    }
  }

  private loadData(): void {
    try {
      const saved = localStorage.getItem('lightSimulatorData');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.dataPoints = parsed.map((dp: any) => ({
          ...dp,
          timestamp: new Date(dp.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error);
      this.dataPoints = [];
    }
  }

  addListener(callback: (data: DataPoint[]) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (data: DataPoint[]) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.dataPoints]));
  }

  updateConfig(newConfig: Partial<DataCollectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart collection if interval changed
    if (newConfig.collectionInterval) {
      this.stopCollection();
      this.startCollection();
    }
  }

  getConfig(): DataCollectionConfig {
    return { ...this.config };
  }
}

// Global data collector instance
export const globalDataCollector = new DataCollector();

// Utility functions for creating data points
export const createDataPoint = (
  parameter: string,
  value: number,
  unit: string,
  simulator: string,
  metadata?: { [key: string]: any }
): DataPoint => ({
  timestamp: new Date(),
  parameter,
  value,
  unit,
  simulator,
  metadata
});

// Hook for React components to use data collection
export const useDataCollection = () => {
  const [dataPoints, setDataPoints] = React.useState<DataPoint[]>([]);

  React.useEffect(() => {
    const handleDataUpdate = (newData: DataPoint[]) => {
      setDataPoints(newData);
    };

    globalDataCollector.addListener(handleDataUpdate);
    setDataPoints(globalDataCollector.getDataPoints());

    return () => {
      globalDataCollector.removeListener(handleDataUpdate);
    };
  }, []);

  const addDataPoint = React.useCallback((
    parameter: string,
    value: number,
    unit: string,
    simulator: string,
    metadata?: { [key: string]: any }
  ) => {
    const dataPoint = createDataPoint(parameter, value, unit, simulator, metadata);
    globalDataCollector.addDataPoint(dataPoint);
  }, []);

  const clearData = React.useCallback(() => {
    globalDataCollector.clearData();
  }, []);

  const exportData = React.useCallback((format: 'json' | 'csv') => {
    return globalDataCollector.exportData(format);
  }, []);

  return {
    dataPoints,
    addDataPoint,
    clearData,
    exportData,
    getSummary: globalDataCollector.getDataSummary.bind(globalDataCollector)
  };
};

// Import React for the hook
import React from 'react';
