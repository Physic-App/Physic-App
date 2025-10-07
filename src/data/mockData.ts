import { Chapter } from '../types/chatbot';
import { ChatSession } from '../types/chatbot';

export const mockChapters: Chapter[] = [
  {
    id: 'force-and-pressure',
    title: 'Force and Pressure',
    description: 'Understanding forces, pressure, and their applications in daily life'
  },
  {
    id: 'friction',
    title: 'Friction',
    description: 'Types of friction, factors affecting friction, and its applications'
  },
  {
    id: 'electric-current',
    title: 'Electric Current and Its Effects',
    description: 'Electric current, circuits, heating and magnetic effects'
  },
  {
    id: 'motion',
    title: 'Motion',
    description: 'Types of motion, speed, velocity, and acceleration'
  },
  {
    id: 'force-and-laws',
    title: 'Force and Laws of Motion',
    description: 'Newton\'s laws of motion and their applications'
  },
  {
    id: 'gravitation',
    title: 'Gravitation',
    description: 'Universal law of gravitation, weight, and gravitational phenomena'
  },
  {
    id: 'light-reflection',
    title: 'Light: Reflection and Refraction',
    description: 'Properties of light, mirrors, lenses, and optical phenomena'
  },
  {
    id: 'electricity',
    title: 'Electricity',
    description: 'Electric charge, potential, current, and electrical devices'
  },
  {
    id: 'magnetic-effects',
    title: 'Magnetic Effects of Electric Current',
    description: 'Electromagnets, motors, generators, and electromagnetic induction'
  },
  {
    id: 'work-and-energy',
    title: 'Work and Energy',
    description: 'Work, energy, power, and conservation of energy'
  }
];

export const mockChatSessions: ChatSession[] = [
  {
    id: '1',
    title: 'Kinematics Problems',
    chapterId: 'kinematics',
    messages: [
      {
        id: '1-1',
        content: 'What is the difference between speed and velocity?',
        isBot: false,
        timestamp: new Date('2024-01-15T10:30:00'),
      },
      {
        id: '1-2',
        content: 'Speed is a scalar quantity that measures how fast an object is moving, while velocity is a vector quantity that includes both speed and direction.\n\n**Speed:** $|v| = \\frac{distance}{time}$\n\n**Velocity:** $\\vec{v} = \\frac{displacement}{time}$',
        isBot: true,
        timestamp: new Date('2024-01-15T10:30:30'),
      }
    ],
    createdAt: new Date('2024-01-15T10:30:00'),
    lastActivity: new Date('2024-01-15T10:35:00'),
  },
  {
    id: '2',
    title: 'Work Energy Theorem',
    chapterId: 'work-energy',
    messages: [
      {
        id: '2-1',
        content: 'Can you explain the work-energy theorem with an example?',
        isBot: false,
        timestamp: new Date('2024-01-14T14:20:00'),
      },
      {
        id: '2-2',
        content: 'The **Work-Energy Theorem** states that the work done on an object equals the change in its kinetic energy:\n\n$W = \\Delta KE = KE_f - KE_i$\n\n**Example:** A 2 kg ball is thrown with initial velocity 5 m/s and final velocity 10 m/s.\n\n$W = \\frac{1}{2}m(v_f^2 - v_i^2) = \\frac{1}{2}(2)(10^2 - 5^2) = 75 J$',
        isBot: true,
        timestamp: new Date('2024-01-14T14:20:45'),
      }
    ],
    createdAt: new Date('2024-01-14T14:20:00'),
    lastActivity: new Date('2024-01-14T14:25:00'),
  },
  {
    id: '3',
    title: 'Circular Motion',
    chapterId: 'motion-in-plane',
    messages: [
      {
        id: '3-1',
        content: 'What is centripetal acceleration?',
        isBot: false,
        timestamp: new Date('2024-01-13T16:45:00'),
      }
    ],
    createdAt: new Date('2024-01-13T16:45:00'),
    lastActivity: new Date('2024-01-13T16:45:00'),
  }
];

