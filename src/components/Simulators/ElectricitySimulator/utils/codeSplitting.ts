import { lazy, ComponentType } from 'react';

// Lazy load components with error boundaries
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  return lazy(importFn);
};

// Lazy load circuit components
export const LazyComponentPropertyEditor = lazy(() => 
  import('../components/ComponentPropertyEditor').then(module => ({
    default: module.ComponentPropertyEditor
  }))
);

export const LazyCanvasInteractionManager = lazy(() => 
  import('../components/CanvasInteractionManager').then(module => ({
    default: module.CanvasInteractionManager
  }))
);

export const LazyAdvancedToolbar = lazy(() => 
  import('../components/AdvancedToolbar').then(module => ({
    default: module.AdvancedToolbar
  }))
);

export const LazyAccessibilitySettings = lazy(() => 
  import('../components/AccessibilitySettings').then(module => ({
    default: module.AccessibilitySettings
  }))
);

export const LazyVisualFeedbackSystem = lazy(() => 
  import('../components/VisualFeedbackSystem').then(module => ({
    default: module.VisualFeedbackSystem
  }))
);

// Lazy load physics engines
export const LazyOptimizedPhysicsEngine = lazy(() => 
  import('../utils/optimizedPhysicsEngine').then(module => ({
    default: module.optimizedPhysicsEngine
  }))
);

// Lazy load animation manager
export const LazyAnimationManager = lazy(() => 
  import('../utils/animationManager').then(module => ({
    default: module.animationManager
  }))
);

// Lazy load object pool
export const LazyObjectPool = lazy(() => 
  import('../utils/objectPool').then(module => ({
    default: module.componentPool
  }))
);

// Route-based code splitting
export const LazyExperimentGuide = lazy(() => 
  import('../components/ExperimentGuide').then(module => ({
    default: module.ExperimentGuide
  }))
);

export const LazyComponentInfoPanel = lazy(() => 
  import('../components/ComponentInfoPanel').then(module => ({
    default: module.ComponentInfoPanel
  }))
);

// Dynamic import utility
export const dynamicImport = async <T>(
  modulePath: string,
  exportName?: string
): Promise<T> => {
  try {
    const module = await import(modulePath);
    return exportName ? module[exportName] : module.default;
  } catch (error) {
    console.error(`Failed to load module ${modulePath}:`, error);
    throw error;
  }
};

// Preload critical modules
export const preloadCriticalModules = async (): Promise<void> => {
  const criticalModules = [
    '../utils/circuitPhysics',
    '../utils/canvasRenderer',
    '../hooks/useCircuitState'
  ];

  const preloadPromises = criticalModules.map(modulePath => 
    import(modulePath).catch(error => {
      console.warn(`Failed to preload ${modulePath}:`, error);
    })
  );

  await Promise.all(preloadPromises);
};

// Preload non-critical modules in background
export const preloadNonCriticalModules = (): void => {
  const nonCriticalModules = [
    '../components/ComponentPropertyEditor',
    '../components/CanvasInteractionManager',
    '../components/AdvancedToolbar',
    '../components/AccessibilitySettings',
    '../components/VisualFeedbackSystem',
    '../utils/optimizedPhysicsEngine',
    '../utils/animationManager',
    '../utils/objectPool'
  ];

  // Preload with delay to not block initial load
  setTimeout(() => {
    nonCriticalModules.forEach(modulePath => {
      import(modulePath).catch(error => {
        console.warn(`Failed to preload ${modulePath}:`, error);
      });
    });
  }, 2000);
};

