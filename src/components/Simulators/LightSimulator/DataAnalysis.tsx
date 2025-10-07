import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, LineChart, PieChart, Download, TrendingUp, Calculator, Filter, Settings, X } from 'lucide-react';

export interface DataPoint {
  timestamp: Date;
  parameter: string;
  value: number;
  unit: string;
  simulator: string;
  metadata?: { [key: string]: any };
}

export interface AnalysisResult {
  type: 'statistical' | 'trend' | 'correlation' | 'frequency';
  title: string;
  description: string;
  data: any;
  insights: string[];
  recommendations: string[];
}

interface DataAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  dataPoints: DataPoint[];
  currentSimulator: string;
}

export const DataAnalysis: React.FC<DataAnalysisProps> = ({
  isOpen,
  onClose,
  dataPoints,
  currentSimulator
}) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('statistical');
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (dataPoints.length > 0) {
      const filtered = dataPoints.filter(dp => 
        currentSimulator === 'all' || dp.simulator === currentSimulator
      );
      setFilteredData(filtered);
      performAnalysis(filtered);
    }
  }, [dataPoints, currentSimulator]);

  const performAnalysis = (data: DataPoint[]) => {
    const results: AnalysisResult[] = [];

    // Statistical Analysis
    if (data.length > 0) {
      const values = data.map(d => d.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...values);
      const max = Math.max(...values);

      results.push({
        type: 'statistical',
        title: 'Statistical Summary',
        description: 'Basic statistical measures of your data',
        data: { mean, variance, stdDev, min, max, count: values.length },
        insights: [
          `Average value: ${mean.toFixed(2)}`,
          `Standard deviation: ${stdDev.toFixed(2)}`,
          `Range: ${min.toFixed(2)} to ${max.toFixed(2)}`,
          `Data points: ${values.length}`
        ],
        recommendations: [
          'Consider collecting more data points for better accuracy',
          'Check for outliers that might affect the mean',
          'Use standard deviation to understand data spread'
        ]
      });
    }

    // Trend Analysis
    if (data.length > 5) {
      const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const trend = calculateTrend(sortedData.map(d => d.value));
      
      results.push({
        type: 'trend',
        title: 'Trend Analysis',
        description: 'Analysis of how values change over time',
        data: { trend, slope: trend.slope, rSquared: trend.rSquared },
        insights: [
          `Trend direction: ${trend.slope > 0 ? 'Increasing' : trend.slope < 0 ? 'Decreasing' : 'Stable'}`,
          `Slope: ${trend.slope.toFixed(4)}`,
          `R-squared: ${trend.rSquared.toFixed(3)}`,
          `Trend strength: ${trend.rSquared > 0.7 ? 'Strong' : trend.rSquared > 0.3 ? 'Moderate' : 'Weak'}`
        ],
        recommendations: [
          trend.slope > 0 ? 'Values are increasing over time' : 
          trend.slope < 0 ? 'Values are decreasing over time' : 
          'Values remain relatively stable',
          'Consider the physical meaning of this trend',
          'Check if the trend is expected based on physics principles'
        ]
      });
    }

    // Correlation Analysis
    if (data.length > 10) {
      const parameters = [...new Set(data.map(d => d.parameter))];
      if (parameters.length > 1) {
        const correlations = calculateCorrelations(data, parameters);
        
        results.push({
          type: 'correlation',
          title: 'Parameter Correlations',
          description: 'Relationships between different parameters',
          data: correlations,
          insights: correlations.map(c => 
            `${c.param1} vs ${c.param2}: ${c.correlation > 0.7 ? 'Strong positive' : 
             c.correlation > 0.3 ? 'Moderate positive' : 
             c.correlation > -0.3 ? 'Weak' : 
             c.correlation > -0.7 ? 'Moderate negative' : 'Strong negative'} correlation (${c.correlation.toFixed(3)})`
          ),
          recommendations: [
            'Strong correlations indicate related physical phenomena',
            'Use correlations to predict one parameter from another',
            'Consider the underlying physics principles'
          ]
        });
      }
    }

    // Frequency Analysis
    if (data.length > 20) {
      const frequencies = calculateFrequencies(data);
      
      results.push({
        type: 'frequency',
        title: 'Value Distribution',
        description: 'How often different values occur',
        data: frequencies,
        insights: [
          `Most common value range: ${frequencies.mostCommon}`,
          `Distribution type: ${frequencies.distributionType}`,
          `Skewness: ${frequencies.skewness > 0 ? 'Right-skewed' : frequencies.skewness < 0 ? 'Left-skewed' : 'Symmetric'}`
        ],
        recommendations: [
          'Normal distribution suggests random measurement errors',
          'Skewed distributions may indicate systematic effects',
          'Consider the physical meaning of the distribution'
        ]
      });
    }

    setAnalysisResults(results);
  };

  const calculateTrend = (values: number[]) => {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = values.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const yMean = sumY / n;
    const ssRes = values.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * i + intercept), 2), 0);
    const ssTot = values.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return { slope, intercept, rSquared };
  };

  const calculateCorrelations = (data: DataPoint[], parameters: string[]) => {
    const correlations: Array<{ param1: string; param2: string; correlation: number }> = [];
    
    for (let i = 0; i < parameters.length; i++) {
      for (let j = i + 1; j < parameters.length; j++) {
        const param1Data = data.filter(d => d.parameter === parameters[i]).map(d => d.value);
        const param2Data = data.filter(d => d.parameter === parameters[j]).map(d => d.value);
        
        if (param1Data.length > 1 && param2Data.length > 1) {
          const correlation = calculatePearsonCorrelation(param1Data, param2Data);
          correlations.push({
            param1: parameters[i],
            param2: parameters[j],
            correlation
          });
        }
      }
    }
    
    return correlations;
  };

  const calculatePearsonCorrelation = (x: number[], y: number[]) => {
    const n = Math.min(x.length, y.length);
    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

    return (n * sumXY - sumX * sumY) / 
           Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  };

  const calculateFrequencies = (data: DataPoint[]) => {
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
    const binSize = range / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0
    }));
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex].count++;
    });
    
    const mostCommon = bins.reduce((max, bin) => bin.count > max.count ? bin : max).range;
    
    // Calculate skewness
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / values.length;
    
    const distributionType = Math.abs(skewness) < 0.5 ? 'Normal' : 
                            skewness > 0.5 ? 'Right-skewed' : 'Left-skewed';
    
    return { bins, mostCommon, distributionType, skewness };
  };

  const exportData = (format: 'csv' | 'json' | 'excel') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `light-simulator-data-${timestamp}`;
    
    switch (format) {
      case 'csv':
        exportToCSV(filteredData, filename);
        break;
      case 'json':
        exportToJSON(filteredData, filename);
        break;
      case 'excel':
        exportToExcel(filteredData, filename);
        break;
    }
  };

  const exportToCSV = (data: DataPoint[], filename: string) => {
    const headers = ['Timestamp', 'Parameter', 'Value', 'Unit', 'Simulator'];
    const csvContent = [
      headers.join(','),
      ...data.map(d => [
        d.timestamp.toISOString(),
        d.parameter,
        d.value,
        d.unit,
        d.simulator
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: DataPoint[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (data: DataPoint[], filename: string) => {
    // Simple Excel export using CSV format with .xlsx extension
    exportToCSV(data, filename.replace('.csv', ''));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Data Analysis</h2>
              <p className="text-blue-200 text-sm">
                Analyze your simulation data with advanced statistical tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-white/20 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Analysis Types</h3>
              
              <div className="space-y-2 mb-6">
                {[
                  { id: 'statistical', title: 'Statistical Summary', icon: Calculator },
                  { id: 'trend', title: 'Trend Analysis', icon: TrendingUp },
                  { id: 'correlation', title: 'Correlations', icon: BarChart3 },
                  { id: 'frequency', title: 'Distribution', icon: PieChart }
                ].map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedAnalysis(id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedAnalysis === id 
                        ? 'bg-blue-500/20 border border-blue-400/30' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-blue-400" />
                    <span className="text-white">{title}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-white/20 pt-4">
                <h4 className="text-sm font-semibold text-white mb-3">Export Data</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => exportData('csv')}
                    className="w-full flex items-center gap-2 p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportData('json')}
                    className="w-full flex items-center gap-2 p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export as JSON
                  </button>
                  <button
                    onClick={() => exportData('excel')}
                    className="w-full flex items-center gap-2 p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-purple-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export as Excel
                  </button>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-white mb-3">Data Summary</h4>
                <div className="text-sm text-blue-200 space-y-1">
                  <div>Total Points: {filteredData.length}</div>
                  <div>Simulator: {currentSimulator}</div>
                  <div>Date Range: {filteredData.length > 0 ? 
                    `${filteredData[0].timestamp.toLocaleDateString()} - ${filteredData[filteredData.length - 1].timestamp.toLocaleDateString()}` : 
                    'No data'
                  }</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {analysisResults.length > 0 ? (
              <div>
                {analysisResults
                  .filter(result => result.type === selectedAnalysis)
                  .map((result, index) => (
                    <div key={index} className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{result.title}</h3>
                      <p className="text-blue-200 mb-4">{result.description}</p>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Insights */}
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-white mb-3">Key Insights</h4>
                          <ul className="space-y-2">
                            {result.insights.map((insight, i) => (
                              <li key={i} className="text-blue-200 text-sm flex items-start gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-white mb-3">Recommendations</h4>
                          <ul className="space-y-2">
                            {result.recommendations.map((rec, i) => (
                              <li key={i} className="text-green-200 text-sm flex items-start gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Data Visualization */}
                      {result.type === 'frequency' && result.data.bins && (
                        <div className="mt-6 bg-white/5 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-white mb-3">Value Distribution</h4>
                          <div className="space-y-2">
                            {result.data.bins.map((bin: any, i: number) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className="text-blue-200 text-sm w-32">{bin.range}</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-4">
                                  <div 
                                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${(bin.count / Math.max(...result.data.bins.map((b: any) => b.count))) * 100}%` }}
                                  />
                                </div>
                                <span className="text-white text-sm w-8">{bin.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
                <p className="text-blue-200">
                  Start using the simulators to collect data for analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
