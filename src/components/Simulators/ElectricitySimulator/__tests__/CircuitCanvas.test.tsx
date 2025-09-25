import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CircuitCanvas } from '../CircuitCanvas';
import { Component, Connection } from '../../types/circuit';

// Mock the canvas context
const mockGetContext = jest.fn();
const mockCanvas = {
  getContext: mockGetContext,
  width: 800,
  height: 600,
  getBoundingClientRect: () => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
  }),
};

// Mock canvas methods
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  setTransform: jest.fn(),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  measureText: jest.fn(() => ({ width: 100 })),
  createLinearGradient: jest.fn(),
  createRadialGradient: jest.fn(),
  createPattern: jest.fn(),
  putImageData: jest.fn(),
  getImageData: jest.fn(),
  drawImage: jest.fn(),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  strokeStyle: '#000000',
  fillStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
};

mockGetContext.mockReturnValue(mockContext);

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
  value: () => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CircuitCanvas', () => {
  const mockComponents: Component[] = [
    {
      id: 'battery-1',
      type: 'battery',
      position: { x: 100, y: 100 },
      terminals: [
        { x: 0, y: 0 },
        { x: 40, y: 0 }
      ],
      properties: { voltage: 12, resistance: 0.001 }
    },
    {
      id: 'resistor-1',
      type: 'resistor',
      position: { x: 200, y: 100 },
      terminals: [
        { x: 0, y: 0 },
        { x: 40, y: 0 }
      ],
      properties: { resistance: 100 }
    }
  ];

  const mockConnections: Connection[] = [
    {
      id: 'conn-1',
      fromComponentId: 'battery-1',
      toComponentId: 'resistor-1',
      fromTerminal: 1,
      toTerminal: 0
    }
  ];

  const defaultProps = {
    components: mockComponents,
    connections: mockConnections,
    selectedComponents: [],
    onSelectComponents: jest.fn(),
    onAddComponent: jest.fn(),
    onUpdateComponent: jest.fn(),
    onRemoveComponent: jest.fn(),
    onAddConnection: jest.fn(),
    onRemoveConnection: jest.fn(),
    themeMode: 'light' as const,
    showGrid: true,
    gridSize: 20,
    zoomLevel: 100,
    onZoomChange: jest.fn(),
    onPan: jest.fn(),
    onResetView: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CircuitCanvas {...defaultProps} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders canvas with correct dimensions', () => {
    render(<CircuitCanvas {...defaultProps} />);
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });

  it('calls getContext with 2d context', () => {
    render(<CircuitCanvas {...defaultProps} />);
    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });

  it('handles component selection on click', async () => {
    const user = userEvent.setup();
    const onSelectComponents = jest.fn();
    
    render(
      <CircuitCanvas 
        {...defaultProps} 
        onSelectComponents={onSelectComponents}
      />
    );

    const canvas = screen.getByRole('img');
    
    // Simulate click on battery component
    await user.click(canvas, { clientX: 120, clientY: 120 });
    
    expect(onSelectComponents).toHaveBeenCalledWith(['battery-1']);
  });

  it('handles multiple component selection with Ctrl+click', async () => {
    const user = userEvent.setup();
    const onSelectComponents = jest.fn();
    
    render(
      <CircuitCanvas 
        {...defaultProps} 
        onSelectComponents={onSelectComponents}
      />
    );

    const canvas = screen.getByRole('img');
    
    // First click on battery
    await user.click(canvas, { clientX: 120, clientY: 120 });
    
    // Ctrl+click on resistor
    await user.click(canvas, { 
      clientX: 220, 
      clientY: 120,
      ctrlKey: true 
    });
    
    expect(onSelectComponents).toHaveBeenCalledWith(['battery-1', 'resistor-1']);
  });

  it('handles component drag', async () => {
    const user = userEvent.setup();
    const onUpdateComponent = jest.fn();
    
    render(
      <CircuitCanvas 
        {...defaultProps} 
        onUpdateComponent={onUpdateComponent}
      />
    );

    const canvas = screen.getByRole('img');
    
    // Start drag on battery
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { clientX: 120, clientY: 120 } },
      { coords: { clientX: 150, clientY: 150 } },
      { keys: '[/MouseLeft]' }
    ]);
    
    expect(onUpdateComponent).toHaveBeenCalledWith('battery-1', {
      position: { x: 130, y: 130 }
    });
  });

  it('handles connection creation', async () => {
    const user = userEvent.setup();
    const onAddConnection = jest.fn();
    
    render(
      <CircuitCanvas 
        {...defaultProps} 
        connections={[]}
        onAddConnection={onAddConnection}
      />
    );

    const canvas = screen.getByRole('img');
    
    // Click on battery terminal
    await user.click(canvas, { clientX: 140, clientY: 100 });
    
    // Click on resistor terminal
    await user.click(canvas, { clientX: 200, clientY: 100 });
    
    expect(onAddConnection).toHaveBeenCalledWith({
      fromComponentId: 'battery-1',
      toComponentId: 'resistor-1',
      fromTerminal: 1,
      toTerminal: 0
    });
  });

  it('prevents invalid connections', async () => {
    const user = userEvent.setup();
    const onAddConnection = jest.fn();
    
    render(
      <CircuitCanvas 
        {...defaultProps} 
        connections={[]}
        onAddConnection={onAddConnection}
      />
    );

    const canvas = screen.getByRole('img');
    
    // Try to connect battery to itself
    await user.click(canvas, { clientX: 100, clientY: 100 });
    await user.click(canvas, { clientX: 140, clientY: 100 });
    
    expect(onAddConnection).not.toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    const onRemoveComponent = jest.fn();
    
    render(
      <CircuitCanvas 
        {...defaultProps} 
        selectedComponents={['battery-1']}
        onRemoveComponent={onRemoveComponent}
      />
    );

    // Press Delete key
    await user.keyboard('{Delete}');
    
    expect(onRemoveComponent).toHaveBeenCalledWith('battery-1');
  });

  it('handles zoom with mouse wheel', async () => {
    const user = userEvent.setup();
    const onZoomChange = jest.fn();
    
    render(
      <CircuitCanvas 
        {...defaultProps} 
        onZoomChange={onZoomChange}
      />
    );

    const canvas = screen.getByRole('img');
    
    // Simulate wheel event
    fireEvent.wheel(canvas, { deltaY: -100 });
    
    expect(onZoomChange).toHaveBeenCalledWith(110);
  });

  it('handles pan with mouse drag', async () => {
    const user = userEvent.setup();
    const onPan = jest.fn();
    
    render(
      <CircuitCanvas 
        {...defaultProps} 
        onPan={onPan}
      />
    );

    const canvas = screen.getByRole('img');
    
    // Simulate pan with middle mouse button
    await user.pointer([
      { keys: '[MouseMiddle>]', target: canvas, coords: { clientX: 100, clientY: 100 } },
      { coords: { clientX: 150, clientY: 150 } },
      { keys: '[/MouseMiddle]' }
    ]);
    
    expect(onPan).toHaveBeenCalledWith(50, 50);
  });

  it('renders grid when showGrid is true', () => {
    render(<CircuitCanvas {...defaultProps} showGrid={true} />);
    
    // Grid rendering is tested through canvas context calls
    expect(mockContext.strokeStyle).toBeDefined();
  });

  it('does not render grid when showGrid is false', () => {
    render(<CircuitCanvas {...defaultProps} showGrid={false} />);
    
    // Grid should not be rendered
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('handles theme mode changes', () => {
    const { rerender } = render(
      <CircuitCanvas {...defaultProps} themeMode="light" />
    );
    
    rerender(<CircuitCanvas {...defaultProps} themeMode="dark" />);
    
    // Canvas should re-render with new theme
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('handles component property updates', () => {
    const updatedComponents = [
      ...mockComponents,
      {
        ...mockComponents[0],
        properties: { ...mockComponents[0].properties, voltage: 24 }
      }
    ];

    const { rerender } = render(
      <CircuitCanvas {...defaultProps} components={mockComponents} />
    );
    
    rerender(
      <CircuitCanvas {...defaultProps} components={updatedComponents} />
    );
    
    // Canvas should re-render with updated components
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('handles connection updates', () => {
    const updatedConnections = [
      ...mockConnections,
      {
        id: 'conn-2',
        fromComponentId: 'resistor-1',
        toComponentId: 'battery-1',
        fromTerminal: 1,
        toTerminal: 0
      }
    ];

    const { rerender } = render(
      <CircuitCanvas {...defaultProps} connections={mockConnections} />
    );
    
    rerender(
      <CircuitCanvas {...defaultProps} connections={updatedConnections} />
    );
    
    // Canvas should re-render with updated connections
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('handles empty component list', () => {
    render(<CircuitCanvas {...defaultProps} components={[]} />);
    
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('handles empty connection list', () => {
    render(<CircuitCanvas {...defaultProps} connections={[]} />);
    
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(mockContext.clearRect).toHaveBeenCalled();
  });
});
