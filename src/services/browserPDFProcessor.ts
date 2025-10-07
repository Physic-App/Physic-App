import { localStorageRAG, ChapterData } from './localStorageRAG';

export interface ProcessingResult {
  successfulFiles: number;
  totalFiles: number;
  errors: string[];
  processedChapters: string[];
}

export class BrowserPDFProcessor {
  private async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Simple PDF text extraction using PDF.js
          // For a more robust solution, you would use pdfjs-dist library
          // For now, we'll simulate text extraction
          const text = await this.simulatePDFTextExtraction(file.name);
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async simulatePDFTextExtraction(fileName: string): Promise<string> {
    // This is a simulation - in a real implementation, you would use PDF.js
    // to extract actual text from the PDF
    
    const physicsContent = this.getSamplePhysicsContent(fileName);
    return physicsContent;
  }

  private getSamplePhysicsContent(fileName: string): string {
    const contentMap: { [key: string]: string } = {
      'mechanics.pdf': `
# Mechanics - Motion and Forces

## Introduction
Mechanics is the branch of physics that deals with the motion of objects and the forces that cause this motion.

## Newton's Laws of Motion

### First Law (Law of Inertia)
An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.

### Second Law
Force equals mass times acceleration: F = ma

### Third Law
For every action, there is an equal and opposite reaction.

## Kinematics
Kinematics is the study of motion without considering the forces that cause it.

### Equations of Motion
- v = u + at
- s = ut + ½at²
- v² = u² + 2as

Where:
- v = final velocity
- u = initial velocity
- a = acceleration
- t = time
- s = displacement
      `,
      'thermodynamics.pdf': `
# Thermodynamics - Heat and Energy

## Introduction
Thermodynamics is the study of heat, temperature, and their relation to energy and work.

## Laws of Thermodynamics

### Zeroth Law
If two systems are in thermal equilibrium with a third system, they are in thermal equilibrium with each other.

### First Law
Energy cannot be created or destroyed, only converted from one form to another.

### Second Law
The entropy of an isolated system never decreases.

### Third Law
As temperature approaches absolute zero, entropy approaches a constant minimum.

## Heat Transfer
Heat can be transferred by conduction, convection, and radiation.

## Gas Laws
- Boyle's Law: PV = constant (at constant temperature)
- Charles's Law: V/T = constant (at constant pressure)
- Gay-Lussac's Law: P/T = constant (at constant volume)
- Ideal Gas Law: PV = nRT
      `,
      'electricity.pdf': `
# Electricity and Magnetism

## Electric Charge
Electric charge is a fundamental property of matter. Like charges repel, unlike charges attract. Charge is measured in coulombs (C).

## Electric Current
Electric current is the flow of electric charge through a conductor. Current is the rate of flow of charge. The formula for current is: I = Q/t, where I is current in amperes (A), Q is charge in coulombs, and t is time in seconds.

## Ohm's Law
Ohm's Law is one of the most fundamental laws in electricity. It states that the current flowing through a conductor is directly proportional to the voltage applied across it, provided the temperature remains constant.

**Formula: V = IR**

Where:
- V = Voltage (potential difference) in volts (V)
- I = Current in amperes (A)
- R = Resistance in ohms (Ω)

**Understanding the Law:**
- If voltage increases, current increases (when resistance is constant)
- If resistance increases, current decreases (when voltage is constant)
- Resistance opposes the flow of current

**Example:**
If a circuit has a voltage of 12V and resistance of 4Ω, the current is: I = V/R = 12/4 = 3A

## Resistance
Resistance is the opposition to current flow. It depends on the material, length, cross-sectional area, and temperature of the conductor. Good conductors have low resistance, while insulators have high resistance.

## Electric Power
Power is the rate at which electrical energy is consumed or transferred. The formulas for power are:
- P = VI (power = voltage × current)
- P = I²R (power = current squared × resistance)
- P = V²/R (power = voltage squared / resistance)

Power is measured in watts (W).

## Series and Parallel Circuits
In series circuits, current is the same everywhere, but voltage divides. In parallel circuits, voltage is the same everywhere, but current divides.

## Magnetism
Magnetism is a force that acts on moving electric charges. Every magnet has two poles: north and south. Like poles repel, unlike poles attract.

## Electromagnetic Induction
When a magnetic field changes near a conductor, it induces an electric current in the conductor. This is Faraday's Law of electromagnetic induction, which is the principle behind generators and transformers.
      `,
      'waves.pdf': `
# Waves and Oscillations

## Wave Properties
- Wavelength (λ): Distance between consecutive crests
- Frequency (f): Number of waves per second
- Period (T): Time for one complete wave
- Amplitude (A): Maximum displacement from equilibrium

## Wave Equation
v = fλ

## Types of Waves
- Transverse waves: Displacement perpendicular to direction of propagation
- Longitudinal waves: Displacement parallel to direction of propagation

## Sound Waves
Sound is a longitudinal wave that requires a medium to travel.

## Light Waves
Light is an electromagnetic wave that can travel through vacuum.

## Interference and Diffraction
Waves can interfere constructively or destructively, and can bend around obstacles.
      `,
      'optics.pdf': `
# Optics - Light and Vision

## Light as a Wave
Light exhibits wave properties including interference, diffraction, and polarization.

## Reflection
The angle of incidence equals the angle of reflection.

## Refraction
When light passes from one medium to another, it bends according to Snell's Law:
n₁sinθ₁ = n₂sinθ₂

## Lenses
- Convex lens: Converges light rays
- Concave lens: Diverges light rays

## Lens Equation
1/f = 1/v + 1/u

Where:
- f = focal length
- v = image distance
- u = object distance

## Magnification
m = v/u = hᵢ/hₒ
      `,
      'magnetic-effects.pdf': `
# Magnetic Effects of Electric Current

## Introduction
When electric current flows through a conductor, it creates a magnetic field around it. This phenomenon is called the magnetic effect of electric current.

## Oersted's Experiment
Hans Christian Oersted discovered that a current-carrying conductor produces a magnetic field around it. When a compass needle is placed near a current-carrying wire, it deflects.

## Magnetic Field Around a Current-Carrying Conductor
- The magnetic field lines form concentric circles around the conductor
- The direction of the magnetic field can be determined using the Right-Hand Rule
- The strength of the magnetic field increases with the current

## Right-Hand Rule
If you point your thumb in the direction of the current, your fingers curl in the direction of the magnetic field lines.

## Electromagnets
An electromagnet is a temporary magnet made by passing electric current through a coil of wire wound around a soft iron core.

**Properties:**
- Can be turned on and off
- Strength can be controlled by varying current
- Used in electric bells, cranes, MRI machines

## Electric Motor
An electric motor converts electrical energy into mechanical energy.

**Principle:** When a current-carrying conductor is placed in a magnetic field, it experiences a force that causes it to move.

**Components:**
- Armature (rotating coil)
- Field magnet (permanent or electromagnet)
- Commutator (reverses current direction)
- Brushes (connect power supply)

## Electric Generator
An electric generator converts mechanical energy into electrical energy.

**Principle:** Electromagnetic induction - when a conductor moves through a magnetic field, an electric current is induced in it.

**Types:**
- AC Generator (Alternating Current)
- DC Generator (Direct Current)

## Electromagnetic Induction
Discovered by Michael Faraday. When a magnetic field changes near a conductor, it induces an electric current in the conductor.

**Faraday's Law:** The magnitude of induced EMF is directly proportional to the rate of change of magnetic flux.

**Lenz's Law:** The direction of induced current opposes the change that produced it.

## Transformer
A transformer changes the voltage of alternating current.

**Principle:** Mutual induction between two coils.

**Types:**
- Step-up transformer: Increases voltage
- Step-down transformer: Decreases voltage

**Formula:** V₁/V₂ = N₁/N₂

Where:
- V₁, V₂ = Primary and secondary voltages
- N₁, N₂ = Number of turns in primary and secondary coils

## Applications
- Electric motors in fans, washing machines, cars
- Generators in power plants
- Transformers in power distribution
- Electromagnets in MRI machines, speakers
- Induction cooktops
      `
    };

    return contentMap[fileName.toLowerCase()] || `
# Physics Chapter: ${fileName}

## Introduction
This chapter covers fundamental concepts in physics.

## Key Topics
- Basic principles
- Mathematical relationships
- Real-world applications
- Problem-solving techniques

## Formulas and Equations
Various physics formulas and their applications will be covered in this chapter.

## Examples and Applications
Practical examples and applications of the concepts discussed.
    `;
  }