export const generateMockResponse = (question: string, chapterId: string): string => {
  // Check for greetings and casual messages
  const greetingPatterns = [
    /^(hi|hello|hey|hiya|howdy)$/i,
    /^(good morning|good afternoon|good evening)$/i,
    /^(how are you|how's it going|what's up)$/i,
    /^(thanks|thank you|thx)$/i,
    /^(bye|goodbye|see you|farewell)$/i
  ];
  
  const isGreeting = greetingPatterns.some(pattern => pattern.test(question.trim()));
  
  if (isGreeting) {
    const chapterTitle = mockChapters.find(c => c.id === chapterId)?.title || 'Physics';
    return `Hello! 👋 I'm your physics assistant for **${chapterTitle}**. I'm here to help you understand concepts, solve problems, and answer any questions you have about this topic. What would you like to learn about today?`;
  }

  // Handle very short or unclear messages
  if (question.trim().length < 3) {
    const chapterTitle = mockChapters.find(c => c.id === chapterId)?.title || 'Physics';
    return `I'd be happy to help you with **${chapterTitle}**! Could you please ask a more specific question? For example, you could ask about:\n\n- Key concepts and definitions\n- Formulas and equations\n- Real-world applications\n- Practice problems\n- Step-by-step explanations`;
  }

  const responses = {
    'force-and-pressure': [
      "**Force** is a push or pull that can change the state of motion of an object or change its shape.\n\n**Key Properties of Force:**\n- Force is a vector quantity (has magnitude and direction)\n- Unit: Newton (N)\n- Symbol: F\n\n**Types of Forces:**\n1. **Contact Forces:** Applied when objects touch (friction, normal force)\n2. **Non-contact Forces:** Act at a distance (gravity, magnetic force)\n\n**Force Formula:** $F = ma$ (Newton's Second Law)\n\n**Pressure** is force per unit area: $P = \\frac{F}{A}$\n- Unit: Pascal (Pa) or N/m²\n- Pressure increases when force increases or area decreases",
      
      "**Pressure in Daily Life:**\n\n**High Pressure Examples:**\n- Sharp knife cuts easily (small area = high pressure)\n- Nail penetrates wood (concentrated force)\n\n**Low Pressure Examples:**\n- Wide snowshoes prevent sinking (large area = low pressure)\n- Foundation of buildings (distributed weight)\n\n**Liquid Pressure:**\n- Pressure increases with depth: $P = \\rho gh$\n- Where ρ = density, g = gravity, h = depth\n- Pressure acts equally in all directions in liquids",
      
      "**Atmospheric Pressure:**\n- Air has weight and exerts pressure\n- Standard atmospheric pressure = 101,325 Pa\n- Decreases with altitude\n- Measured using barometers\n\n**Applications:**\n- Hydraulic systems use pressure to multiply force\n- Suction cups work due to atmospheric pressure\n- Blood pressure measurement in medicine"
    ],
    'friction': [
      "**Friction** is the force that opposes relative motion between two surfaces in contact.\n\n**Types of Friction:**\n1. **Static Friction:** Prevents objects from starting to move\n2. **Kinetic Friction:** Opposes motion of moving objects\n3. **Rolling Friction:** When objects roll over surfaces\n\n**Factors Affecting Friction:**\n- Nature of surfaces (rough vs smooth)\n- Normal force between surfaces\n- Area of contact (for most cases, friction is independent of area)\n\n**Friction Formula:** $f = \\mu N$\n- Where μ = coefficient of friction, N = normal force",
      
      "**Coefficient of Friction:**\n- Static: $\\mu_s$ (usually higher than kinetic)\n- Kinetic: $\\mu_k$ (constant for given surfaces)\n\n**Advantages of Friction:**\n- Walking, driving, gripping objects\n- Braking systems\n- Writing with pen/pencil\n\n**Disadvantages:**\n- Wears out machine parts\n- Reduces efficiency\n- Generates heat\n\n**Reducing Friction:**\n- Lubricants (oil, grease)\n- Ball bearings\n- Smooth surfaces"
    ],
    'electric-current': [
      "**Electric Current** is the flow of electric charge through a conductor.\n\n**Current Formula:** $I = \\frac{Q}{t}$\n- I = current (Amperes, A)\n- Q = charge (Coulombs, C)\n- t = time (seconds, s)\n\n**Types of Current:**\n1. **Direct Current (DC):** Flows in one direction (batteries)\n2. **Alternating Current (AC):** Changes direction periodically (household electricity)\n\n**Effects of Electric Current:**\n1. **Heating Effect:** $H = I^2Rt$ (Joule's heating law)\n2. **Magnetic Effect:** Current creates magnetic field\n3. **Chemical Effect:** Electrolysis in solutions",
      
      "**Electric Circuit Components:**\n- **Battery:** Provides voltage (potential difference)\n- **Resistor:** Opposes current flow\n- **Switch:** Controls current flow\n- **Bulb:** Converts electrical energy to light and heat\n\n**Ohm's Law:** $V = IR$\n- V = voltage, I = current, R = resistance\n\n**Series vs Parallel:**\n- **Series:** Same current, voltage divides\n- **Parallel:** Same voltage, current divides"
    ],
    kinematics: [
      "In kinematics, we study motion without considering the forces causing it. When dealing with motion in a straight line, we use three key equations:\n\n**First Equation:** $v = u + at$\n\nWhere:\n- $v$ = final velocity\n- $u$ = initial velocity  \n- $a$ = acceleration\n- $t$ = time\n\nThis equation shows how velocity changes linearly with time under constant acceleration.",
      
      "For displacement calculations, we use:\n\n**Second Equation:** $s = ut + \\frac{1}{2}at^2$\n\nThis quadratic relationship shows that displacement increases as the square of time under constant acceleration.\n\n**Third Equation:** $v^2 = u^2 + 2as$\n\nThis is particularly useful when time is not given in the problem."
    ],
    'work-energy': [
      "The **Work-Energy Theorem** is fundamental in physics:\n\n**Work done = Change in Kinetic Energy**\n\n$W = \\Delta KE = \\frac{1}{2}mv^2 - \\frac{1}{2}mu^2$\n\nWhen calculating work:\n- $W = F \\cdot s \\cdot \\cos\\theta$ (when force is constant)\n- $\\theta$ is the angle between force and displacement\n\nFor variable forces, we integrate: $W = \\int F \\, ds$",
      
      "**Conservation of Energy** states that energy cannot be created or destroyed, only transformed:\n\n$E_{total} = KE + PE = constant$\n\nFor a freely falling object:\n$mgh + \\frac{1}{2}mv^2 = constant$\n\nThis principle helps solve complex motion problems elegantly."
    ],
    'motion': [
      "**Motion** is the change in position of an object with respect to time.\n\n**Types of Motion:**\n1. **Linear Motion:** Along a straight line\n2. **Circular Motion:** Along a circular path\n3. **Periodic Motion:** Repeats after regular intervals\n\n**Speed vs Velocity:**\n- **Speed:** Scalar quantity, $speed = \\frac{distance}{time}$\n- **Velocity:** Vector quantity, $velocity = \\frac{displacement}{time}$\n\n**Acceleration:** Rate of change of velocity\n$a = \\frac{v - u}{t}$\n- Where v = final velocity, u = initial velocity, t = time",
      
      "**Equations of Motion:**\n1. $v = u + at$\n2. $s = ut + \\frac{1}{2}at^2$\n3. $v^2 = u^2 + 2as$\n\n**Graphical Representation:**\n- **Distance-Time Graph:** Slope = speed\n- **Velocity-Time Graph:** Slope = acceleration, Area = displacement\n\n**Uniform Motion:** Constant speed\n**Non-uniform Motion:** Changing speed"
    ],
    'force-and-laws': [
      "**Newton's Laws of Motion** are fundamental principles governing motion:\n\n**First Law (Law of Inertia):**\nAn object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.\n\n**Second Law:**\n$F = ma$\n- Force equals mass times acceleration\n- Direction of acceleration is same as direction of force\n\n**Third Law (Action-Reaction):**\nFor every action, there is an equal and opposite reaction.",
      
      "**Applications of Newton's Laws:**\n\n**First Law Examples:**\n- Seatbelt safety (prevents sudden stops)\n- Car braking (friction opposes motion)\n\n**Second Law Examples:**\n- Heavier objects need more force to accelerate\n- Rocket propulsion\n\n**Third Law Examples:**\n- Walking (foot pushes ground, ground pushes foot)\n- Swimming (water pushes back)\n- Gun recoil"
    ]
  };

  const chapterResponses = responses[chapterId as keyof typeof responses] || [
    `I can help you understand concepts related to **${mockChapters.find(c => c.id === chapterId)?.title}**. Could you please ask a more specific question about this chapter?`
  ];
  
  return chapterResponses[Math.floor(Math.random() * chapterResponses.length)];
};

export const fallbackMessage = "🤔 I couldn't find relevant information in the current chapter for your question. Please make sure your question is related to the selected chapter, or try rephrasing it with more specific physics terms.\n\n**Tips for better responses:**\n- Ask about specific concepts (e.g., 'What is pressure?')\n- Request examples or applications\n- Ask for step-by-step explanations\n- Mention formulas you want to understand";