// Bundle analyzer utility
export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private moduleSizes: Map<string, number> = new Map();
  private loadTimes: Map<string, number> = new Map();

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  recordModuleLoad(modulePath: string, size: number, loadTime: number): void {
    this.moduleSizes.set(modulePath, size);
    this.loadTimes.set(modulePath, loadTime);
  }

  getBundleReport(): Record<string, any> {
    const totalSize = Array.from(this.moduleSizes.values()).reduce((sum, size) => sum + size, 0);
    const totalLoadTime = Array.from(this.loadTimes.values()).reduce((sum, time) => sum + time, 0);
    
    const modules = Array.from(this.moduleSizes.keys()).map(modulePath => ({
      path: modulePath,
      size: this.moduleSizes.get(modulePath) || 0,
      loadTime: this.loadTimes.get(modulePath) || 0,
      sizeKB: ((this.moduleSizes.get(modulePath) || 0) / 1024).toFixed(2)
    }));

    // Sort by size
    modules.sort((a, b) => b.size - a.size);

    return {
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      totalLoadTime,
      moduleCount: modules.length,
      modules,
      largestModules: modules.slice(0, 5),
      slowestModules: modules.sort((a, b) => b.loadTime - a.loadTime).slice(0, 5)
    };
  }

  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const report = this.getBundleReport();
    
    // Check for large modules
    const largeModules = report.modules.filter((m: any) => m.size > 100 * 1024); // > 100KB
    if (largeModules.length > 0) {
      suggestions.push(`Consider splitting large modules: ${largeModules.map((m: any) => m.path).join(', ')}`);
    }
    
    // Check for slow loading modules
    const slowModules = report.modules.filter((m: any) => m.loadTime > 1000); // > 1s
    if (slowModules.length > 0) {
      suggestions.push(`Optimize slow loading modules: ${slowModules.map((m: any) => m.path).join(', ')}`);
    }
    
    // Check total bundle size
    if (report.totalSize > 1024 * 1024) { // > 1MB
      suggestions.push('Total bundle size is large. Consider more aggressive code splitting.');
    }
    
    return suggestions;
  }
}

// Performance monitoring for lazy loading
export class LazyLoadingMonitor {
  private static instance: LazyLoadingMonitor;
  private loadMetrics: Map<string, { startTime: number; endTime?: number; success?: boolean }> = new Map();

  static getInstance(): LazyLoadingMonitor {
    if (!LazyLoadingMonitor.instance) {
      LazyLoadingMonitor.instance = new LazyLoadingMonitor();
    }
    return LazyLoadingMonitor.instance;
  }

  startLoading(modulePath: string): void {
    this.loadMetrics.set(modulePath, {
      startTime: performance.now()
    });
  }

  finishLoading(modulePath: string, success: boolean): void {
    const metric = this.loadMetrics.get(modulePath);
    if (metric) {
      metric.endTime = performance.now();
      metric.success = success;
    }
  }

  getLoadingReport(): Record<string, any> {
    const report: Record<string, any> = {
      totalModules: this.loadMetrics.size,
      successfulLoads: 0,
      failedLoads: 0,
      averageLoadTime: 0,
      modules: []
    };

    let totalLoadTime = 0;
    let completedLoads = 0;

    this.loadMetrics.forEach((metric, modulePath) => {
      if (metric.endTime) {
        const loadTime = metric.endTime - metric.startTime;
        totalLoadTime += loadTime;
        completedLoads++;
        
        if (metric.success) {
          report.successfulLoads++;
        } else {
          report.failedLoads++;
        }
        
        report.modules.push({
          path: modulePath,
          loadTime,
          success: metric.success
        });
      }
    });

    if (completedLoads > 0) {
      report.averageLoadTime = totalLoadTime / completedLoads;
    }

    return report;
  }
}

// Global instances
export const bundleAnalyzer = BundleAnalyzer.getInstance();
export const lazyLoadingMonitor = LazyLoadingMonitor.getInstance();

// Enhanced lazy loading with retry mechanism
export const createRetryableLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) => {
  return lazy(() => {
    const attemptImport = async (attempt: number = 1): Promise<{ default: T }> => {
      try {
        const module = await importFn();
        lazyLoadingMonitor.finishLoading(importFn.toString(), true);
        return module;
      } catch (error) {
        console.warn(`Lazy loading attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          return attemptImport(attempt + 1);
        } else {
          lazyLoadingMonitor.finishLoading(importFn.toString(), false);
          throw error;
        }
      }
    };

    lazyLoadingMonitor.startLoading(importFn.toString());
    return attemptImport();
  });
};

// Bundle size optimization utilities
export const optimizeBundleSize = {
  // Remove unused exports
  removeUnusedExports: (modulePath: string): void => {
    console.log(`Consider removing unused exports from ${modulePath}`);
  },

  // Suggest tree shaking opportunities
  suggestTreeShaking: (modulePath: string): string[] => {
    const suggestions: string[] = [];
    
    if (modulePath.includes('lodash')) {
      suggestions.push('Use individual lodash functions instead of importing entire library');
    }
    
    if (modulePath.includes('moment')) {
      suggestions.push('Consider using date-fns or dayjs instead of moment.js for smaller bundle size');
    }
    
    return suggestions;
  },

  // Analyze import patterns
  analyzeImports: (modulePath: string): Record<string, any> => {
    return {
      module: modulePath,
      suggestions: optimizeBundleSize.suggestTreeShaking(modulePath),
      optimization: 'Consider dynamic imports for non-critical functionality'
    };
  }
};
