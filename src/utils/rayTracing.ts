/**
 * Advanced Ray Tracing Utilities
 * Provides sophisticated ray tracing algorithms for realistic light simulation
 */

import { degToRad, radToDeg } from './physicsConstants';

export interface Ray {
  x: number;
  y: number;
  angle: number;
  wavelength: number;
  intensity: number;
  color: string;
}

export interface OpticalElement {
  type: 'mirror' | 'lens' | 'prism' | 'slit' | 'polarizer';
  x: number;
  y: number;
  properties: any;
}

export class RayTracer {
  private rays: Ray[] = [];
  private elements: OpticalElement[] = [];

  constructor() {
    this.rays = [];
    this.elements = [];
  }

  addRay(ray: Ray): void {
    this.rays.push(ray);
  }

  addElement(element: OpticalElement): void {
    this.elements.push(element);
  }

  traceRay(ray: Ray, maxBounces: number = 5): Ray[] {
    const tracedRays: Ray[] = [ray];
    let currentRay = { ...ray };
    let bounces = 0;

    while (bounces < maxBounces) {
      const intersection = this.findNearestIntersection(currentRay);
      
      if (!intersection) {
        break;
      }

      const newRays = this.calculateInteraction(currentRay, intersection.element, intersection.point);
      
      if (newRays.length === 0) {
        break;
      }

      // Follow the primary ray (usually the first one)
      currentRay = newRays[0];
      tracedRays.push(currentRay);
      
      // Add secondary rays (reflections, refractions)
      tracedRays.push(...newRays.slice(1));

      bounces++;
    }

    return tracedRays;
  }

  private findNearestIntersection(ray: Ray): { element: OpticalElement; point: { x: number; y: number } } | null {
    let nearestIntersection: { element: OpticalElement; point: { x: number; y: number } } | null = null;
    let nearestDistance = Infinity;

    for (const element of this.elements) {
      const intersection = this.calculateIntersection(ray, element);
      
      if (intersection) {
        const distance = Math.sqrt(
          Math.pow(intersection.x - ray.x, 2) + Math.pow(intersection.y - ray.y, 2)
        );
        
        if (distance < nearestDistance && distance > 0.1) { // Avoid self-intersection
          nearestDistance = distance;
          nearestIntersection = { element, point: intersection };
        }
      }
    }

    return nearestIntersection;
  }

  private calculateIntersection(ray: Ray, element: OpticalElement): { x: number; y: number } | null {
    switch (element.type) {
      case 'mirror':
        return this.intersectWithMirror(ray, element);
      case 'lens':
        return this.intersectWithLens(ray, element);
      case 'prism':
        return this.intersectWithPrism(ray, element);
      default:
        return null;
    }
  }

  private intersectWithMirror(ray: Ray, mirror: OpticalElement): { x: number; y: number } | null {
    // Simple vertical mirror intersection
    const mirrorX = mirror.x;
    const rayAngle = degToRad(ray.angle);
    
    // Ray equation: y = y0 + tan(angle) * (x - x0)
    const rayY = ray.y + Math.tan(rayAngle) * (mirrorX - ray.x);
    
    // Check if ray intersects with mirror bounds
    const mirrorHeight = mirror.properties.height || 100;
    const mirrorTop = mirror.y - mirrorHeight / 2;
    const mirrorBottom = mirror.y + mirrorHeight / 2;
    
    if (rayY >= mirrorTop && rayY <= mirrorBottom) {
      return { x: mirrorX, y: rayY };
    }
    
    return null;
  }

  private intersectWithLens(ray: Ray, lens: OpticalElement): { x: number; y: number } | null {
    // Simple lens intersection (circular boundary)
    const lensX = lens.x;
    const lensY = lens.y;
    const lensRadius = lens.properties.radius || 50;
    
    const rayAngle = degToRad(ray.angle);
    
    // Ray equation: y = y0 + tan(angle) * (x - x0)
    // Circle equation: (x - lensX)² + (y - lensY)² = radius²
    
    // Solve for intersection
    const dx = lensX - ray.x;
    const dy = lensY - ray.y;
    const tanAngle = Math.tan(rayAngle);
    
    // Quadratic equation: a*t² + b*t + c = 0
    const a = 1 + tanAngle * tanAngle;
    const b = 2 * (dx + tanAngle * dy);
    const c = dx * dx + dy * dy - lensRadius * lensRadius;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
      return null;
    }
    
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    // Choose the intersection point in the direction of the ray
    const t = ray.angle > 90 && ray.angle < 270 ? Math.min(t1, t2) : Math.max(t1, t2);
    
    if (t > 0) {
      const x = ray.x + t;
      const y = ray.y + t * tanAngle;
      
      // Check if intersection is on the lens boundary
      const distanceFromCenter = Math.sqrt((x - lensX) * (x - lensX) + (y - lensY) * (y - lensY));
      
      if (Math.abs(distanceFromCenter - lensRadius) < 1) {
        return { x, y };
      }
    }
    
