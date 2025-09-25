import { Component, Connection } from '../types/circuit';

interface PoolConfig {
  initialSize: number;
  maxSize: number;
  growthFactor: number;
}

interface PoolStats {
  totalCreated: number;
  totalReused: number;
  currentSize: number;
  maxSizeReached: number;
  hitRate: number;
}

export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private config: PoolConfig;
  private stats: PoolStats = {
    totalCreated: 0,
    totalReused: 0,
    currentSize: 0,
    maxSizeReached: 0,
    hitRate: 0
  };

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    config: Partial<PoolConfig> = {}
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.config = {
      initialSize: 10,
      maxSize: 1000,
      growthFactor: 1.5,
      ...config
    };

    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.config.initialSize; i++) {
      this.pool.push(this.createFn());
      this.stats.totalCreated++;
    }
    this.stats.currentSize = this.config.initialSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      this.stats.totalReused++;
      this.stats.currentSize--;
      this.updateHitRate();
      return obj;
    }

    // Pool is empty, create new object
    const obj = this.createFn();
    this.stats.totalCreated++;
    this.updateHitRate();
    return obj;
  }

  release(obj: T): void {
    if (this.pool.length >= this.config.maxSize) {
      // Pool is full, don't add more objects
      return;
    }

    this.resetFn(obj);
    this.pool.push(obj);
    this.stats.currentSize++;
    this.stats.maxSizeReached = Math.max(this.stats.maxSizeReached, this.stats.currentSize);
  }

  private updateHitRate(): void {
    const total = this.stats.totalCreated + this.stats.totalReused;
    this.stats.hitRate = total > 0 ? this.stats.totalReused / total : 0;
  }

  getStats(): PoolStats {
    return { ...this.stats };
  }

  clear(): void {
    this.pool = [];
    this.stats.currentSize = 0;
  }

  resize(newSize: number): void {
    if (newSize < this.pool.length) {
      this.pool = this.pool.slice(0, newSize);
    } else {
      const needed = newSize - this.pool.length;
      for (let i = 0; i < needed; i++) {
        this.pool.push(this.createFn());
        this.stats.totalCreated++;
      }
    }
    this.stats.currentSize = this.pool.length;
  }
}

// Component-specific object pools
export class ComponentPool {
  private componentPool: ObjectPool<Component>;
  private connectionPool: ObjectPool<Connection>;

  constructor() {
    this.componentPool = new ObjectPool<Component>(
      () => this.createEmptyComponent(),
      (component) => this.resetComponent(component),
      { initialSize: 50, maxSize: 1000 }
    );

    this.connectionPool = new ObjectPool<Connection>(
      () => this.createEmptyConnection(),
      (connection) => this.resetConnection(connection),
      { initialSize: 100, maxSize: 2000 }
    );
  }

  private createEmptyComponent(): Component {
    return {
      id: '',
      type: 'resistor',
      position: { x: 0, y: 0 },
      terminals: [],
      properties: {}
    };
  }

  private resetComponent(component: Component): void {
    component.id = '';
    component.type = 'resistor';
    component.position = { x: 0, y: 0 };
    component.terminals = [];
    component.properties = {};
  }

  private createEmptyConnection(): Connection {
    return {
      id: '',
      fromComponentId: '',
      toComponentId: '',
      fromTerminal: 0,
      toTerminal: 0
    };
  }

  private resetConnection(connection: Connection): void {
    connection.id = '';
    connection.fromComponentId = '';
    connection.toComponentId = '';
    connection.fromTerminal = 0;
    connection.toTerminal = 0;
  }

  acquireComponent(): Component {
    return this.componentPool.acquire();
  }

  releaseComponent(component: Component): void {
    this.componentPool.release(component);
  }

  acquireConnection(): Connection {
    return this.connectionPool.acquire();
  }

  releaseConnection(connection: Connection): void {
    this.connectionPool.release(connection);
  }

  getStats() {
    return {
      components: this.componentPool.getStats(),
      connections: this.connectionPool.getStats()
    };
  }

  clear(): void {
    this.componentPool.clear();
    this.connectionPool.clear();
  }
}

// Memory leak detection utility
export class MemoryLeakDetector {
  private objectCounts: Map<string, number> = new Map();
  private objectReferences: Map<string, WeakSet<object>> = new Map();
  private checkInterval: number | null = null;
  private isEnabled: boolean = false;

