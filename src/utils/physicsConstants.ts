/**
 * Physics Constants and Validation Utilities
 * Ensures accurate physics calculations and realistic parameter ranges
 */

// Physical constants
export const PHYSICS_CONSTANTS = {
  // Speed of light in vacuum (m/s)
  SPEED_OF_LIGHT: 2.998e8,
  
  // Common refractive indices at 589nm (sodium D-line)
  REFRACTIVE_INDICES: {
    VACUUM: 1.0,
    AIR: 1.0003,
    WATER: 1.333,
    GLASS_CROWN: 1.52,
    GLASS_FLINT: 1.66,
    DIAMOND: 2.42,
    CRYSTAL: 1.54,
    PLASTIC: 1.49
  },
  
  // Wavelength ranges (nm)
  WAVELENGTH_RANGES: {
    VISIBLE_MIN: 380,
    VISIBLE_MAX: 750,
    RED: 700,
    ORANGE: 620,
    YELLOW: 580,
    GREEN: 530,
    BLUE: 470,
    VIOLET: 400
  },
  
  // Physical limits
  LIMITS: {
    MAX_INCIDENT_ANGLE: 89.9, // degrees (avoid 90° edge cases)
    MIN_INCIDENT_ANGLE: 0,
    MAX_FOCAL_LENGTH: 1000, // cm
    MIN_FOCAL_LENGTH: 0.1,
    MAX_OBJECT_DISTANCE: 1000, // cm
    MIN_OBJECT_DISTANCE: 0.1,
    MAX_PRISM_ANGLE: 89,
    MIN_PRISM_ANGLE: 1,
    MAX_SLIT_WIDTH: 1000, // μm
    MIN_SLIT_WIDTH: 0.1,
    MAX_SLIT_SPACING: 10000, // μm
    MIN_SLIT_SPACING: 0.1
  }
} as const;

// Validation functions
export const validateRefractiveIndex = (n: number, name: string = 'refractive index'): string | null => {
  if (n <= 0) return `${name} must be positive`;
  if (n < 1) return `${name} cannot be less than 1 (vacuum)`;
  if (n > 10) return `${name} seems unrealistic (n > 10)`;
  return null;
};

export const validateAngle = (angle: number, name: string = 'angle'): string | null => {
  if (angle < 0) return `${name} must be non-negative`;
  if (angle >= 90) return `${name} must be less than 90°`;
  return null;
};

export const validateDistance = (distance: number, name: string = 'distance'): string | null => {
  if (distance <= 0) return `${name} must be positive`;
  if (distance > PHYSICS_CONSTANTS.LIMITS.MAX_OBJECT_DISTANCE) {
    return `${name} seems too large`;
  }
  return null;
};

export const validateFocalLength = (f: number): string | null => {
  if (f <= 0) return 'Focal length must be positive';
  if (f < PHYSICS_CONSTANTS.LIMITS.MIN_FOCAL_LENGTH) {
    return `Focal length too small (minimum: ${PHYSICS_CONSTANTS.LIMITS.MIN_FOCAL_LENGTH} cm)`;
  }
  if (f > PHYSICS_CONSTANTS.LIMITS.MAX_FOCAL_LENGTH) {
    return `Focal length too large (maximum: ${PHYSICS_CONSTANTS.LIMITS.MAX_FOCAL_LENGTH} cm)`;
  }
  return null;
};

export const validatePrismAngle = (angle: number): string | null => {
  if (angle <= 0) return 'Prism angle must be positive';
  if (angle < PHYSICS_CONSTANTS.LIMITS.MIN_PRISM_ANGLE) {
    return `Prism angle too small (minimum: ${PHYSICS_CONSTANTS.LIMITS.MIN_PRISM_ANGLE}°)`;
  }
  if (angle >= PHYSICS_CONSTANTS.LIMITS.MAX_PRISM_ANGLE) {
    return `Prism angle too large (maximum: ${PHYSICS_CONSTANTS.LIMITS.MAX_PRISM_ANGLE}°)`;
  }
  return null;
};

export const validateWavelength = (lambda: number): string | null => {
  if (lambda <= 0) return 'Wavelength must be positive';
  if (lambda < PHYSICS_CONSTANTS.WAVELENGTH_RANGES.VISIBLE_MIN) {
    return 'Wavelength below visible range';
  }
  if (lambda > PHYSICS_CONSTANTS.WAVELENGTH_RANGES.VISIBLE_MAX) {
    return 'Wavelength above visible range';
  }
  return null;
};

export const validateSlitWidth = (width: number): string | null => {
  if (width <= 0) return 'Slit width must be positive';
  if (width < PHYSICS_CONSTANTS.LIMITS.MIN_SLIT_WIDTH) {
    return `Slit width too small (minimum: ${PHYSICS_CONSTANTS.LIMITS.MIN_SLIT_WIDTH} μm)`;
  }
  if (width > PHYSICS_CONSTANTS.LIMITS.MAX_SLIT_WIDTH) {
    return `Slit width too large (maximum: ${PHYSICS_CONSTANTS.LIMITS.MAX_SLIT_WIDTH} μm)`;
  }
  return null;
};

export const validateSlitSpacing = (spacing: number): string | null => {
  if (spacing <= 0) return 'Slit spacing must be positive';
  if (spacing < PHYSICS_CONSTANTS.LIMITS.MIN_SLIT_SPACING) {
    return `Slit spacing too small (minimum: ${PHYSICS_CONSTANTS.LIMITS.MIN_SLIT_SPACING} μm)`;
  }
  if (spacing > PHYSICS_CONSTANTS.LIMITS.MAX_SLIT_SPACING) {
    return `Slit spacing too large (maximum: ${PHYSICS_CONSTANTS.LIMITS.MAX_SLIT_SPACING} μm)`;
  }
  return null;
};