    return null;
  }

  private intersectWithPrism(ray: Ray, prism: OpticalElement): { x: number; y: number } | null {
    // Triangle prism intersection
    const prismX = prism.x;
    const prismY = prism.y;
    const prismSize = prism.properties.size || 60;
    const prismAngle = degToRad(prism.properties.angle || 60);
    
    // Define triangle vertices
    const topX = prismX;
    const topY = prismY - prismSize / 2;
    const leftX = prismX - prismSize * Math.cos(prismAngle / 2) / 2;
    const leftY = prismY + prismSize * Math.sin(prismAngle / 2) / 2;
    const rightX = prismX + prismSize * Math.cos(prismAngle / 2) / 2;
    const rightY = prismY + prismSize * Math.sin(prismAngle / 2) / 2;
    
    // Check intersection with each edge
    const edges = [
      { x1: topX, y1: topY, x2: leftX, y2: leftY },
      { x1: topX, y1: topY, x2: rightX, y2: rightY },
      { x1: leftX, y1: leftY, x2: rightX, y2: rightY }
    ];
    
    for (const edge of edges) {
      const intersection = this.lineIntersection(
        ray.x, ray.y, ray.x + Math.cos(degToRad(ray.angle)) * 1000, ray.y + Math.sin(degToRad(ray.angle)) * 1000,
        edge.x1, edge.y1, edge.x2, edge.y2
      );
      
      if (intersection) {
        return intersection;
      }
    }
    
    return null;
  }

  private lineIntersection(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ): { x: number; y: number } | null {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    if (Math.abs(denom) < 1e-10) {
      return null; // Lines are parallel
    }
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    
    return null;
  }

  private calculateInteraction(
    ray: Ray, 
    element: OpticalElement, 
    point: { x: number; y: number }
  ): Ray[] {
    switch (element.type) {
      case 'mirror':
        return this.calculateReflection(ray, element, point);
      case 'lens':
        return this.calculateRefraction(ray, element, point);
      case 'prism':
        return this.calculatePrismInteraction(ray, element, point);
      default:
        return [];
    }
  }

  private calculateReflection(ray: Ray, mirror: OpticalElement, point: { x: number; y: number }): Ray[] {
    // Calculate normal to mirror surface
    const normalAngle = mirror.properties.normalAngle || 0;
    const incidentAngle = ray.angle - normalAngle;
    
    // Law of reflection: angle of reflection = angle of incidence
    const reflectedAngle = normalAngle - incidentAngle;
    
    return [{
      x: point.x,
      y: point.y,
      angle: reflectedAngle,
      wavelength: ray.wavelength,
      intensity: ray.intensity * 0.95, // Slight intensity loss
      color: ray.color
    }];
  }

  private calculateRefraction(ray: Ray, lens: OpticalElement, point: { x: number; y: number }): Ray[] {
    const n1 = ray.properties?.refractiveIndex || 1.0;
    const n2 = lens.properties.refractiveIndex || 1.5;
    
    // Calculate refraction using Snell's law
    const incidentAngle = degToRad(ray.angle);
    const sinRefracted = (n1 * Math.sin(incidentAngle)) / n2;
    
    if (Math.abs(sinRefracted) > 1) {
      // Total internal reflection
      return this.calculateReflection(ray, lens, point);
    }
    
    const refractedAngle = radToDeg(Math.asin(sinRefracted));
    
    return [{
      x: point.x,
      y: point.y,
      angle: refractedAngle,
      wavelength: ray.wavelength,
      intensity: ray.intensity * 0.98, // Slight intensity loss
      color: ray.color
    }];
  }

  private calculatePrismInteraction(ray: Ray, prism: OpticalElement, point: { x: number; y: number }): Ray[] {
    // Simplified prism interaction - just refraction
    return this.calculateRefraction(ray, prism, point);
  }

  clear(): void {
    this.rays = [];
    this.elements = [];
  }

  getRays(): Ray[] {
    return this.rays;
  }

  getElements(): OpticalElement[] {
    return this.elements;
  }
}

// Utility functions for creating common optical elements
export const createMirror = (x: number, y: number, angle: number = 0): OpticalElement => ({
  type: 'mirror',
  x,
  y,
  properties: {
    angle,
    normalAngle: angle + 90,
    height: 100,
    reflectivity: 0.95
  }
});

export const createLens = (x: number, y: number, focalLength: number, refractiveIndex: number = 1.5): OpticalElement => ({
  type: 'lens',
  x,
  y,
  properties: {
    focalLength,
    refractiveIndex,
    radius: 50,
    thickness: 10
  }
});

export const createPrism = (x: number, y: number, angle: number = 60, refractiveIndex: number = 1.5): OpticalElement => ({
  type: 'prism',
  x,
  y,
  properties: {
    angle,
    refractiveIndex,
    size: 60
  }
});

export const createRay = (
  x: number, 
  y: number, 
  angle: number, 
  wavelength: number = 500, 
  intensity: number = 1.0
): Ray => ({
  x,
  y,
  angle,
  wavelength,
  intensity,
  color: `hsl(${wavelength * 0.7}, 100%, 50%)` // Convert wavelength to color
});