  enable(intervalMs: number = 5000): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    this.checkInterval = window.setInterval(() => {
      this.checkForLeaks();
    }, intervalMs);
  }

  disable(): void {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  trackObject(type: string, obj: object): void {
    if (!this.objectCounts.has(type)) {
      this.objectCounts.set(type, 0);
      this.objectReferences.set(type, new WeakSet());
    }
    
    this.objectCounts.set(type, this.objectCounts.get(type)! + 1);
    this.objectReferences.get(type)!.add(obj);
  }

  untrackObject(type: string, obj: object): void {
    if (this.objectReferences.has(type)) {
      this.objectReferences.get(type)!.delete(obj);
      const currentCount = this.objectCounts.get(type) || 0;
      this.objectCounts.set(type, Math.max(0, currentCount - 1));
    }
  }

  private checkForLeaks(): void {
    console.log('Memory Leak Detection Report:');
    console.log('============================');
    
    this.objectCounts.forEach((count, type) => {
      const references = this.objectReferences.get(type);
      const actualCount = references ? references.size : 0;
      
      if (count !== actualCount) {
        console.warn(`Potential memory leak detected in ${type}:`);
        console.warn(`  Expected: ${count}, Actual: ${actualCount}`);
      } else {
        console.log(`${type}: ${count} objects (OK)`);
      }
    });
    
    // Check for overall memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory Usage:');
      console.log(`  Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  getReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    this.objectCounts.forEach((count, type) => {
      const references = this.objectReferences.get(type);
      const actualCount = references ? references.size : 0;
      
      report[type] = {
        expected: count,
        actual: actualCount,
        potentialLeak: count !== actualCount
      };
    });
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      report.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    
    return report;
  }
}

// Large circuit handling optimization
export class LargeCircuitManager {
  private maxComponents: number = 1000;
  private maxConnections: number = 2000;
  private chunkSize: number = 100;
  private processingQueue: (() => void)[] = [];
  private isProcessing: boolean = false;

  constructor(maxComponents: number = 1000, maxConnections: number = 2000) {
    this.maxComponents = maxComponents;
    this.maxConnections = maxConnections;
  }

  canAddComponent(currentCount: number): boolean {
    return currentCount < this.maxComponents;
  }

  canAddConnection(currentCount: number): boolean {
    return currentCount < this.maxConnections;
  }

  processInChunks<T>(
    items: T[],
    processor: (chunk: T[]) => void,
    onComplete?: () => void
  ): void {
    const chunks = this.createChunks(items, this.chunkSize);
    let currentChunkIndex = 0;

    const processNextChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        this.isProcessing = false;
        onComplete?.();
        return;
      }

      const chunk = chunks[currentChunkIndex];
      processor(chunk);
      currentChunkIndex++;

      // Use requestAnimationFrame for non-blocking processing
      requestAnimationFrame(processNextChunk);
    };

    this.isProcessing = true;
    processNextChunk();
  }

  private createChunks<T>(items: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  }

  queueOperation(operation: () => void): void {
    this.processingQueue.push(operation);
    this.processQueue();
  }

  private processQueue(): void {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const operation = this.processingQueue.shift()!;
    
    operation();
    
    // Process next operation in next frame
    requestAnimationFrame(() => {
      this.isProcessing = false;
      this.processQueue();
    });
  }

  getStats(): Record<string, any> {
    return {
      maxComponents: this.maxComponents,
      maxConnections: this.maxConnections,
      chunkSize: this.chunkSize,
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Global instances
export const componentPool = new ComponentPool();
export const memoryLeakDetector = new MemoryLeakDetector();
export const largeCircuitManager = new LargeCircuitManager();

// Memory monitoring utility
export class MemoryMonitor {
  private monitoringInterval: number | null = null;
  private isMonitoring: boolean = false;
  private memoryHistory: Array<{ timestamp: number; used: number; total: number }> = [];
  private maxHistorySize: number = 100;

  startMonitoring(intervalMs: number = 10000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = window.setInterval(() => {
      this.recordMemoryUsage();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private recordMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const record = {
        timestamp: Date.now(),
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize
      };
      
      this.memoryHistory.push(record);
      
      // Keep only recent history
      if (this.memoryHistory.length > this.maxHistorySize) {
        this.memoryHistory.shift();
      }
    }
  }

  getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryHistory.length < 10) return 'stable';
    
    const recent = this.memoryHistory.slice(-10);
    const first = recent[0].used;
    const last = recent[recent.length - 1].used;
    const change = (last - first) / first;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  getMemoryReport(): Record<string, any> {
    if (this.memoryHistory.length === 0) {
      return { error: 'No memory data available' };
    }
    
    const latest = this.memoryHistory[this.memoryHistory.length - 1];
    const trend = this.getMemoryTrend();
    
    return {
      current: {
        used: latest.used,
        total: latest.total,
        usedMB: (latest.used / 1024 / 1024).toFixed(2),
        totalMB: (latest.total / 1024 / 1024).toFixed(2)
      },
      trend,
      historySize: this.memoryHistory.length
    };
  }
}

export const memoryMonitor = new MemoryMonitor();
