import { useState } from 'react';
import { X, Play, RotateCcw, MousePointer, Zap, Target, Activity } from 'lucide-react';

interface HelpModalProps {
  activeTab: string;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ activeTab, onClose }) => {
  const [currentSection, setCurrentSection] = useState('overview');

  const getTabInfo = () => {
    switch (activeTab) {
      case 'newton':
        return {
          title: "Newton's Laws Simulator",
          description: "Explore the three fundamental laws of motion through interactive simulations",
          concepts: [
            "First Law (Inertia): Objects at rest stay at rest, objects in motion stay in motion unless acted upon by an external force",
            "Second Law (F = ma): Force equals mass times acceleration. The acceleration is directly proportional to the net force and inversely proportional to the mass", 
            "Third Law (Action-Reaction): For every action, there's an equal and opposite reaction. Forces always occur in pairs"
          ],
          tips: [
            "Try changing the applied force to see how it affects acceleration - notice the direct relationship",
            "Adjust the mass to observe the inverse relationship with acceleration - heavier objects accelerate less",
            "Watch the force vectors to understand direction and magnitude - blue arrows show applied force, red shows weight",
            "Use the friction slider to see how friction opposes motion and affects acceleration",
            "Try different environments (Earth, Moon, Mars, Space) to see how gravity affects the object"
          ],
          mechanics: [
            "The simulator calculates net force by adding all individual forces (applied force, weight, friction, normal force)",
            "Acceleration is calculated using F = ma, where F is net force and m is mass",
            "Velocity is updated each frame using v = v₀ + at, where a is acceleration and t is time step",
            "Position is updated using x = x₀ + vt + ½at² for realistic motion",
            "Force vectors are drawn with length proportional to magnitude and direction showing force direction"
          ]
        };
      case 'friction':
        return {
          title: "Friction Simulator",
          description: "Understand how friction affects motion on different surfaces",
          concepts: [
            "Static friction prevents objects from starting to move",
            "Kinetic friction opposes motion once it starts",
            "Friction depends on surface type and normal force"
          ],
          tips: [
            "Switch between smooth and rough surfaces to see the difference",
            "Increase the friction coefficient to see more resistance",
            "Notice how friction always opposes the direction of motion"
          ]
        };
      case 'momentum':
        return {
          title: "Momentum Simulator", 
          description: "Study momentum, impulse, and conservation of momentum",
          concepts: [
            "Momentum = mass × velocity (p = mv)",
            "Impulse = force × time (J = FΔt)",
            "Momentum is conserved in isolated systems"
          ],
          tips: [
            "Watch how momentum changes with velocity and mass",
            "Apply forces for different durations to see impulse effects",
            "Try collisions to observe momentum conservation"
          ]
        };
      case 'collision':
        return {
          title: "Collision Simulator",
          description: "Explore elastic and inelastic collisions between objects",
          concepts: [
            "Elastic collisions conserve both momentum and kinetic energy",
            "Inelastic collisions conserve momentum but not kinetic energy",
            "Perfectly inelastic collisions result in objects sticking together"
          ],
          tips: [
            "Adjust the restitution coefficient for different collision types",
            "Watch how energy is lost in inelastic collisions",
            "Try different masses and velocities for varied collision outcomes"
          ]
        };
      case 'gravity':
        return {
          title: "Gravity Simulator",
          description: "Understand gravitational forces and orbital mechanics",
          concepts: [
            "Gravitational force depends on mass and distance",
            "Objects fall with constant acceleration (g = 9.81 m/s²)",
            "Orbital motion results from the balance of gravity and inertia"
          ],
          tips: [
            "Change the environment to see different gravitational effects",
            "Watch how gravity always points toward the center of mass",
            "Try different initial velocities to create orbital paths"
          ]
        };
      case 'vectors':
        return {
          title: "Force Vectors Simulator",
          description: "Learn about vector addition and force components",
          concepts: [
            "Forces have both magnitude and direction",
            "Vectors can be added using the parallelogram rule",
            "Net force is the vector sum of all individual forces"
          ],
          tips: [
            "Watch how multiple forces combine to create net force",
            "Use the vector scale to better see force directions",
            "Try different angles to see how direction affects motion"
          ]
        };
      default:
        return {
          title: "Physics Simulator",
          description: "Interactive learning platform for physics concepts",
          concepts: [],
          tips: []
        };
    }
  };

  const tabInfo = getTabInfo();

  const helpSections = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">{tabInfo.title}</h3>
          <p className="text-slate-300">{tabInfo.description}</p>
          
          <div>
            <h4 className="text-md font-semibold text-white mb-2">Key Concepts:</h4>
            <ul className="space-y-1">
              {tabInfo.concepts.map((concept, index) => (
                <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'mechanics',
      title: 'Mechanics',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">How It Works</h3>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-200 mb-2">🔧 Physics Engine:</h4>
            <ul className="space-y-1">
              {tabInfo.mechanics?.map((mechanic, index) => (
                <li key={index} className="text-blue-100 text-sm flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{mechanic}</span>
                </li>
              )) || [
                "Real-time physics calculations using Newton's laws",
                "Force vectors are calculated and displayed visually",
                "Object motion follows realistic physics principles",
                "Collision detection and response for boundary interactions"
              ]}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'controls',
      title: 'Controls',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">How to Use</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Simulation Controls
              </h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Click Play to start the simulation</li>
                <li>• Click Pause to stop the simulation</li>
                <li>• Click Reset to return to initial state</li>
                <li>• Use Spacebar to play/pause</li>
                <li>• Use R key to reset</li>
              </ul>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Interaction
              </h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Drag objects to change position</li>
                <li>• Use sliders to adjust parameters</li>
                <li>• Toggle display options on/off</li>
                <li>• Watch real-time data updates</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Tips & Tricks',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Learning Tips</h3>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-200 mb-2">💡 Pro Tips:</h4>
            <ul className="space-y-1">
              {tabInfo.tips.map((tip, index) => (
                <li key={index} className="text-blue-100 text-sm flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-green-200 mb-2">🎯 Learning Strategy:</h4>
            <ul className="space-y-1 text-green-100 text-sm">
              <li>• Start with simple scenarios and gradually increase complexity</li>
              <li>• Make predictions before running simulations</li>
              <li>• Compare different parameter values</li>
              <li>• Pay attention to the relationship between variables</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full border border-slate-700 max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-700/50 p-6 border-r border-slate-600">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Help</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {helpSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {helpSections.find(s => s.id === currentSection)?.content}
          </div>
        </div>
      </div>
    </div>
  );
};