  private getChapterIdFromFileName(fileName: string): string {
    const name = fileName.toLowerCase().replace('.pdf', '');
    const chapterMap: { [key: string]: string } = {
      'mechanics': 'mechanics',
      'thermodynamics': 'thermodynamics', 
      'electricity': 'electricity',
      'waves': 'waves',
      'optics': 'optics',
      'force': 'force-and-pressure',
      'pressure': 'force-and-pressure',
      'motion': 'motion',
      'energy': 'energy',
      'light': 'light',
      'magnetic-effects': 'magnetic-effects'
    };
    
    return chapterMap[name] || name;
  }

  private getChapterTitle(chapterId: string): string {
    const titleMap: { [key: string]: string } = {
      'mechanics': 'Mechanics and Motion',
      'thermodynamics': 'Thermodynamics',
      'electricity': 'Electricity and Magnetism',
      'waves': 'Waves and Oscillations',
      'optics': 'Optics and Light',
      'force-and-pressure': 'Force and Pressure',
      'motion': 'Motion and Kinematics',
      'energy': 'Energy and Work',
      'light': 'Light and Optics',
      'magnetic-effects': 'Magnetic Effects of Electric Current'
    };
    
    return titleMap[chapterId] || chapterId.charAt(0).toUpperCase() + chapterId.slice(1);
  }

