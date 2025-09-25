/**
 * Advanced Animation System
 * Provides smooth animations and transitions for physics simulations
 */

export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
  delay?: number;
  repeat?: boolean;
  reverse?: boolean;
}

export interface AnimatedValue {
  start: number;
  end: number;
  current: number;
  config: AnimationConfig;
  startTime: number;
  isActive: boolean;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

export class AnimationSystem {
  private animations: Map<string, AnimatedValue> = new Map();
  private animationId: number | null = null;
  private isRunning = false;

  constructor() {
    this.start();
  }

  animate(
    key: string,
    start: number,
    end: number,
    config: AnimationConfig,
    onUpdate?: (value: number) => void,
    onComplete?: () => void
  ): void {
    const animation: AnimatedValue = {
      start,
      end,
      current: start,
      config: {
        ...config,
        delay: config.delay || 0
      },
      startTime: Date.now() + (config.delay || 0),
      isActive: true,
      onUpdate,
      onComplete
    };

    this.animations.set(key, animation);
  }

  stop(key: string): void {
    const animation = this.animations.get(key);
    if (animation) {
      animation.isActive = false;
      this.animations.delete(key);
    }
  }

  stopAll(): void {
    this.animations.clear();
  }

  getValue(key: string): number | null {
    const animation = this.animations.get(key);
    return animation ? animation.current : null;
  }

  isAnimating(key: string): boolean {
    const animation = this.animations.get(key);
    return animation ? animation.isActive : false;
  }

  private start(): void {
    this.isRunning = true;
    this.tick();
  }

  private tick(): void {
    if (!this.isRunning) return;

    const now = Date.now();
    const animationsToRemove: string[] = [];

    for (const [key, animation] of this.animations) {
      if (!animation.isActive) {
        animationsToRemove.push(key);
        continue;
      }

      if (now < animation.startTime) {
        continue; // Animation hasn't started yet
      }

      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.config.duration, 1);

      // Apply easing
      const easedProgress = this.applyEasing(progress, animation.config.easing);
      
      // Calculate current value
      animation.current = animation.start + (animation.end - animation.start) * easedProgress;

      // Call update callback
      if (animation.onUpdate) {
        animation.onUpdate(animation.current);
      }

      // Check if animation is complete
      if (progress >= 1) {
        if (animation.config.repeat) {
          // Restart animation
          animation.startTime = now;
          if (animation.config.reverse) {
            [animation.start, animation.end] = [animation.end, animation.start];
          }
        } else {
          // Animation complete
          animation.isActive = false;
          animationsToRemove.push(key);
          
          if (animation.onComplete) {
            animation.onComplete();
          }
        }
      }
    }

    // Remove completed animations
    for (const key of animationsToRemove) {
      this.animations.delete(key);
    }

    this.animationId = requestAnimationFrame(() => this.tick());
  }

  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return 1 - (1 - t) * (1 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
      case 'bounce':
        return this.bounce(t);
      case 'elastic':
        return this.elastic(t);
      default:
        return t;
    }
  }

  private bounce(t: number): number {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }

  private elastic(t: number): number {
    if (t === 0) return 0;
    if (t === 1) return 1;
    
    const p = 0.3;
    const s = p / 4;
    
    return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
  }

  destroy(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.animations.clear();
  }
}

// Global animation system instance
export const globalAnimationSystem = new AnimationSystem();

// Utility functions for common animations
export const animateValue = (
  key: string,
  start: number,
  end: number,
  duration: number = 1000,
  easing: AnimationConfig['easing'] = 'easeInOut',
  onUpdate?: (value: number) => void,
  onComplete?: () => void
): void => {
  globalAnimationSystem.animate(
    key,
    start,
    end,
    { duration, easing },
    onUpdate,
    onComplete
  );
};

export const animatePulse = (
  key: string,
  value: number,
  amplitude: number = 0.1,
  duration: number = 2000,
  onUpdate?: (value: number) => void
): void => {
  globalAnimationSystem.animate(
    key,
    value - amplitude,
    value + amplitude,
    {
      duration: duration / 2,
      easing: 'easeInOut',
      repeat: true,
      reverse: true
    },
    onUpdate
  );
};

export const animateRotation = (
  key: string,
  startAngle: number = 0,
  endAngle: number = 360,
  duration: number = 2000,
  onUpdate?: (angle: number) => void
): void => {
  globalAnimationSystem.animate(
    key,
    startAngle,
    endAngle,
    {
      duration,
      easing: 'linear',
      repeat: true
    },
    onUpdate
  );
};

export const animateWave = (
  key: string,
  amplitude: number = 1,
  frequency: number = 1,
  duration: number = 2000,
  onUpdate?: (value: number) => void
): void => {
  let startTime = Date.now();
  
  const updateWave = () => {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed % duration) / duration;
    const value = amplitude * Math.sin(2 * Math.PI * frequency * progress);
    
    if (onUpdate) {
      onUpdate(value);
    }
    
    requestAnimationFrame(updateWave);
  };
  
  updateWave();
};

// Animation presets for common physics scenarios
export const AnimationPresets = {
  smoothTransition: {
    duration: 500,
    easing: 'easeInOut' as const
  },
  
  quickSnap: {
    duration: 200,
    easing: 'easeOut' as const
  },
  
  gentleBounce: {
    duration: 800,
    easing: 'bounce' as const
  },
  
  elasticSpring: {
    duration: 1000,
    easing: 'elastic' as const
  },
  
  continuousRotation: {
    duration: 3000,
    easing: 'linear' as const,
    repeat: true
  },
  
  breathingEffect: {
    duration: 2000,
    easing: 'easeInOut' as const,
    repeat: true,
    reverse: true
  }
} as const;
