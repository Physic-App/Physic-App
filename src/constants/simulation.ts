// Physics constants
export const PHYSICS_CONSTANTS = {
  GRAVITY: {
    EARTH: 9.81,
    MOON: 1.62,
    MARS: 3.71,
    SPACE: 0
  },
  TIME_STEP: 0.016, // 60 FPS
  MAX_VELOCITY: 100,
  MIN_VELOCITY: 0.01,
  STATIC_FRICTION_THRESHOLD: 0.1,
  RESTITUTION_DEFAULT: 0.8,
  DAMPING_FACTOR: 0.98
} as const;

// Canvas constants
export const CANVAS_CONFIG = {
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 400,
  BACKGROUND_COLOR: '#0f172a',
  GRID_COLOR: '#1e293b',
  GRID_SIZE: 40,
  AXIS_COLOR: '#475569',
  SCALE_FACTOR: 30
} as const;

// UI constants
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#10b981',
    DANGER: '#ef4444',
    WARNING: '#f59e0b',
    SUCCESS: '#10b981',
    INFO: '#06b6d4'
  },
  ANIMATION_DURATION: 200,
  TRAJECTORY_MAX_POINTS: 500,
  DEBOUNCE_DELAY: 100
} as const;

// Material properties
export const MATERIALS = {
  WOOD: { density: 600, friction: 0.4, color: '#8B4513' },
  METAL: { density: 7850, friction: 0.2, color: '#C0C0C0' },
  RUBBER: { density: 1200, friction: 0.8, color: '#000000' },
  ICE: { density: 917, friction: 0.1, color: '#E0F6FF' }
} as const;

// Environment settings
export const ENVIRONMENTS = {
  EARTH: { gravity: 9.81, atmosphere: true, name: 'Earth' },
  MOON: { gravity: 1.62, atmosphere: false, name: 'Moon' },
  MARS: { gravity: 3.71, atmosphere: true, name: 'Mars' },
  SPACE: { gravity: 0, atmosphere: false, name: 'Space' }
} as const;
