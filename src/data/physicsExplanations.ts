/**
 * Comprehensive Physics Explanations Database
 * Provides detailed educational content for each physics concept
 */

export interface PhysicsExplanation {
  title: string;
  definition: string;
  formula: string;
  explanation: string;
  applications: string[];
  examples: string[];
  commonMistakes: string[];
  advancedConcepts: string[];
  realWorldConnections: string[];
  historicalContext: string;
  experiments: string[];
  mathematicalDerivation: string;
  units: string;
  typicalValues: { [key: string]: string };
}

export const PhysicsExplanations: { [key: string]: PhysicsExplanation } = {
  reflection: {
    title: "Law of Reflection",
    definition: "The law of reflection states that when light strikes a surface, the angle of incidence equals the angle of reflection, and both rays lie in the same plane as the normal to the surface.",
    formula: "θᵢ = θᵣ (angle of incidence = angle of reflection)",
    explanation: "When light encounters a boundary between two media, part of it is reflected back into the original medium. For smooth surfaces (specular reflection), light reflects in a single direction following the law of reflection. For rough surfaces (diffuse reflection), light scatters in multiple directions, but each individual ray still follows the law of reflection at the microscopic level.",
    applications: [
      "Mirrors in telescopes and microscopes for image formation",
      "Periscopes in submarines for underwater observation",
      "Solar concentrators for renewable energy generation",
      "Automotive mirrors for driver safety",
      "Optical instruments like cameras and binoculars",
      "Fiber optic communication systems",
      "Laser systems and optical resonators"
    ],
    examples: [
      "Looking at yourself in a bathroom mirror",
      "Sunlight reflecting off a calm lake surface",
      "Laser beam bouncing off a mirror in a physics lab",
      "Light reflecting inside a kaleidoscope creating patterns",
      "Reflection in curved mirrors (concave/convex) for imaging",
      "Moonlight reflecting off Earth's surface"
    ],
    commonMistakes: [
      "Thinking reflected light is always weaker than incident light",
      "Confusing angle of incidence with angle of reflection",
      "Assuming all surfaces reflect light the same way",
      "Forgetting that reflection occurs even on transparent surfaces",
      "Not considering that the normal is perpendicular to the surface"
    ],
    advancedConcepts: [
      "Fresnel equations for calculating reflection coefficients",
      "Brewster's angle for polarization effects",
      "Total internal reflection and critical angle",
      "Multiple reflections in optical cavities",
      "Reflection from curved surfaces and image formation",
      "Quantum mechanical description of photon reflection"
    ],
    realWorldConnections: [
      "Mirror manufacturing processes and surface quality",
      "Anti-reflective coatings on lenses and screens",
      "Reflective materials in safety clothing and road signs",
      "Optical design of telescopes and microscopes",
      "Laser safety and reflection hazards"
    ],
    historicalContext: "The law of reflection was known to ancient Greek mathematicians and philosophers. Euclid (c. 300 BCE) described the law of reflection in his work 'Optics'. The principle was later refined by Islamic scientists like Alhazen (965-1040 CE), who provided experimental verification and geometric proofs.",
    experiments: [
      "Use a mirror and laser pointer to demonstrate the law",
      "Measure angles of incidence and reflection with a protractor",
      "Compare reflection from smooth vs. rough surfaces",
      "Study image formation in plane and curved mirrors",
      "Investigate multiple reflections in parallel mirrors"
    ],
    mathematicalDerivation: "The law of reflection can be derived from Fermat's principle of least time. Light takes the path that minimizes travel time. For reflection, this leads to the geometric condition that the angle of incidence equals the angle of reflection, ensuring the shortest possible path for the reflected ray.",
    units: "Angles are measured in degrees (°) or radians (rad)",
    typicalValues: {
      "Incident angle": "0° to 89°",
      "Reflected angle": "0° to 89°",
      "Reflection coefficient": "0.04 (glass) to 0.95 (mirror)"
    }
  },

  refraction: {
    title: "Snell's Law of Refraction",
    definition: "Snell's law describes how light bends when it passes from one medium to another with different optical densities. The ratio of the sines of the angles of incidence and refraction is equal to the ratio of the refractive indices of the two media.",
    formula: "n₁sinθ₁ = n₂sinθ₂",
    explanation: "When light travels from one medium to another, its speed changes due to the different optical density. This change in speed causes the light to bend, or refract. The amount of bending depends on the refractive indices of the two media. Light bends toward the normal when entering a denser medium and away from the normal when entering a less dense medium.",
    applications: [
      "Lens design for cameras, telescopes, and microscopes",
      "Fiber optic communication systems",
      "Prism spectroscopy for analyzing light",
      "Optical instruments and imaging systems",
      "Corrective lenses for vision problems",
      "Underwater photography and diving equipment",
      "Atmospheric optics and mirage formation"
    ],
    examples: [
      "Straw appearing bent in a glass of water",
      "Rainbow formation through water droplets",
      "Lens focusing light in cameras and eyeglasses",
      "Light bending in glass prisms creating spectra",
      "Underwater objects appearing closer than they are",
      "Mirage effects in deserts and on hot roads"
    ],
    commonMistakes: [
      "Thinking light always bends toward the normal",
      "Confusing refractive index with density",
      "Forgetting that light speed changes in different media",
      "Not considering total internal reflection",
      "Assuming refraction always makes objects appear closer"
    ],
    advancedConcepts: [
      "Dispersion and wavelength dependence of refractive index",
      "Nonlinear optics and intensity-dependent refraction",
      "Metamaterials with negative refractive index",
      "Quantum mechanical description of light propagation",
      "Refraction in anisotropic crystals",
      "Atmospheric refraction and astronomical observations"
    ],
    realWorldConnections: [
      "Eye anatomy and how the lens focuses light",
      "Camera lens design and optical aberrations",
      "Fiber optic internet and telecommunications",
      "Weather phenomena like rainbows and halos",
      "Medical imaging and endoscopy"
    ],
    historicalContext: "Snell's law is named after Dutch mathematician Willebrord Snellius (1580-1626), who discovered the relationship in 1621. However, the law was actually first discovered by Persian scientist Ibn Sahl in 984 CE. The law was independently rediscovered by several scientists before Snell's work became widely known.",
    experiments: [
      "Measure refraction angles through different materials",
      "Study the relationship between angle and refractive index",
      "Investigate total internal reflection",
      "Use a prism to separate white light into colors",
      "Measure the apparent depth of objects underwater"
    ],
    mathematicalDerivation: "Snell's law can be derived from Fermat's principle of least time or from Maxwell's equations describing electromagnetic waves. The principle of least time requires that light takes the path that minimizes travel time between two points, leading to the relationship between angles and refractive indices.",
    units: "Angles in degrees (°) or radians (rad), refractive index is dimensionless",
    typicalValues: {
      "Air": "n = 1.0003",
      "Water": "n = 1.33",
      "Glass": "n = 1.5-1.7",
      "Diamond": "n = 2.42"
    }
  },

  lenses: {
    title: "Thin Lens Formula",
    definition: "The thin lens formula relates the object distance, image distance, and focal length of a lens. It's fundamental to understanding how lenses form images and is used in designing optical instruments.",
    formula: "1/f = 1/v + 1/u",
    explanation: "For thin lenses, the relationship between the object distance (u), image distance (v), and focal length (f) follows the thin lens formula. This formula applies to both converging and diverging lenses, with proper sign conventions. The magnification of the lens is given by m = -v/u, where negative magnification indicates an inverted image.",
    applications: [
      "Camera lens design and photography",
      "Telescope and microscope optics",
      "Corrective lenses for vision problems",
      "Projection systems and displays",
      "Laser systems and optical resonators",
      "Medical imaging devices",
      "Surveillance and security systems"
    ],
    examples: [
      "Magnifying glass focusing sunlight to burn paper",
      "Camera lens focusing on distant objects",
      "Eyeglasses correcting nearsightedness or farsightedness",
      "Microscope objective lens magnifying small objects",
      "Telescope lens collecting light from stars",
      "Projector lens displaying images on screens"
    ],
    commonMistakes: [
      "Confusing object distance with image distance",
      "Forgetting sign conventions for lens types",
      "Not considering lens aberrations",
      "Assuming magnification is always positive",
      "Ignoring the difference between real and virtual images"
    ],
    advancedConcepts: [
      "Lens aberrations and their corrections",
      "Compound lens systems and optical design",
      "Aspheric lenses for improved performance",
      "Diffractive lenses and holographic optics",
      "Adaptive optics for atmospheric correction",
      "Quantum optics and photon imaging"
    ],
    realWorldConnections: [
      "Eye anatomy and accommodation",
      "Camera autofocus systems",
      "Lens manufacturing and quality control",
      "Optical coating technology",
      "3D imaging and virtual reality displays"
    ],
    historicalContext: "The thin lens formula was developed through the work of many scientists over centuries. Ibn al-Haytham (965-1040 CE) made early contributions to lens theory. The modern formulation emerged from the work of Johannes Kepler (1571-1630) and later scientists who established the geometric principles of image formation.",
    experiments: [
      "Measure focal length of converging and diverging lenses",
      "Study image formation for different object distances",
      "Investigate magnification and image orientation",
      "Compare real vs. virtual images",
      "Study lens aberrations and their effects"
    ],
    mathematicalDerivation: "The thin lens formula can be derived using ray tracing and geometric optics. By applying the law of refraction at both surfaces of a thin lens and making the thin lens approximation, we arrive at the relationship 1/f = 1/v + 1/u. The derivation assumes paraxial rays and neglects lens thickness.",
    units: "Distances in meters (m) or centimeters (cm), focal length in same units",
    typicalValues: {
      "Camera lens focal length": "18mm to 300mm",
      "Microscope objective": "4mm to 40mm",
      "Telescope objective": "100mm to 1000mm",
      "Magnifying glass": "50mm to 150mm"
    }
  },

  tir: {
    title: "Total Internal Reflection",
    definition: "Total internal reflection occurs when light traveling in a denser medium strikes the boundary with a less dense medium at an angle greater than the critical angle. All the light is reflected back into the denser medium with no transmission.",
    formula: "θc = sin⁻¹(n₂/n₁)",
    explanation: "When light travels from a medium with higher refractive index (n₁) to one with lower refractive index (n₂), there's a critical angle beyond which no refraction occurs. At angles greater than the critical angle, all light is reflected back into the denser medium. This phenomenon is the basis for optical fibers and many optical devices.",
    applications: [
      "Optical fiber communication systems",
      "Fiber optic sensors and medical endoscopes",
      "Prism-based optical instruments",
      "Diamond cutting and jewelry design",
      "Retroreflectors for safety and navigation",
      "Optical switching and routing devices",
      "Underwater communication systems"
    ],
    examples: [
      "Light trapped in a glass of water when viewed from below",
      "Diamond sparkle due to multiple internal reflections",
      "Optical fiber carrying internet signals",
      "Prism binoculars using TIR for image erection",
      "Cat's eye reflectors on roads",
      "Light guiding in crystal formations"
    ],
    commonMistakes: [
      "Thinking TIR can occur at any angle",
      "Confusing TIR with regular reflection",
      "Forgetting that TIR requires n₁ > n₂",
      "Not understanding the critical angle concept",
      "Assuming TIR is 100% efficient in all cases"
    ],
    advancedConcepts: [
      "Evanescent waves and frustrated total internal reflection",
      "Optical fiber modes and propagation",
      "Surface plasmon resonance",
      "Photonic crystal fibers",
      "Nonlinear effects in TIR",
      "Quantum tunneling of photons"
    ],
    realWorldConnections: [
      "Internet infrastructure and data transmission",
      "Medical imaging and minimally invasive surgery",
      "Jewelry industry and gem cutting",
      "Automotive lighting and safety systems",
      "Military and aerospace applications"
    ],
    historicalContext: "Total internal reflection was first described by Johannes Kepler in 1611, though the phenomenon was observed earlier. The critical angle was mathematically described by René Descartes in 1637. The practical application in optical fibers was developed in the 20th century, revolutionizing telecommunications.",
    experiments: [
      "Demonstrate TIR with a laser and water tank",
      "Measure critical angle for different materials",
      "Study light propagation in optical fibers",
      "Investigate TIR in prisms and optical devices",
      "Compare TIR with regular reflection"
    ],
    mathematicalDerivation: "The critical angle is derived from Snell's law. When the angle of refraction reaches 90°, we have n₁sinθ₁ = n₂sin(90°) = n₂. Therefore, θc = sin⁻¹(n₂/n₁). For angles greater than θc, sin⁻¹(n₂/n₁) would be greater than 1, which is impossible, so no refraction occurs.",
    units: "Critical angle in degrees (°) or radians (rad)",
    typicalValues: {
      "Glass to air": "θc ≈ 42°",
      "Water to air": "θc ≈ 49°",
      "Diamond to air": "θc ≈ 24°",
      "Plastic to air": "θc ≈ 45°"
    }
  },

  prism: {
    title: "Prism Dispersion and Deviation",
    definition: "Prisms separate white light into its constituent colors through dispersion, where different wavelengths bend by different amounts. The deviation angle depends on the prism angle, refractive index, and incident angle.",
    formula: "δ = i₁ + i₂ - A (deviation angle)",
    explanation: "When white light enters a prism, it undergoes refraction at both surfaces. Due to dispersion, different wavelengths (colors) bend by different amounts, separating the light into a spectrum. The total deviation depends on the prism's apex angle, the material's refractive index, and the incident angle. Minimum deviation occurs when the light passes symmetrically through the prism.",
    applications: [
      "Spectroscopy for chemical analysis",
      "Rainbow formation in nature",
      "Optical instruments and monochromators",
      "Laser beam shaping and filtering",
      "Photography filters and effects",
      "Scientific research and astronomy",
      "Educational demonstrations"
    ],
    examples: [
      "Rainbow created by sunlight through water droplets",
      "Prism separating sunlight into colors",
      "Spectrometer analyzing chemical composition",
      "Laser light filtering and wavelength selection",
      "Photography using prism effects",
      "Gemstone fire and color dispersion"
    ],
    commonMistakes: [
      "Thinking all colors bend the same amount",
      "Confusing deviation with dispersion",
      "Not understanding minimum deviation",
      "Forgetting that dispersion depends on wavelength",
      "Assuming prism angle determines color separation"
    ],
    advancedConcepts: [
      "Cauchy's dispersion formula",
      "Sellmeier equations for refractive index",
      "Nonlinear dispersion effects",
      "Photonic crystal prisms",
      "Metamaterial dispersion engineering",
      "Quantum mechanical description of dispersion"
    ],
    realWorldConnections: [
      "Atmospheric optics and rainbow formation",
      "Gemstone cutting and jewelry design",
      "Scientific instrumentation and analysis",
      "Optical communication systems",
      "Medical spectroscopy and diagnosis"
    ],
    historicalContext: "Isaac Newton (1642-1727) conducted the first systematic study of prism dispersion in 1666, demonstrating that white light consists of all colors. His experiments laid the foundation for understanding light as a spectrum of wavelengths. The mathematical description of prism deviation was developed by later scientists.",
    experiments: [
      "Separate white light using a glass prism",
      "Measure deviation angles for different colors",
      "Investigate minimum deviation conditions",
      "Compare dispersion in different materials",
      "Study the relationship between prism angle and deviation"
    ],
    mathematicalDerivation: "The deviation angle is derived by considering the geometry of light passing through a prism. At the first surface: n₁sin(i₁) = n₂sin(r₁). At the second surface: n₂sin(r₂) = n₁sin(i₂). Using the geometric relationship A = r₁ + r₂ and the definition δ = i₁ + i₂ - A, we arrive at the deviation formula.",
    units: "Angles in degrees (°) or radians (rad)",
    typicalValues: {
      "Glass prism (60°)": "δ ≈ 37° (minimum deviation)",
      "Water droplet": "Rainbow angle ≈ 42°",
      "Diamond prism": "Strong dispersion, large deviation",
      "Quartz prism": "UV transmission, special applications"
    }
  },

  diffraction: {
    title: "Light Diffraction and Interference",
    definition: "Diffraction is the bending of light around obstacles or through apertures, while interference is the superposition of waves creating constructive and destructive patterns. These phenomena demonstrate the wave nature of light.",
    formula: "Single slit: θ = λ/a, Double slit: θ = λ/d, Grating: θ = mλ/d",
    explanation: "When light encounters obstacles or passes through narrow openings, it spreads out and creates interference patterns. Single slits create broad diffraction patterns, double slits create interference fringes, and multiple slits (gratings) create sharp, bright maxima. The pattern depends on wavelength, slit width, and spacing.",
    applications: [
      "Spectroscopy for chemical analysis",
      "CD and DVD data storage technology",
      "Holography and 3D imaging",
      "X-ray crystallography",
      "Laser beam shaping and optics",
      "Optical communication systems",
      "Scientific research and astronomy"
    ],
    examples: [
      "Rainbow colors in soap bubbles",
      "Light spreading through window blinds",
      "Laser pointer beam spreading",
      "Color patterns in peacock feathers",
      "Diffraction gratings in spectrometers",
      "Holographic images and displays"
    ],
    commonMistakes: [
      "Confusing diffraction with refraction",
      "Thinking diffraction only occurs with narrow slits",
      "Not understanding the difference between single and double slit patterns",
      "Assuming all wavelengths diffract the same way",
      "Forgetting that diffraction demonstrates wave nature"
    ],
    advancedConcepts: [
      "Fresnel and Fraunhofer diffraction",
      "Fourier optics and spatial frequency analysis",
      "Photon statistics and quantum interference",
      "Metamaterial diffraction control",
      "Nonlinear diffraction effects",
      "Quantum mechanical description of interference"
    ],
    realWorldConnections: [
      "Optical data storage and reading",
      "Scientific instrumentation and analysis",
      "Holographic security features",
      "Laser technology and beam control",
      "Atmospheric optics and scattering"
    ],
    historicalContext: "Thomas Young (1773-1829) first demonstrated light interference in 1801 with his double-slit experiment, providing strong evidence for the wave theory of light. Augustin-Jean Fresnel (1788-1827) developed the mathematical theory of diffraction. These discoveries resolved the long-standing debate about light's nature.",
    experiments: [
      "Single-slit diffraction with laser light",
      "Double-slit interference patterns",
      "Diffraction grating spectroscopy",
      "Measure fringe spacing and wavelength",
      "Study the effect of slit width on patterns"
    ],
    mathematicalDerivation: "Diffraction patterns are derived from Huygens' principle and the superposition of waves. For single slits, the intensity pattern is I = I₀(sin(β)/β)² where β = πa sin(θ)/λ. For double slits, the pattern is modulated by the single-slit envelope. Grating maxima occur when the path difference equals integer multiples of the wavelength.",
    units: "Angles in degrees (°) or radians (rad), wavelengths in nanometers (nm)",
    typicalValues: {
      "Visible light wavelength": "400-700 nm",
      "Single slit width": "0.01-1 mm",
      "Double slit spacing": "0.1-1 mm",
      "Grating spacing": "100-10000 lines/mm"
    }
  },

  polarization: {
    title: "Light Polarization and Malus's Law",
    definition: "Polarization is the orientation of light's electric field vector. Natural light is unpolarized (random orientations), while polarized light has electric fields oscillating in a specific direction. Malus's law describes how polarizers affect light intensity.",
    formula: "Malus's Law: I = I₀ cos²(θ)",
    explanation: "Light is an electromagnetic wave with electric and magnetic fields oscillating perpendicular to the direction of propagation. Polarizers filter light by only allowing waves oscillating in a specific direction to pass through. When two polarizers are crossed at 90°, light is completely blocked. The intensity of transmitted light depends on the angle between polarizer and analyzer according to Malus's law.",
    applications: [
      "Polarized sunglasses to reduce glare",
      "LCD displays and screen technology",
      "3D movie technology and glasses",
      "Optical microscopy and imaging",
      "Photography filters and effects",
      "Scientific research and analysis",
      "Communication systems and radar"
    ],
    examples: [
      "Polarized sunglasses blocking reflected light",
      "LCD screen showing different colors",
      "3D glasses for movies and entertainment",
      "Light reflected off water surfaces",
      "Polarized filters in cameras",
      "Crystal optics and birefringence"
    ],
    commonMistakes: [
      "Thinking all light is polarized",
      "Confusing polarization with color",
      "Not understanding Malus's law",
      "Assuming polarizers only block light",
      "Forgetting that reflection can polarize light"
    ],
    advancedConcepts: [
      "Circular and elliptical polarization",
      "Birefringence and crystal optics",
      "Polarization modulation and control",
      "Quantum mechanical description of photon polarization",
      "Metamaterial polarization engineering",
      "Nonlinear polarization effects"
    ],
    realWorldConnections: [
      "Display technology and screen manufacturing",
      "Optical communication and data transmission",
      "Medical imaging and diagnosis",
      "Military and security applications",
      "Astronomical observations and space science"
    ],
    historicalContext: "Étienne-Louis Malus (1775-1812) discovered light polarization in 1808 while studying light reflected from windows. He formulated Malus's law describing the intensity of polarized light passing through a polarizer. The discovery provided crucial evidence for the transverse wave nature of light.",
    experiments: [
      "Demonstrate polarization with polarizing filters",
      "Measure transmitted intensity vs. angle",
      "Study reflection polarization",
      "Investigate birefringence in crystals",
      "Use polarizers to reduce glare"
    ],
    mathematicalDerivation: "Malus's law is derived from the vector nature of electromagnetic waves. When unpolarized light passes through a polarizer, only the component parallel to the polarizer's axis is transmitted. The transmitted intensity is proportional to the square of the cosine of the angle between the polarizer and analyzer axes.",
    units: "Intensity in arbitrary units, angles in degrees (°) or radians (rad)",
    typicalValues: {
      "Transmitted intensity (parallel)": "100%",
      "Transmitted intensity (perpendicular)": "0%",
      "Transmitted intensity (45°)": "50%",
      "Extinction ratio": "100:1 to 10000:1"
    }
  }
};

// Utility functions for accessing explanations
export const getPhysicsExplanation = (topic: string): PhysicsExplanation | null => {
  return PhysicsExplanations[topic] || null;
};

export const getAllTopics = (): string[] => {
  return Object.keys(PhysicsExplanations);
};

export const getTopicsByCategory = (category: string): string[] => {
  // This could be extended to categorize topics
  return Object.keys(PhysicsExplanations);
};
