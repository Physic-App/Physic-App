/**
 * Performance Optimization Utilities
 * Provides tools for optimizing canvas rendering and physics calculations
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  calculationTime: number;
}

export class PerformanceOptimizer {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTime = 16.67; // 60 FPS target
  private renderTime = 0;
  private calculationTime = 0;
  private memoryUsage = 0;
  
  private rafId: number | null = null;
  private isMonitoring = false;
  
  private onMetricsUpdate?: (metrics: PerformanceMetrics) => void;

  constructor() {
    this.startMonitoring();
  }

  startMonitoring(onUpdate?: (metrics: PerformanceMetrics) => void): void {
    this.onMetricsUpdate = onUpdate;
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameCount++;
    this.frameTime = deltaTime;
    this.fps = 1000 / deltaTime;
    
    // Update memory usage (if available)
    if ('memory' in performance) {
      this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    if (this.onMetricsUpdate) {
      this.onMetricsUpdate({
        fps: this.fps,
        frameTime: this.frameTime,
        memoryUsage: this.memoryUsage,
        renderTime: this.renderTime,
        calculationTime: this.calculationTime
      });
    }
    
    this.lastTime = currentTime;
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  measureRender<T>(renderFunction: () => T): T {
    const startTime = performance.now();
    const result = renderFunction();
    this.renderTime = performance.now() - startTime;
    return result;
  }

  measureCalculation<T>(calculationFunction: () => T): T {
    const startTime = performance.now();
    const result = calculationFunction();
    this.calculationTime = performance.now() - startTime;
    return result;
  }

  getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memoryUsage: this.memoryUsage,
      renderTime: this.renderTime,
      calculationTime: this.calculationTime
    };
  }

  isPerformanceGood(): boolean {
    return this.fps >= 30 && this.frameTime <= 33.33; // 30 FPS minimum
  }

  getPerformanceWarning(): string | null {
    if (this.fps < 15) {
      return 'Very poor performance detected. Consider reducing complexity.';
    } else if (this.fps < 30) {
      return 'Low performance detected. Some features may be laggy.';
    } else if (this.frameTime > 50) {
      return 'High frame time detected. Rendering may be slow.';
    }
    return null;
  }
}

// Canvas optimization utilities
export class CanvasOptimizer {
  private static instance: CanvasOptimizer;
  private devicePixelRatio = window.devicePixelRatio || 1;
  private maxCanvasSize = 4096; // Maximum canvas size for performance

  static getInstance(): CanvasOptimizer {
    if (!CanvasOptimizer.instance) {
      CanvasOptimizer.instance = new CanvasOptimizer();
    }
    return CanvasOptimizer.instance;
  }

  optimizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
    // Set display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Set actual size with device pixel ratio
    const actualWidth = Math.min(width * this.devicePixelRatio, this.maxCanvasSize);
    const actualHeight = Math.min(height * this.devicePixelRatio, this.maxCanvasSize);
    
    canvas.width = actualWidth;
    canvas.height = actualHeight;

    // Scale context to match device pixel ratio
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }
  }

  setHighDPI(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
  }

  enableOptimizedRendering(ctx: CanvasRenderingContext2D): void {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.textRenderingOptimization = 'optimizeSpeed';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
  }

  createOptimizedGradient(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    colors: string[]
  ): CanvasGradient | null {
    try {
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });
      return gradient;
    } catch (error) {
      console.warn('Failed to create gradient:', error);
      return null;
    }
  }
}

// Physics calculation optimization
export class PhysicsOptimizer {
  private static calculationCache = new Map<string, any>();
  private static cacheSize = 1000;
  private static cacheHits = 0;
  private static cacheMisses = 0;

  static getCacheStats(): { hits: number; misses: number; hitRate: number } {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? this.cacheHits / total : 0
    };
  }

  static clearCache(): void {
    this.calculationCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  static memoize<T>(key: string, calculation: () => T): T {
    if (this.calculationCache.has(key)) {
      this.cacheHits++;
      return this.calculationCache.get(key);
    }

    this.cacheMisses++;
    const result = calculation();
    
    // Limit cache size
    if (this.calculationCache.size >= this.cacheSize) {
      const firstKey = this.calculationCache.keys().next().value;
      this.calculationCache.delete(firstKey);
    }
    
    this.calculationCache.set(key, result);
    return result;
  }

  static createCacheKey(...params: (number | string)[]): string {
    return params.map(p => p.toString()).join('_');
  }
}

// Memory management utilities
export class MemoryManager {
  private static instances = new Set<{ destroy: () => void }>();
  private static memoryThreshold = 100 * 1024 * 1024; // 100MB

  static register(instance: { destroy: () => void }): void {
    this.instances.add(instance);
  }

  static unregister(instance: { destroy: () => void }): void {
    this.instances.delete(instance);
  }

  static cleanup(): void {
    for (const instance of this.instances) {
      try {
        instance.destroy();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    }
    this.instances.clear();
  }

  static checkMemoryUsage(): boolean {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      if (usedMB > this.memoryThreshold / 1024 / 1024) {
        console.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
        return true;
      }
    }
    return false;
  }

  static forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }
}

// Global performance monitoring
export const globalPerformanceOptimizer = new PerformanceOptimizer();
export const globalCanvasOptimizer = CanvasOptimizer.getInstance();

// Performance monitoring hook for React components
export const usePerformanceMonitoring = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    endTiming: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
};
