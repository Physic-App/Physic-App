import { Component } from '../types/circuit';

interface AnimationFrame {
  id: number;
  callback: (timestamp: number) => void;
  priority: number;
  isActive: boolean;
}

interface AnimationSettings {
  quality: 'low' | 'medium' | 'high';
  maxFPS: number;
  enableFrameSkipping: boolean;
  enableAdaptiveQuality: boolean;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  averageFrameTime: number;
}

export class AnimationManager {
  private animations: Map<number, AnimationFrame> = new Map();
  private nextId: number = 1;
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private performanceMetrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    droppedFrames: 0,
    averageFrameTime: 0
  };
  
  private settings: AnimationSettings = {
    quality: 'high',
    maxFPS: 60,
    enableFrameSkipping: true,
    enableAdaptiveQuality: true
  };

  private frameTimeHistory: number[] = [];
  private adaptiveQualityThreshold: number = 16.67; // 60 FPS in milliseconds

  /**
   * Add an animation callback
   */
  addAnimation(
    callback: (timestamp: number) => void,
    priority: number = 0
  ): number {
    const id = this.nextId++;
    this.animations.set(id, {
      id,
      callback,
      priority,
      isActive: true
    });

    if (!this.isRunning) {
      this.start();
    }

    return id;
  }

  /**
   * Remove an animation
   */
  removeAnimation(id: number): void {
    this.animations.delete(id);
    
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  /**
   * Start the animation loop
   */
  private start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.frameTimeHistory = [];
    
    this.animate();
  }

  /**
   * Stop the animation loop
   */
  private stop(): void {
    this.isRunning = false;
  }

  /**
   * Main animation loop
   */
  private animate = (timestamp: number = performance.now()): void => {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastFrameTime;
    const targetFrameTime = 1000 / this.settings.maxFPS;
    
    // Frame skipping for performance
    if (this.settings.enableFrameSkipping && deltaTime < targetFrameTime) {
      requestAnimationFrame(this.animate);
      return;
    }

    // Update performance metrics
    this.updatePerformanceMetrics(deltaTime);
    
    // Adaptive quality adjustment
    if (this.settings.enableAdaptiveQuality) {
      this.adjustQualityBasedOnPerformance();
    }

    // Execute animations in priority order
    this.executeAnimations(timestamp);

    this.lastFrameTime = timestamp;
    this.frameCount++;

    // Continue animation loop
    requestAnimationFrame(this.animate);
  };

  /**
   * Execute all active animations
   */
  private executeAnimations(timestamp: number): void {
    const activeAnimations = Array.from(this.animations.values())
      .filter(anim => anim.isActive)
      .sort((a, b) => b.priority - a.priority);

    activeAnimations.forEach(animation => {
      try {
        animation.callback(timestamp);
      } catch (error) {
        console.error('Animation error:', error);
        this.removeAnimation(animation.id);
      }
    });
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(deltaTime: number): void {
    this.frameTimeHistory.push(deltaTime);
    
    // Keep only last 60 frames for average calculation
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    this.performanceMetrics.frameTime = deltaTime;
    this.performanceMetrics.averageFrameTime = 
      this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;
    
    // Calculate FPS
    if (this.frameCount % 60 === 0) {
      this.performanceMetrics.fps = 1000 / this.performanceMetrics.averageFrameTime;
    }

    // Count dropped frames
    if (deltaTime > this.adaptiveQualityThreshold * 1.5) {
      this.performanceMetrics.droppedFrames++;
    }
  }

  /**
   * Adjust quality based on performance
   */
  private adjustQualityBasedOnPerformance(): void {
    const avgFrameTime = this.performanceMetrics.averageFrameTime;
    
    if (avgFrameTime > 20) { // Less than 50 FPS
      if (this.settings.quality !== 'low') {
        this.settings.quality = 'low';
        this.settings.maxFPS = 30;
        console.log('Animation quality reduced to low due to performance');
      }
    } else if (avgFrameTime > 16.67) { // Less than 60 FPS
      if (this.settings.quality !== 'medium') {
        this.settings.quality = 'medium';
        this.settings.maxFPS = 45;
        console.log('Animation quality reduced to medium due to performance');
      }
    } else if (avgFrameTime < 12) { // More than 80 FPS
      if (this.settings.quality !== 'high') {
        this.settings.quality = 'high';
        this.settings.maxFPS = 60;
        console.log('Animation quality increased to high');
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update animation settings
   */
  updateSettings(newSettings: Partial<AnimationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  getSettings(): AnimationSettings {
    return { ...this.settings };
  }

  /**
   * Pause all animations
   */
  pause(): void {
    this.animations.forEach(animation => {
      animation.isActive = false;
    });
  }

  /**
   * Resume all animations
   */
  resume(): void {
    this.animations.forEach(animation => {
      animation.isActive = true;
    });
  }

  /**
   * Clear all animations
   */
  clear(): void {
    this.animations.clear();
    this.stop();
  }
}

// Global animation manager instance
export const animationManager = new AnimationManager();

// Specialized animation functions for circuit components
export class CircuitAnimations {
  private animationManager: AnimationManager;

  constructor(animationManager: AnimationManager) {
    this.animationManager = animationManager;
  }

  /**
   * Animate current flow through components
   */
  animateCurrentFlow(
    components: Component[],
    onUpdate: (animatedComponents: Component[]) => void,
    duration: number = 2000
  ): number {
    const startTime = performance.now();
    
    return this.animationManager.addAnimation((timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Create animated components with current flow visualization
      const animatedComponents = components.map(component => {
        const current = component.properties.current || 0;
        const intensity = Math.abs(current) * 0.1; // Scale for visualization
        const phase = (elapsed / 100) % (Math.PI * 2); // Animation phase
        const brightness = 0.5 + 0.5 * Math.sin(phase + component.position.x * 0.01);
        
        return {
          ...component,
          properties: {
            ...component.properties,
            brightness: Math.min(brightness * intensity, 1)
          }
        };
      });
      
      onUpdate(animatedComponents);
      
      // Remove animation when complete
      if (progress >= 1) {
        this.animationManager.removeAnimation(this.animationManager.addAnimation(() => {}));
      }
    }, 1);
  }

  /**
   * Animate component selection
   */
  animateSelection(
    componentId: string,
    onUpdate: (componentId: string, scale: number, glow: number) => void,
    duration: number = 300
  ): number {
    const startTime = performance.now();
    
    return this.animationManager.addAnimation((timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const scale = 1 + 0.1 * Math.sin(progress * Math.PI);
      const glow = easeOut;
      
      onUpdate(componentId, scale, glow);
      
      if (progress >= 1) {
        this.animationManager.removeAnimation(this.animationManager.addAnimation(() => {}));
      }
    }, 2);
  }

  /**
   * Animate component rotation
   */
  animateRotation(
    componentId: string,
    fromRotation: number,
    toRotation: number,
    onUpdate: (componentId: string, rotation: number) => void,
    duration: number = 500
  ): number {
    const startTime = performance.now();
    const rotationDiff = toRotation - fromRotation;
    
    return this.animationManager.addAnimation((timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeInOut = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentRotation = fromRotation + (rotationDiff * easeInOut);
      
      onUpdate(componentId, currentRotation);
      
      if (progress >= 1) {
        this.animationManager.removeAnimation(this.animationManager.addAnimation(() => {}));
      }
    }, 1);
  }

  /**
   * Animate component movement
   */
  animateMovement(
    componentId: string,
    fromPosition: { x: number; y: number },
    toPosition: { x: number; y: number },
    onUpdate: (componentId: string, position: { x: number; y: number }) => void,
    duration: number = 400
  ): number {
    const startTime = performance.now();
    const deltaX = toPosition.x - fromPosition.x;
    const deltaY = toPosition.y - fromPosition.y;
    
    return this.animationManager.addAnimation((timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentPosition = {
        x: fromPosition.x + (deltaX * easeOut),
        y: fromPosition.y + (deltaY * easeOut)
      };
      
      onUpdate(componentId, currentPosition);
      
      if (progress >= 1) {
        this.animationManager.removeAnimation(this.animationManager.addAnimation(() => {}));
      }
    }, 1);
  }

  /**
   * Animate circuit simulation start/stop
   */
  animateSimulationToggle(
    isStarting: boolean,
    onUpdate: (progress: number, isStarting: boolean) => void,
    duration: number = 600
  ): number {
    const startTime = performance.now();
    
    return this.animationManager.addAnimation((timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Different easing for start vs stop
      const ease = isStarting 
        ? 1 - Math.pow(1 - progress, 2) // Ease out for start
        : Math.pow(progress, 2); // Ease in for stop
      
      onUpdate(ease, isStarting);
      
      if (progress >= 1) {
        this.animationManager.removeAnimation(this.animationManager.addAnimation(() => {}));
      }
    }, 3);
  }

  /**
   * Animate error state
   */
  animateError(
    componentId: string,
    onUpdate: (componentId: string, shakeIntensity: number) => void,
    duration: number = 800
  ): number {
    const startTime = performance.now();
    
    return this.animationManager.addAnimation((timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Shake animation
      const shakeIntensity = Math.sin(progress * Math.PI * 8) * (1 - progress) * 5;
      
      onUpdate(componentId, shakeIntensity);
      
      if (progress >= 1) {
        this.animationManager.removeAnimation(this.animationManager.addAnimation(() => {}));
      }
    }, 4);
  }
}

// Global circuit animations instance
export const circuitAnimations = new CircuitAnimations(animationManager);