  private splitContentIntoSections(content: string): { title: string; content: string }[] {
    const sections: { title: string; content: string }[] = [];
    const lines = content.split('\n');
    let currentSection = { title: 'Introduction', content: '' };
    let pageNumber = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('##')) {
        // Save previous section
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection, pageNumber });
          pageNumber++;
        }
        
        // Start new section
        currentSection = {
          title: line.replace('##', '').trim(),
          content: ''
        };
      } else if (line.startsWith('#')) {
        // Main title - skip for now
        continue;
      } else if (line) {
        currentSection.content += line + '\n';
      }
    }

    // Add the last section
    if (currentSection.content.trim()) {
      sections.push({ ...currentSection, pageNumber });
    }

    return sections;
  }

  async processPDFFiles(files: File[]): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      successfulFiles: 0,
      totalFiles: files.length,
      errors: [],
      processedChapters: []
    };

    for (const file of files) {
      try {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          result.errors.push(`${file.name}: Not a PDF file`);
          continue;
        }

        console.log(`Processing ${file.name}...`);
        const text = await this.extractTextFromPDF(file);
        
        const chapterId = this.getChapterIdFromFileName(file.name);
        const chapterTitle = this.getChapterTitle(chapterId);
        const sections = this.splitContentIntoSections(text);

        const chapterData: ChapterData = {
          id: chapterId,
          title: chapterTitle,
          content: text,
          sections,
          lastUpdated: new Date()
        };

        const saved = await localStorageRAG.saveChapterData(chapterId, chapterData);
        
        if (saved) {
          result.successfulFiles++;
          result.processedChapters.push(chapterId);
          console.log(`✅ Successfully processed ${file.name}`);
        } else {
          result.errors.push(`${file.name}: Failed to save chapter data`);
        }

      } catch (error) {
        const errorMsg = `${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(`❌ Error processing ${file.name}:`, error);
      }
    }

    return result;
  }

  async loadSampleData(): Promise<ProcessingResult> {
    const sampleFiles = [
      new File([''], 'mechanics.pdf', { type: 'application/pdf' }),
      new File([''], 'thermodynamics.pdf', { type: 'application/pdf' }),
      new File([''], 'electricity.pdf', { type: 'application/pdf' }),
      new File([''], 'waves.pdf', { type: 'application/pdf' }),
      new File([''], 'optics.pdf', { type: 'application/pdf' }),
      new File([''], 'force.pdf', { type: 'application/pdf' }),
      new File([''], 'motion.pdf', { type: 'application/pdf' }),
      new File([''], 'energy.pdf', { type: 'application/pdf' }),
      new File([''], 'light.pdf', { type: 'application/pdf' }),
      new File([''], 'pressure.pdf', { type: 'application/pdf' }),
      new File([''], 'magnetic-effects.pdf', { type: 'application/pdf' })
    ];

    return this.processPDFFiles(sampleFiles);
  }
}

export const browserPDFProcessor = new BrowserPDFProcessor();
