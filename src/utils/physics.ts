import { Vector2D, PhysicsObject, ForceVector } from '../types/physics';

export class PhysicsEngine {
  static readonly GRAVITY = {
    earth: 9.81,
    moon: 1.62,
    mars: 3.71,
    space: 0
  };
  static readonly TIME_STEP = 0.016; // ~60fps
  static readonly MAX_VELOCITY = 50; // m/s - prevent unrealistic speeds
  static readonly MIN_VELOCITY = 0.001; // m/s - minimum velocity threshold
  static readonly AIR_DENSITY = 1.225; // kg/m³ at sea level
  static readonly STATIC_FRICTION_THRESHOLD = 0.1; // m/s - velocity threshold for static vs kinetic friction
  static readonly RESTITUTION_DEFAULT = 0.8; // Default coefficient of restitution
  static readonly DAMPING_FACTOR = 0.99; // Air resistance and energy loss factor

  static getGravity(environment: 'earth' | 'moon' | 'mars' | 'space'): number {
    return this.GRAVITY[environment];
  }

  static addVectors(v1: Vector2D, v2: Vector2D): Vector2D {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }

  static scaleVector(vector: Vector2D, scale: number): Vector2D {
    return { x: vector.x * scale, y: vector.y * scale };
  }

  static magnitude(vector: Vector2D): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  static normalize(vector: Vector2D): Vector2D {
    const mag = this.magnitude(vector);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: vector.x / mag, y: vector.y / mag };
  }

  static calculateForces(
    mass: number,
    appliedForce: number,
    inclineAngle: number,
    frictionCoeff: number,
    surfaceType: 'smooth' | 'rough',
    environment: 'earth' | 'moon' | 'mars' | 'space' = 'earth',
    velocity: Vector2D = { x: 0, y: 0 },
    radius: number = 0.5,
    airResistance: boolean = false,
    showReactionForces: boolean = true
  ): ForceVector[] {
    const angleRad = (inclineAngle * Math.PI) / 180;
    const forces: ForceVector[] = [];
    const gravity = this.getGravity(environment);

    // Weight force (always downward)
    const weight: Vector2D = { x: 0, y: mass * gravity };
    const weightMagnitude = mass * gravity;
    forces.push({
      name: 'Weight (Action)',
      vector: weight,
      color: '#8B4513',
      visible: true,
      magnitude: weightMagnitude,
      angle: -90,
      description: `Gravitational force pulling the object downward (action: mg = ${mass} × ${gravity} = ${weightMagnitude.toFixed(1)} N)`
    });

    // Applied force (horizontal) - ACTION
    const applied: Vector2D = { x: appliedForce, y: 0 };
    forces.push({
      name: 'Applied Force (Action)',
      vector: applied,
      color: '#22C55E',
      visible: true,
      magnitude: Math.abs(appliedForce),
      angle: appliedForce >= 0 ? 0 : 180,
      description: `External force applied horizontally to the object (action: ${appliedForce} N)`
    });

    // Note: For Newton's Third Law demonstration, we show the reaction force visually
    // but don't include it in net force calculation since it acts on a different object
    // The reaction force would act on whatever is applying the force (e.g., your hand)
    if (appliedForce !== 0 && showReactionForces) {
      const reaction: Vector2D = { x: -appliedForce, y: 0 };
      forces.push({
        name: 'Reaction Force (on hand)',
        vector: reaction,
        color: '#EF4444',
        visible: true,
        magnitude: Math.abs(appliedForce),
        angle: appliedForce >= 0 ? 180 : 0,
        description: `Reaction force acting on the hand/applicator (equal and opposite: ${-appliedForce} N) - Newton's Third Law`
      });
    }

    // Normal force (perpendicular to surface)
    const normalMag = mass * gravity * Math.cos(angleRad);
    const normal: Vector2D = {
      x: -normalMag * Math.sin(angleRad),
      y: -normalMag * Math.cos(angleRad)
    };
    forces.push({
      name: 'Normal Force (Reaction)',
      vector: normal,
      color: '#3B82F6',
      visible: true,
      magnitude: normalMag,
      angle: 90 - inclineAngle,
      description: `Surface reaction force (equal and opposite to weight component perpendicular to surface: ${normalMag.toFixed(1)} N) - Newton's Third Law`
    });

    // Friction force (if rough surface)
    if (surfaceType === 'rough' && frictionCoeff > 0) {
      const velocityMag = this.magnitude(velocity);
      const isMoving = velocityMag > this.STATIC_FRICTION_THRESHOLD;
      
      let friction: Vector2D;
      
      if (isMoving) {
        // Kinetic friction: opposes motion direction
        const frictionMag = frictionCoeff * normalMag;
        const velocityDirection = this.normalize(velocity);
        friction = {
          x: -velocityDirection.x * frictionMag,
          y: -velocityDirection.y * frictionMag
        };
      } else {
        // Static friction: opposes applied force up to maximum static friction
        const maxStaticFriction = frictionCoeff * normalMag;
        const appliedForceMag = Math.abs(appliedForce);
        
        if (appliedForceMag <= maxStaticFriction) {
          // Static friction exactly opposes applied force
          friction = { x: -appliedForce, y: 0 };
        } else {
          // Object starts moving, use kinetic friction
          friction = { x: -Math.sign(appliedForce) * maxStaticFriction, y: 0 };
        }
      }
      
      forces.push({
        name: 'Friction (Reaction)',
        vector: friction,
        color: '#F97316',
        visible: true,
        magnitude: this.magnitude(friction),
        angle: Math.atan2(friction.y, friction.x) * 180 / Math.PI,
        description: `${isMoving ? 'Kinetic' : 'Static'} friction opposing applied force (reaction: μ = ${frictionCoeff}, f = ${this.magnitude(friction).toFixed(1)} N) - Newton's Third Law`
      });
    }

    // Air resistance (if enabled)
    if (airResistance && environment !== 'space') {
      const speed = this.magnitude(velocity);
      const dragCoeff = 0.47; // sphere
      const area = Math.PI * radius * radius;
      const dragMag = 0.5 * this.AIR_DENSITY * dragCoeff * area * speed * speed;
      
      if (speed > 0.1) {
        const dragDirection = this.normalize(velocity);
        const drag: Vector2D = {
          x: -dragDirection.x * dragMag,
          y: -dragDirection.y * dragMag
        };
        forces.push({
          name: 'Air Resistance',
          vector: drag,
          color: '#A855F7',
          visible: true,
          magnitude: dragMag,
          angle: Math.atan2(-dragDirection.y, -dragDirection.x) * 180 / Math.PI,
          description: `Air resistance opposing motion (Fd = ½ρv²CdA = ${dragMag.toFixed(2)} N)`
        });
      }
    }

    // Gravitational component along incline
    if (inclineAngle > 0) {
      const gravityComponent = mass * gravity * Math.sin(angleRad);
      const inclineForce: Vector2D = {
        x: gravityComponent * Math.cos(angleRad),
        y: -gravityComponent * Math.sin(angleRad)
      };
      forces.push({
        name: 'Gravity Component',
        vector: inclineForce,
        color: '#DC2626',
        visible: true,
        magnitude: Math.abs(gravityComponent),
        angle: inclineAngle,
        description: `Component of weight along the inclined plane (mg sin θ = ${Math.abs(gravityComponent).toFixed(1)} N)`
      });
    }

    return forces;
  }

  static calculateNetForce(forces: ForceVector[]): Vector2D {
    return forces.reduce((net, force) => {
      // Exclude reaction forces that act on different objects (like the hand)
      if (force.name.includes('Reaction Force (on hand)')) {
        return net; // Don't include this in net force calculation
      }
      return this.addVectors(net, force.vector);
    }, { x: 0, y: 0 });
  }

  static updatePhysicsObject(
    object: PhysicsObject,
    netForce: Vector2D,
    timeStep: number = this.TIME_STEP,
    canvasBounds?: { width: number; height: number }
  ): PhysicsObject {
    // Input validation
    if (!object || !netForce || !isFinite(timeStep) || timeStep <= 0) {
      console.warn('Invalid physics update parameters');
      return object;
    }
    
    // Prevent division by zero
    if (object.mass <= 0) {
      console.warn('Object mass must be positive');
      return object;
    }
    
    // Newton's Second Law: F = ma, so a = F/m
    const acceleration: Vector2D = {
      x: netForce.x / object.mass,
      y: netForce.y / object.mass
    };

    // Update velocity: v = v₀ + at
    let velocity: Vector2D = {
      x: object.velocity.x + acceleration.x * timeStep,
      y: object.velocity.y + acceleration.y * timeStep
    };

    // Apply velocity limits for realistic physics
    const speed = this.magnitude(velocity);
    if (speed > this.MAX_VELOCITY) {
      const scale = this.MAX_VELOCITY / speed;
      velocity.x *= scale;
      velocity.y *= scale;
    }

    // Apply minimum velocity threshold to prevent jitter
    if (speed < this.MIN_VELOCITY) {
      velocity.x = 0;
      velocity.y = 0;
    }

    // Update position: s = s₀ + vt + ½at² (more accurate than s = s₀ + vt)
    let position: Vector2D = {
      x: object.position.x + velocity.x * timeStep + 0.5 * acceleration.x * timeStep * timeStep,
      y: object.position.y + velocity.y * timeStep + 0.5 * acceleration.y * timeStep * timeStep
    };

    // Apply boundary constraints if canvas bounds are provided
    if (canvasBounds) {
      const scale = 30; // Canvas scale factor
      const halfWidth = canvasBounds.width / (2 * scale);
      const halfHeight = canvasBounds.height / (2 * scale);
      
      // Keep object within canvas bounds with some padding
      const padding = 1.0; // 1 meter padding
      const oldPosition = position;
      
      position.x = Math.max(-halfWidth + padding, Math.min(halfWidth - padding, position.x));
      position.y = Math.max(-halfHeight + padding, Math.min(halfHeight - padding, position.y));
      
      // If object hits boundary, reverse velocity component and apply damping
      if (position.x !== oldPosition.x) {
        velocity.x *= -0.8; // Damping factor
        position.x = Math.max(-halfWidth + padding, Math.min(halfWidth - padding, position.x));
      }
      if (position.y !== oldPosition.y) {
        velocity.y *= -0.8; // Damping factor
        position.y = Math.max(-halfHeight + padding, Math.min(halfHeight - padding, position.y));
      }
    }

    return { ...object, position, velocity, acceleration };
  }

  static calculateMomentum(object: PhysicsObject): Vector2D {
    return {
      x: object.mass * object.velocity.x,
      y: object.mass * object.velocity.y
    };
  }

  static calculateKineticEnergy(object: PhysicsObject): number {
    const speedSquared = object.velocity.x ** 2 + object.velocity.y ** 2;
    return 0.5 * object.mass * speedSquared;
  }

  static calculatePotentialEnergy(object: PhysicsObject, environment: 'earth' | 'moon' | 'mars' | 'space' = 'earth'): number {
    const gravity = this.getGravity(environment);
    return object.mass * gravity * Math.max(0, object.position.y);
  }

  static calculateTotalEnergy(object: PhysicsObject, environment: 'earth' | 'moon' | 'mars' | 'space' = 'earth'): number {
    return this.calculateKineticEnergy(object) + this.calculatePotentialEnergy(object, environment);
  }

  // Collision detection and response
  static checkCollision(obj1: PhysicsObject, obj2: PhysicsObject): boolean {
    const distance = Math.sqrt(
      Math.pow(obj2.position.x - obj1.position.x, 2) + 
      Math.pow(obj2.position.y - obj1.position.y, 2)
    );
    return distance <= (obj1.radius + obj2.radius);
  }

  static calculateCollisionNormal(obj1: PhysicsObject, obj2: PhysicsObject): Vector2D {
    const dx = obj2.position.x - obj1.position.x;
    const dy = obj2.position.y - obj1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      return { x: 1, y: 0 }; // Default direction if objects are at same position
    }
    
    return { x: dx / distance, y: dy / distance };
  }

  static calculateCollisionResponse(
    obj1: PhysicsObject, 
    obj2: PhysicsObject, 
    restitution: number = this.RESTITUTION_DEFAULT
  ): { velocity1: Vector2D; velocity2: Vector2D } {
    const normal = this.calculateCollisionNormal(obj1, obj2);
    
    // Relative velocity along collision normal
    const relativeVelocity = {
      x: obj2.velocity.x - obj1.velocity.x,
      y: obj2.velocity.y - obj1.velocity.y
    };
    
    const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;
    
    // Do not resolve if velocities are separating
    if (velocityAlongNormal > 0) {
      return { velocity1: obj1.velocity, velocity2: obj2.velocity };
    }
    
    // Calculate restitution
    let impulseScalar = -(1 + restitution) * velocityAlongNormal;
    const totalMass = obj1.mass + obj2.mass;
    
    // Prevent division by zero
    if (totalMass <= 0) {
      console.warn('Total mass must be positive for collision response');
      return { velocity1: obj1.velocity, velocity2: obj2.velocity };
    }
    
    impulseScalar /= totalMass;
    
    // Apply impulse
    const impulse = {
      x: impulseScalar * normal.x,
      y: impulseScalar * normal.y
    };
    
    const velocity1 = {
      x: obj1.velocity.x - impulse.x * obj2.mass,
      y: obj1.velocity.y - impulse.y * obj2.mass
    };
    
    const velocity2 = {
      x: obj2.velocity.x + impulse.x * obj1.mass,
      y: obj2.velocity.y + impulse.y * obj1.mass
    };
    
    return { velocity1, velocity2 };
  }

  static predictMotion(
    object: PhysicsObject,
    forces: ForceVector[],
    timeStep: number,
    steps: number
  ): { position: Vector2D; velocity: Vector2D; acceleration: Vector2D }[] {
    const predictions = [];
    let currentObject = { ...object };

    for (let i = 0; i < steps; i++) {
      const netForce = this.calculateNetForce(forces);
      currentObject = this.updatePhysicsObject(currentObject, netForce, timeStep);
      predictions.push({
        position: { ...currentObject.position },
        velocity: { ...currentObject.velocity },
        acceleration: { ...currentObject.acceleration }
      });
    }

    return predictions;
  }


  static calculateSpringForce(
    position: Vector2D,
    equilibrium: Vector2D,
    springConstant: number
  ): Vector2D {
    const displacement = {
      x: position.x - equilibrium.x,
      y: position.y - equilibrium.y
    };
    
    return {
      x: -springConstant * displacement.x,
      y: -springConstant * displacement.y
    };
  }

  static calculateDampingForce(
    velocity: Vector2D,
    dampingCoefficient: number
  ): Vector2D {
    return {
      x: -dampingCoefficient * velocity.x,
      y: -dampingCoefficient * velocity.y
    };
  }

  static calculateCentripetalForce(
    velocity: Vector2D,
    radius: number,
    mass: number
  ): Vector2D {
    const speed = this.magnitude(velocity);
    const centripetalAcceleration = (speed * speed) / radius;
    
    // Direction towards center (opposite to position vector)
    const direction = {
      x: -velocity.y / speed,
      y: velocity.x / speed
    };
    
    return {
      x: mass * centripetalAcceleration * direction.x,
      y: mass * centripetalAcceleration * direction.y
    };
  }

  static calculateBuoyantForce(
    volume: number,
    fluidDensity: number,
    gravity: number
  ): Vector2D {
    const buoyantForce = fluidDensity * volume * gravity;
    return { x: 0, y: -buoyantForce };
  }

  static calculateTensionForce(
    position1: Vector2D,
    position2: Vector2D,
    tension: number
  ): Vector2D {
    const direction = {
      x: position2.x - position1.x,
      y: position2.y - position1.y
    };
    
    const magnitude = this.magnitude(direction);
    if (magnitude === 0) return { x: 0, y: 0 };
    
    const unitDirection = {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };
    
    return {
      x: tension * unitDirection.x,
      y: tension * unitDirection.y
    };
  }
}