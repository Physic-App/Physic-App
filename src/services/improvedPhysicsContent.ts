/**
 * Improved Physics Content for Better RAG Responses
 */

export const improvedPhysicsContent = {
  'Motion': `
    **Motion** is the change in position of an object with respect to time.
    
    **Types of Motion:**
    1. **Linear Motion**: Motion in a straight line
    2. **Circular Motion**: Motion along a circular path  
    3. **Rotational Motion**: Motion about an axis
    
    **Key Concepts:**
    - **Displacement**: Change in position (vector quantity)
    - **Velocity**: Rate of change of displacement, v = ds/dt
    - **Acceleration**: Rate of change of velocity, a = dv/dt
    
    **Equations of Motion:**
    - First equation: v = u + at
    - Second equation: s = ut + (1/2)at²
    - Third equation: v² = u² + 2as
    
    Where: v = final velocity, u = initial velocity, a = acceleration, t = time, s = displacement
  `,
  
  'Friction': `
    **Friction** is a force that opposes relative motion between surfaces in contact.
    
    **Types of Friction:**
    1. **Static Friction**: Acts when object is at rest, fs ≤ μsN
    2. **Kinetic Friction**: Acts when object is moving, fk = μkN
    3. **Rolling Friction**: Acts when object rolls
    
    **Applications:**
    - Walking and running
    - Vehicle braking systems
    - Writing with pen/pencil
    
    **Methods to reduce friction:**
    - Lubrication, ball bearings, streamlining
  `,
  
  'Force and Pressure': `
    **Force** is a push or pull that can change motion or shape.
    - Vector quantity with magnitude and direction
    - SI unit: Newton (N)
    
    **Pressure** is force per unit area.
    - Formula: P = F/A
    - SI unit: Pascal (Pa)
    
    **Pressure in fluids:**
    - Increases with depth: P = ρgh
    - Pascal's principle: Pressure transmitted equally in all directions
  `,
  
  'Electric Current and Its Effects': `
    **Electric Current** is the flow of electric charge.
    - Formula: I = Q/t
    - SI unit: Ampere (A)
    
    **Effects of Electric Current:**
    1. **Heating Effect**: H = I²Rt (Joule's law)
    2. **Magnetic Effect**: Current creates magnetic field
    3. **Chemical Effect**: Electrolysis
    
    **Ohm's Law**: V = IR
  `,
  
  'Force and Laws of Motion': `
    **Newton's Laws of Motion:**
    
    **First Law (Inertia)**: Object at rest stays at rest, object in motion stays in motion unless acted upon by external force.
    
    **Second Law**: F = ma
    - Force equals mass times acceleration
    
    **Third Law**: For every action, there is equal and opposite reaction.
    
    **Applications**: Walking, rocket propulsion, recoil
  `,
  
  'Gravitation': `
    **Universal Law of Gravitation**: F = G(m₁m₂)/r²
    
    Where G = 6.67 × 10⁻¹¹ N⋅m²/kg²
    
    **Key Concepts:**
    - Weight vs Mass: W = mg
    - Free fall: All objects fall at same rate
    - Acceleration due to gravity: g ≈ 9.8 m/s²
    
    **Applications**: Satellite orbits, tides, planetary motion
  `,
  
  'Light: Reflection and Refraction': `
    **Reflection**: Bouncing back of light from surfaces
    
    **Laws of Reflection:**
    1. Incident ray, reflected ray, and normal in same plane
    2. Angle of incidence = Angle of reflection
    
    **Refraction**: Bending of light when passing between media
    - Snell's Law: n₁sin(θ₁) = n₂sin(θ₂)
    
    **Applications**: Mirrors, lenses, prisms, optical instruments
  `,
  
  'Electricity': `
    **Electric Charge**: Fundamental property of matter
    - Like charges repel, unlike charges attract
    - Charge is conserved and quantized
    
    **Coulomb's Law**: F = k(q₁q₂)/r²
    
    **Electric Field**: E = F/q = kQ/r²
    
    **Electric Potential**: V = kQ/r
    
    **Applications**: Capacitors, conductors, electrical circuits
  `,
  
  'Magnetic Effects of Electric Current': `
    **Magnetic Field**: Region where magnetic force is experienced
    
    **Magnetic field due to current:**
    - Straight conductor: B = (μ₀I)/(2πr)
    - Circular loop: B = (μ₀I)/(2R)
    - Solenoid: B = μ₀nI
    
    **Force on conductor**: F = BIL sin(θ)
    
    **Electromagnetic Induction**: EMF = -dΦ/dt
    
    **Applications**: Motors, generators, transformers
  `,
  
  'Work and Energy': `
    **Work**: W = F⋅s cos(θ)
    - Energy transferred when force causes displacement
    
    **Energy Types:**
    - **Kinetic Energy**: KE = (1/2)mv²
    - **Potential Energy**: PE = mgh
    
    **Work-Energy Theorem**: Work done = Change in KE
    
    **Conservation of Energy**: Total energy remains constant
    
    **Power**: P = W/t = F⋅v
    
    **Applications**: Machines, hydroelectric plants, pendulums
  `
};

export function getImprovedContent(chapterTitle: string): string {
  return improvedPhysicsContent[chapterTitle as keyof typeof improvedPhysicsContent] || 
    `Comprehensive ${chapterTitle} content covering fundamental concepts, formulas, and applications.`;
}
