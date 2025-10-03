import { Component, Connection } from '../types/circuit';

interface DirtyRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RenderState {
  lastFrameTime: number;
  frameCount: number;
  fps: number;
  dirtyRegions: DirtyRectangle[];
  isDirty: boolean;
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  };
}

interface ComponentBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isVisible: boolean;
}

export class OptimizedCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderState: RenderState;
  private componentBounds: Map<string, ComponentBounds> = new Map();
  private animationFrameId: number | null = null;
  private lastRenderTime: number = 0;
  private targetFPS: number = 60;
  private frameSkipThreshold: number = 16.67; // 60 FPS in milliseconds

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.renderState = {
      lastFrameTime: 0,
      frameCount: 0,
      fps: 0,
      dirtyRegions: [],
      isDirty: true,
      viewport: {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        zoom: 1
      }
    };

    this.setupCanvas();
  }

  private setupCanvas() {
    // Enable hardware acceleration
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set up high DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  /**
   * Update viewport for culling calculations
   */
  updateViewport(x: number, y: number, width: number, height: number, zoom: number) {
    this.renderState.viewport = { x, y, width, height, zoom };
    this.markDirty();
  }

  /**
   * Mark the entire canvas as dirty
   */
  markDirty() {
    this.renderState.isDirty = true;
  }

  /**
   * Mark a specific region as dirty
   */
  markRegionDirty(x: number, y: number, width: number, height: number) {
    const dirtyRect: DirtyRectangle = { x, y, width, height };
    
    // Merge with existing dirty regions to avoid overlapping
    this.renderState.dirtyRegions = this.mergeDirtyRegions([...this.renderState.dirtyRegions, dirtyRect]);
    this.renderState.isDirty = true;
  }

  /**
   * Merge overlapping dirty regions
   */
  private mergeDirtyRegions(regions: DirtyRectangle[]): DirtyRectangle[] {
    if (regions.length <= 1) return regions;

    const merged: DirtyRectangle[] = [];
    const sorted = regions.sort((a, b) => a.x - b.x);

    let current = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      
      // Check if regions overlap or are adjacent
      if (this.regionsOverlap(current, next)) {
        // Merge regions
        current = {
          x: Math.min(current.x, next.x),
          y: Math.min(current.y, next.y),
          width: Math.max(current.x + current.width, next.x + next.width) - Math.min(current.x, next.x),
          height: Math.max(current.y + current.height, next.y + next.height) - Math.min(current.y, next.y)
        };
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    return merged;
  }

  /**
   * Check if two regions overlap
   */
  private regionsOverlap(a: DirtyRectangle, b: DirtyRectangle): boolean {
    return !(a.x + a.width < b.x || b.x + b.width < a.x || 
             a.y + a.height < b.y || b.y + b.height < a.y);
  }

  /**
   * Calculate component bounds and visibility
   */
  private calculateComponentBounds(components: Component[]): void {
    this.componentBounds.clear();
    
    components.forEach(component => {
      const bounds = this.getComponentBounds(component);
      const isVisible = this.isComponentVisible(bounds);
      
      this.componentBounds.set(component.id, {
        ...bounds,
        isVisible
      });
    });
  }

  /**
   * Get bounding box for a component
   */
  private getComponentBounds(component: Component): ComponentBounds {
    const padding = 10; // Extra padding for connections
    const minX = Math.min(...component.terminals.map(t => component.position.x + t.x));
    const maxX = Math.max(...component.terminals.map(t => component.position.x + t.x));
    const minY = Math.min(...component.terminals.map(t => component.position.y + t.y));
    const maxY = Math.max(...component.terminals.map(t => component.position.y + t.y));

    return {
      id: component.id,
      x: minX - padding,
      y: minY - padding,
      width: (maxX - minX) + (padding * 2),
      height: (maxY - minY) + (padding * 2),
      isVisible: false // Will be calculated separately
    };
  }

  /**
   * Check if component is visible in viewport
   */
  private isComponentVisible(bounds: ComponentBounds): boolean {
    const viewport = this.renderState.viewport;
    
    return !(bounds.x + bounds.width < viewport.x || 
             bounds.x > viewport.x + viewport.width ||
             bounds.y + bounds.height < viewport.y || 
             bounds.y > viewport.y + viewport.height);
  }

  /**
   * Render components with culling
   */
  private renderComponents(components: Component[], themeMode: 'light' | 'dark'): void {
    const visibleComponents = components.filter(component => {
      const bounds = this.componentBounds.get(component.id);
      return bounds?.isVisible;
    });

    // Sort components by type for better batching
    const sortedComponents = visibleComponents.sort((a, b) => {
      const typeOrder = ['battery', 'bulb', 'resistor', 'switch', 'fuse', 'wire', 'capacitor', 'inductor', 'ammeter', 'voltmeter'];
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    });

    // Render by type for better performance
    const componentsByType = sortedComponents.reduce((groups, component) => {
      if (!groups[component.type]) {
        groups[component.type] = [];
      }
      groups[component.type].push(component);
      return groups;
    }, {} as Record<string, Component[]>);

    Object.entries(componentsByType).forEach(([type, typeComponents]) => {
      this.renderComponentType(typeComponents, type, themeMode);
    });
  }

  /**
   * Render components of the same type together
   */
  private renderComponentType(components: Component[], type: string, themeMode: 'light' | 'dark'): void {
    // Set common styles for this component type
    this.setupComponentTypeStyles(type, themeMode);

    components.forEach(component => {
      this.renderSingleComponent(component, themeMode);
    });
  }

  /**
   * Setup common styles for a component type
   */
  private setupComponentTypeStyles(type: string, themeMode: 'light' | 'dark'): void {
    const colors = this.getComponentColors(type, themeMode);
    
    this.ctx.strokeStyle = colors.stroke;
    this.ctx.fillStyle = colors.fill;
    this.ctx.lineWidth = 2;
  }

  /**
   * Get colors for component type
   */
  private getComponentColors(type: string, themeMode: 'light' | 'dark'): { stroke: string; fill: string } {
    const isDark = themeMode === 'dark';
    
    switch (type) {
      case 'battery':
        return {
          stroke: isDark ? '#fbbf24' : '#d97706',
          fill: isDark ? '#451a03' : '#fef3c7'
        };
      case 'bulb':
        return {
          stroke: isDark ? '#f59e0b' : '#d97706',
          fill: isDark ? '#451a03' : '#fef3c7'
        };
      case 'resistor':
        return {
          stroke: isDark ? '#6b7280' : '#374151',
          fill: isDark ? '#1f2937' : '#f3f4f6'
        };
      case 'switch':
        return {
          stroke: isDark ? '#10b981' : '#059669',
          fill: isDark ? '#064e3b' : '#d1fae5'
        };
      case 'fuse':
        return {
          stroke: isDark ? '#ef4444' : '#dc2626',
          fill: isDark ? '#450a0a' : '#fee2e2'
        };
      default:
        return {
          stroke: isDark ? '#9ca3af' : '#6b7280',
          fill: isDark ? '#374151' : '#f9fafb'
        };
    }
  }

  /**
   * Render a single component
   */
  private renderSingleComponent(component: Component, themeMode: 'light' | 'dark'): void {
    const { x, y } = component.position;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    
    // Apply rotation if component has one
    const rotation = component.properties.rotation || 0;
    if (rotation !== 0) {
      this.ctx.rotate((rotation * Math.PI) / 180);
    }

    // Render component based on type
    switch (component.type) {
      case 'battery':
        this.drawBattery(component, themeMode);
        break;
      case 'bulb':
        this.drawBulb(component, themeMode);
        break;
      case 'resistor':
        this.drawResistor(component, themeMode);
        break;
      case 'switch':
        this.drawSwitch(component, themeMode);
        break;
      case 'fuse':
        this.drawFuse(component, themeMode);
        break;
      case 'wire':
        this.drawWire(component, themeMode);
        break;
      case 'capacitor':
        this.drawCapacitor(component, themeMode);
        break;
      case 'inductor':
        this.drawInductor(component, themeMode);
        break;
      case 'ammeter':
        this.drawAmmeter(component, themeMode);
        break;
      case 'voltmeter':
        this.drawVoltmeter(component, themeMode);
        break;
    }

    this.ctx.restore();
  }

  /**
   * Draw battery component
   */
  private drawBattery(component: Component, themeMode: 'light' | 'dark'): void {
    const isDark = themeMode === 'dark';
    const brightness = component.properties.brightness || 1;
    
    // Battery body
    this.ctx.fillRect(0, 5, 30, 20);
    this.ctx.strokeRect(0, 5, 30, 20);
    
    // Positive terminal
    this.ctx.fillRect(30, 10, 5, 10);
    this.ctx.strokeRect(30, 10, 5, 10);
    
    // Negative terminal
    this.ctx.fillRect(-5, 10, 5, 10);
    this.ctx.strokeRect(-5, 10, 5, 10);
    
    // Voltage label
    this.ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${component.properties.voltage || 0}V`, 15, 30);
  }

  /**
   * Draw bulb component
   */
  private drawBulb(component: Component, themeMode: 'light' | 'dark'): void {
    const isDark = themeMode === 'dark';
    const brightness = component.properties.brightness || 0;
    
    // Bulb filament
    this.ctx.beginPath();
    this.ctx.arc(15, 15, 8, 0, 2 * Math.PI);
    
    // Adjust brightness
    const alpha = 0.3 + (brightness * 0.7);
    this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
    this.ctx.fill();
    this.ctx.stroke();
    
    // Bulb base
    this.ctx.fillRect(10, 20, 10, 8);
    this.ctx.strokeRect(10, 20, 10, 8);
    
    // Terminals
    this.ctx.fillRect(-5, 22, 5, 4);
    this.ctx.strokeRect(-5, 22, 5, 4);
    this.ctx.fillRect(25, 22, 5, 4);
    this.ctx.strokeRect(25, 22, 5, 4);
  }

  /**
   * Draw resistor component
   */
  private drawResistor(component: Component, themeMode: 'light' | 'dark'): void {
    // Resistor body
    this.ctx.fillRect(5, 10, 20, 10);
    this.ctx.strokeRect(5, 10, 20, 10);
    
    // Terminals
    this.ctx.fillRect(-5, 12, 5, 6);
    this.ctx.strokeRect(-5, 12, 5, 6);
    this.ctx.fillRect(25, 12, 5, 6);
    this.ctx.strokeRect(25, 12, 5, 6);
    
    // Resistance label
    this.ctx.fillStyle = themeMode === 'dark' ? '#9ca3af' : '#6b7280';
    this.ctx.font = '8px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${component.properties.resistance || 0}Ω`, 15, 8);
  }

  /**
   * Draw switch component
   */
  private drawSwitch(component: Component, themeMode: 'light' | 'dark'): void {
    const isOn = component.properties.isOn;
    
    // Switch base
    this.ctx.fillRect(5, 10, 20, 10);
    this.ctx.strokeRect(5, 5, 20, 20);
    
    // Switch lever
    this.ctx.beginPath();
    if (isOn) {
      this.ctx.moveTo(15, 15);
      this.ctx.lineTo(25, 10);
    } else {
      this.ctx.moveTo(15, 15);
      this.ctx.lineTo(5, 10);
    }
    this.ctx.stroke();
    
    // Terminals
    this.ctx.fillRect(-5, 12, 5, 6);
    this.ctx.strokeRect(-5, 12, 5, 6);
    this.ctx.fillRect(25, 12, 5, 6);
    this.ctx.strokeRect(25, 12, 5, 6);
  }

  /**
   * Draw fuse component
   */
  private drawFuse(component: Component, themeMode: 'light' | 'dark'): void {
    const isBlown = component.properties.isBlown;
    
    // Fuse body
    this.ctx.fillRect(5, 10, 20, 10);
    this.ctx.strokeRect(5, 10, 20, 10);
    
    // Fuse wire
    this.ctx.beginPath();
    this.ctx.moveTo(10, 15);
    this.ctx.lineTo(20, 15);
    if (isBlown) {
      this.ctx.strokeStyle = themeMode === 'dark' ? '#ef4444' : '#dc2626';
    }
    this.ctx.stroke();
    
    // Terminals
    this.ctx.fillRect(-5, 12, 5, 6);
    this.ctx.strokeRect(-5, 12, 5, 6);
    this.ctx.fillRect(25, 12, 5, 6);
    this.ctx.strokeRect(25, 12, 5, 6);
  }

  /**
   * Draw wire component
   */
  private drawWire(component: Component, themeMode: 'light' | 'dark'): void {
    this.ctx.beginPath();
    this.ctx.moveTo(0, 15);
    this.ctx.lineTo(30, 15);
    this.ctx.stroke();
  }

  /**
   * Draw capacitor component
   */
  private drawCapacitor(component: Component, themeMode: 'light' | 'dark'): void {
    // Capacitor plates
    this.ctx.fillRect(10, 5, 2, 20);
    this.ctx.strokeRect(10, 5, 2, 20);
    this.ctx.fillRect(18, 5, 2, 20);
    this.ctx.strokeRect(18, 5, 2, 20);
    
    // Terminals
    this.ctx.fillRect(-5, 12, 5, 6);
    this.ctx.strokeRect(-5, 12, 5, 6);
    this.ctx.fillRect(25, 12, 5, 6);
    this.ctx.strokeRect(25, 12, 5, 6);
  }

  /**
   * Draw inductor component
   */
  private drawInductor(component: Component, themeMode: 'light' | 'dark'): void {
    // Inductor coils
    for (let i = 0; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.arc(8 + i * 4, 15, 3, 0, Math.PI);
      this.ctx.stroke();
    }
    
    // Terminals
    this.ctx.fillRect(-5, 12, 5, 6);
    this.ctx.strokeRect(-5, 12, 5, 6);
    this.ctx.fillRect(25, 12, 5, 6);
    this.ctx.strokeRect(25, 12, 5, 6);
  }

  /**
   * Draw ammeter component
   */
  private drawAmmeter(component: Component, themeMode: 'light' | 'dark'): void {
    // Ammeter body
    this.ctx.beginPath();
    this.ctx.arc(15, 15, 10, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Needle
    this.ctx.beginPath();
    this.ctx.moveTo(15, 15);
    this.ctx.lineTo(20, 10);
    this.ctx.stroke();
    
    // Terminals
    this.ctx.fillRect(-5, 12, 5, 6);
    this.ctx.strokeRect(-5, 12, 5, 6);
    this.ctx.fillRect(25, 12, 5, 6);
    this.ctx.strokeRect(25, 12, 5, 6);
  }

  /**
   * Draw voltmeter component
   */
  private drawVoltmeter(component: Component, themeMode: 'light' | 'dark'): void {
    // Voltmeter body
    this.ctx.beginPath();
    this.ctx.arc(15, 15, 10, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Display
    this.ctx.fillStyle = themeMode === 'dark' ? '#000000' : '#ffffff';
    this.ctx.fillRect(10, 10, 10, 6);
    this.ctx.strokeRect(10, 10, 10, 6);
    
    // Terminals
    this.ctx.fillRect(-5, 12, 5, 6);
    this.ctx.strokeRect(-5, 12, 5, 6);
    this.ctx.fillRect(25, 12, 5, 6);
    this.ctx.strokeRect(25, 12, 5, 6);
  }

  /**
   * Render connections with culling
   */
  private renderConnections(connections: Connection[], components: Component[], themeMode: 'light' | 'dark'): void {
    const visibleConnections = connections.filter(connection => {
      const fromComponent = components.find(c => c.id === connection.fromComponentId);
      const toComponent = components.find(c => c.id === connection.toComponentId);
      
      if (!fromComponent || !toComponent) return false;
      
      const fromBounds = this.componentBounds.get(fromComponent.id);
      const toBounds = this.componentBounds.get(toComponent.id);
      
      return fromBounds?.isVisible || toBounds?.isVisible;
    });

    this.ctx.strokeStyle = themeMode === 'dark' ? '#6b7280' : '#9ca3af';
    this.ctx.lineWidth = 2;

    visibleConnections.forEach(connection => {
      this.renderConnection(connection, components);
    });
  }

  /**
   * Render a single connection
   */
  private renderConnection(connection: Connection, components: Component[]): void {
    const fromComponent = components.find(c => c.id === connection.fromComponentId);
    const toComponent = components.find(c => c.id === connection.toComponentId);
    
    if (!fromComponent || !toComponent) return;

    const fromTerminal = fromComponent.terminals[connection.fromTerminal];
    const toTerminal = toComponent.terminals[connection.toTerminal];
    
    if (!fromTerminal || !toTerminal) return;

    const fromPos = {
      x: fromComponent.position.x + fromTerminal.x,
      y: fromComponent.position.y + fromTerminal.y
    };
    
    const toPos = {
      x: toComponent.position.x + toTerminal.x,
      y: toComponent.position.y + toTerminal.y
    };

    this.ctx.beginPath();
    this.ctx.moveTo(fromPos.x, fromPos.y);
    this.ctx.lineTo(toPos.x, toPos.y);
    this.ctx.stroke();
  }

  /**
   * Main render method with performance optimizations
   */
  render(
    components: Component[],
    connections: Connection[],
    themeMode: 'light' | 'dark',
    showGrid: boolean = false,
    gridSize: number = 20
  ): void {
    const now = performance.now();
    const deltaTime = now - this.lastRenderTime;
    
    // Frame skipping for performance
    if (deltaTime < this.frameSkipThreshold && !this.renderState.isDirty) {
      return;
    }

    // Calculate FPS
    this.updateFPS(now);
    
    // Calculate component bounds and visibility
    this.calculateComponentBounds(components);
    
    // Clear canvas
    this.clearCanvas(themeMode);
    
    // Render grid if enabled
    if (showGrid) {
      this.renderGrid(gridSize, themeMode);
    }
    
    // Render connections first (behind components)
    this.renderConnections(connections, components, themeMode);
    
    // Render components
    this.renderComponents(components, themeMode);
    
    // Reset dirty state
    this.renderState.isDirty = false;
    this.renderState.dirtyRegions = [];
    
    this.lastRenderTime = now;
  }

  /**
   * Clear canvas efficiently
   */
  private clearCanvas(themeMode: 'light' | 'dark'): void {
    if (this.renderState.dirtyRegions.length > 0) {
      // Clear only dirty regions
      this.renderState.dirtyRegions.forEach(region => {
        this.ctx.clearRect(region.x, region.y, region.width, region.height);
      });
    } else {
      // Clear entire canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Fill background
    this.ctx.fillStyle = themeMode === 'dark' ? '#111827' : '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render grid
   */
  private renderGrid(gridSize: number, themeMode: 'light' | 'dark'): void {
    this.ctx.strokeStyle = themeMode === 'dark' ? '#374151' : '#e5e7eb';
    this.ctx.lineWidth = 1;
    
    const viewport = this.renderState.viewport;
    
    // Calculate visible grid lines
    const startX = Math.floor(viewport.x / gridSize) * gridSize;
    const endX = Math.ceil((viewport.x + viewport.width) / gridSize) * gridSize;
    const startY = Math.floor(viewport.y / gridSize) * gridSize;
    const endY = Math.ceil((viewport.y + viewport.height) / gridSize) * gridSize;
    
    this.ctx.beginPath();
    
    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
    }
    
    this.ctx.stroke();
  }

  /**
   * Update FPS calculation
   */
  private updateFPS(now: number): void {
    this.renderState.frameCount++;
    
    if (now - this.renderState.lastFrameTime >= 1000) {
      this.renderState.fps = this.renderState.frameCount;
      this.renderState.frameCount = 0;
      this.renderState.lastFrameTime = now;
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.renderState.fps;
  }

  /**
   * Set target FPS
   */
  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameSkipThreshold = 1000 / fps;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.componentBounds.clear();
  }
}