// Physics calculation utilities
export const degToRad = (degrees: number): number => degrees * Math.PI / 180;
export const radToDeg = (radians: number): number => radians * 180 / Math.PI;

export const calculateCriticalAngle = (n1: number, n2: number): { angle: number | null; error: string | null } => {
  const n1Error = validateRefractiveIndex(n1, 'n₁');
  const n2Error = validateRefractiveIndex(n2, 'n₂');
  
  if (n1Error) return { angle: null, error: n1Error };
  if (n2Error) return { angle: null, error: n2Error };
  
  if (n1 <= n2) {
    return { angle: null, error: 'TIR not possible: n₁ ≤ n₂' };
  }
  
  const angle = Math.asin(n2 / n1);
  return { angle: radToDeg(angle), error: null };
};

export const calculateSnellsLaw = (n1: number, n2: number, incidentAngle: number): {
  refractedAngle: number | null;
  isTIR: boolean;
  error: string | null;
} => {
  const n1Error = validateRefractiveIndex(n1, 'n₁');
  const n2Error = validateRefractiveIndex(n2, 'n₂');
  const angleError = validateAngle(incidentAngle, 'incident angle');
  
  if (n1Error || n2Error || angleError) {
    return { refractedAngle: null, isTIR: false, error: n1Error || n2Error || angleError || 'Unknown error' };
  }
  
  const incidentRad = degToRad(incidentAngle);
  const sinRefracted = (n1 * Math.sin(incidentRad)) / n2;
  
  if (Math.abs(sinRefracted) > 1) {
    return { refractedAngle: null, isTIR: true, error: null };
  }
  
  const refractedAngle = Math.asin(sinRefracted);
  return { refractedAngle: radToDeg(refractedAngle), isTIR: false, error: null };
};

export const calculateThinLensFormula = (f: number, u: number): {
  imageDistance: number;
  magnification: number;
  error: string | null;
} => {
  const fError = validateFocalLength(f);
  const uError = validateDistance(u, 'object distance');
  
  if (fError || uError) {
    return { imageDistance: 0, magnification: 1, error: fError || uError || 'Unknown error' };
  }
  
  // Thin lens formula: 1/f = 1/v + 1/u
  // Solving for v: v = (f*u)/(u-f)
  const imageDistance = (f * u) / (u - f);
  const magnification = -imageDistance / u;
  
  return { imageDistance, magnification, error: null };
};

export const calculatePrismDeviation = (n: number, A: number, i1: number): {
  r1: number;
  r2: number;
  i2: number;
  deviation: number;
  error: string | null;
} => {
  const nError = validateRefractiveIndex(n, 'refractive index');
  const AError = validatePrismAngle(A);
  const i1Error = validateAngle(i1, 'incident angle');
  
  if (nError || AError || i1Error) {
    return { r1: 0, r2: 0, i2: 0, deviation: 0, error: nError || AError || i1Error || 'Unknown error' };
  }
  
  const i1Rad = degToRad(i1);
  const ARad = degToRad(A);
  
  // First refraction
  const sinR1 = Math.sin(i1Rad) / n;
  if (Math.abs(sinR1) > 1) {
    return { r1: 0, r2: 0, i2: 0, deviation: 0, error: 'Total internal reflection at first surface' };
  }
  
  const r1 = Math.asin(sinR1);
  const r2 = ARad - r1;
  
  if (r2 <= 0 || r2 >= ARad) {
    return { r1: radToDeg(r1), r2: radToDeg(r2), i2: 0, deviation: 0, error: 'Invalid internal angle' };
  }
  
  // Second refraction
  const sinI2 = n * Math.sin(r2);
  if (Math.abs(sinI2) > 1) {
    return { r1: radToDeg(r1), r2: radToDeg(r2), i2: 0, deviation: 0, error: 'Total internal reflection at exit' };
  }
  
  const i2 = Math.asin(sinI2);
  const deviation = i1 + radToDeg(i2) - A;
  
  return {
    r1: radToDeg(r1),
    r2: radToDeg(r2),
    i2: radToDeg(i2),
    deviation: Math.abs(deviation),
    error: null
  };
};

export const calculateMalusLaw = (I0: number, angle: number): number => {
  if (I0 <= 0) return 0;
  const angleRad = degToRad(angle);
  return I0 * Math.pow(Math.cos(angleRad), 2);
};

export const getWavelengthColor = (lambda: number): string => {
  if (lambda < 420) return '#8B00FF'; // Violet
  if (lambda < 450) return '#4B0082'; // Indigo
  if (lambda < 495) return '#0000FF'; // Blue
  if (lambda < 570) return '#00FF00'; // Green
  if (lambda < 590) return '#FFFF00'; // Yellow
  if (lambda < 620) return '#FFA500'; // Orange
  return '#FF0000'; // Red
};

export const getWavelengthName = (lambda: number): string => {
  if (lambda < 420) return 'Violet';
  if (lambda < 450) return 'Indigo';
  if (lambda < 495) return 'Blue';
  if (lambda < 570) return 'Green';
  if (lambda < 590) return 'Yellow';
  if (lambda < 620) return 'Orange';
  return 'Red';
};
