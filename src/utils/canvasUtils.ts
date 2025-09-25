import { Vector2D } from '../types/physics';

/**
 * Convert physics coordinates to screen coordinates
 */
export const physicsToScreen = (
  physicsPos: Vector2D,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = 30
): Vector2D => ({
  x: canvasWidth / 2 + physicsPos.x * scale,
  y: canvasHeight / 2 - physicsPos.y * scale
});

/**
 * Convert screen coordinates to physics coordinates
 */
export const screenToPhysics = (
  screenPos: Vector2D,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = 30
): Vector2D => ({
  x: (screenPos.x - canvasWidth / 2) / scale,
  y: (canvasHeight / 2 - screenPos.y) / scale
});

/**
 * Calculate distance between two points
 */
export const calculateDistance = (point1: Vector2D, point2: Vector2D): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate angle between two points
 */
export const calculateAngle = (point1: Vector2D, point2: Vector2D): number => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Format number for display
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

/**
 * Generate a color based on an index
 */
export const getColorByIndex = (index: number): string => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  return colors[index % colors.length];
};

/**
 * Check if a point is within canvas bounds
 */
export const isWithinBounds = (
  point: Vector2D,
  canvasWidth: number,
  canvasHeight: number,
  margin: number = 0
): boolean => {
  return (
    point.x >= margin &&
    point.x <= canvasWidth - margin &&
    point.y >= margin &&
    point.y <= canvasHeight - margin
  );
};
