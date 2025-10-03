// Canvas optimization utilities for better performance

export class CanvasOptimizer {
  private static rafId: number | null = null;
  private static pendingRedraws = new Set<() => void>();

  // Debounced redraw to prevent excessive canvas updates
  static scheduleRedraw(redrawFunction: () => void) {
    this.pendingRedraws.add(redrawFunction);
    
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.pendingRedraws.forEach(fn => fn());
        this.pendingRedraws.clear();
        this.rafId = null;
      });
    }
  }

  // Optimized canvas setup
  static setupCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(dpr, dpr);
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    return ctx;
  }

  // Batch canvas operations for better performance
  static batchDraw(ctx: CanvasRenderingContext2D, operations: Array<() => void>) {
    ctx.save();
    operations.forEach(op => op());
    ctx.restore();
  }

  // Clear canvas efficiently
  static clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);
  }

  // Optimized line drawing with caching
  static drawOptimizedLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    style: {
      color: string;
      width: number;
      dash?: number[];
    }
  ) {
    ctx.save();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    if (style.dash) {
      ctx.setLineDash(style.dash);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  // Optimized arrow drawing
  static drawOptimizedArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    size: number = 15
  ) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(toX - size * Math.cos(angle - Math.PI/6), toY - size * Math.sin(angle - Math.PI/6));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle + Math.PI/6), toY - size * Math.sin(angle + Math.PI/6));
    ctx.stroke();
    ctx.restore();
  }

  // Memory-efficient gradient creation
  static createGradient(
    ctx: CanvasRenderingContext2D,
    type: 'linear' | 'radial',
    stops: Array<{ color: string; position: number }>,
    x0: number = 0,
    y0: number = 0,
    x1: number = 0,
    y1: number = 0,
    r0: number = 0,
    r1: number = 100
  ): CanvasGradient | null {
    let gradient: CanvasGradient;
    
    if (type === 'linear') {
      gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    } else {
      gradient = ctx.createRadialGradient(x0, y0, r0, x0, y0, r1);
    }
    
    stops.forEach(stop => {
      gradient.addColorStop(stop.position, stop.color);
    });
    
    return gradient;
  }

  // Efficient text rendering with caching
  private static textCache = new Map<string, { width: number; height: number }>();
  
  static measureText(ctx: CanvasRenderingContext2D, text: string, font: string): { width: number; height: number } {
    const key = `${text}-${font}`;
    
    if (this.textCache.has(key)) {
      return this.textCache.get(key)!;
    }
    
    ctx.save();
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const result = {
      width: metrics.width,
      height: parseInt(font) || 16
    };
    ctx.restore();
    
    this.textCache.set(key, result);
    return result;
  }

  // Clean up resources
  static cleanup() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pendingRedraws.clear();
    this.textCache.clear();
  }
}

// Performance monitoring utility
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();
  
  static startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }
      
      this.measurements.get(label)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.measurements.get(label)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }
  
  static getAverageTime(label: string): number {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }
  
  static getStats(): Record<string, { average: number; min: number; max: number; count: number }> {
    const stats: Record<string, { average: number; min: number; max: number; count: number }> = {};
    
    this.measurements.forEach((measurements, label) => {
      if (measurements.length === 0) return;
      
      stats[label] = {
        average: measurements.reduce((sum, time) => sum + time, 0) / measurements.length,
        min: Math.min(...measurements),
        max: Math.max(...measurements),
        count: measurements.length
      };
    });
    
    return stats;
  }
}
