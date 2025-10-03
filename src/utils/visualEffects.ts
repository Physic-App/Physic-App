// Visual effects and animation utilities

export interface AnimationConfig {
  duration: number; // milliseconds
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

export class AnimationManager {
  private static animations = new Map<string, AnimationConfig & { startTime: number; id: number }>();

  static animate(key: string, config: AnimationConfig): void {
    // Cancel existing animation with same key
    this.cancel(key);

    const startTime = performance.now();
    const animation = {
      ...config,
      startTime,
      id: 0
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / config.duration, 1);
      
      const easedProgress = this.applyEasing(progress, config.easing);
      
      config.onUpdate(easedProgress);
      
      if (progress < 1) {
        animation.id = requestAnimationFrame(animate);
        this.animations.set(key, animation);
      } else {
        config.onComplete?.();
        this.animations.delete(key);
      }
    };

    animation.id = requestAnimationFrame(animate);
    this.animations.set(key, animation);
  }

  static cancel(key: string): void {
    const animation = this.animations.get(key);
    if (animation) {
      cancelAnimationFrame(animation.id);
      this.animations.delete(key);
    }
  }

  static cancelAll(): void {
    this.animations.forEach(animation => {
      cancelAnimationFrame(animation.id);
    });
    this.animations.clear();
  }

  private static applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case 'linear':
        return progress;
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - Math.pow(1 - progress, 2);
      case 'easeInOut':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      default:
        return progress;
    }
  }
}

export class RayAnimation {
  static animateRay(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    duration: number = 1000
  ): Promise<void> {
    return new Promise((resolve) => {
      const totalLength = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
      
      AnimationManager.animate('ray', {
        duration,
        easing: 'easeOut',
        onUpdate: (progress) => {
          const currentLength = totalLength * progress;
          const angle = Math.atan2(toY - fromY, toX - fromX);
          const currentX = fromX + currentLength * Math.cos(angle);
          const currentY = fromY + currentLength * Math.sin(angle);
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
        },
        onComplete: resolve
      });
    });
  }

  static animateMultipleRays(
    ctx: CanvasRenderingContext2D,
    rays: Array<{
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      color: string;
      delay?: number;
    }>,
    duration: number = 1000
  ): Promise<void> {
    const promises = rays.map((ray, index) => {
      const delay = ray.delay || index * 100;
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.animateRay(ctx, ray.fromX, ray.fromY, ray.toX, ray.toY, ray.color, duration)
            .then(resolve);
        }, delay);
      });
    });

    return Promise.all(promises).then(() => {});
  }
}

export class ParticleSystem {
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
  }> = [];

  addParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number = 2,
    life: number = 1000
  ): void {
    this.particles.push({
      x,
      y,
      vx,
      vy,
      life: life,
      maxLife: life,
      color,
      size
    });
  }

  update(deltaTime: number): void {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life -= deltaTime;
      
      return particle.life > 0;
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
  }

  clear(): void {
    this.particles = [];
  }
}

export class VisualEffects {
  static createGlowEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    intensity: number = 0.5
  ): void {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, `${color}00`);
    
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  static createPulseAnimation(
    element: HTMLElement,
    duration: number = 1000,
    scale: number = 1.1
  ): void {
    AnimationManager.animate('pulse', {
      duration,
      easing: 'easeInOut',
      onUpdate: (progress) => {
        const currentScale = 1 + (scale - 1) * Math.sin(progress * Math.PI);
        element.style.transform = `scale(${currentScale})`;
      },
      onComplete: () => {
        element.style.transform = 'scale(1)';
      }
    });
  }

  static createShimmerEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    progress: number
  ): void {
    const shimmerWidth = width * 0.3;
    const shimmerX = x + (progress * (width + shimmerWidth)) - shimmerWidth;
    
    const gradient = ctx.createLinearGradient(shimmerX, y, shimmerX + shimmerWidth, y);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }
}

export class InteractiveEffects {
  static createHoverGlow(
    element: HTMLElement,
    color: string = '#3B82F6'
  ): void {
    element.addEventListener('mouseenter', () => {
      element.style.boxShadow = `0 0 20px ${color}40`;
      element.style.transition = 'box-shadow 0.3s ease';
    });

    element.addEventListener('mouseleave', () => {
      element.style.boxShadow = '';
    });
  }

  static createClickRipple(
    event: MouseEvent,
    color: string = '#3B82F6'
  ): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${color}40;
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;

    // Add CSS animation if not already present
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}
