import React from 'react';
import PhysicsDiagram from './PhysicsDiagram';

const LessonWithDiagrams: React.FC = () => {
  return (
    <div className="lesson-content max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Force and Motion - Visual Learning
      </h1>
      
      <div className="space-y-8">
        {/* Free Body Diagram Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Understanding Forces with Free Body Diagrams
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            A free body diagram is a visual representation of all the forces acting on an object. 
            This helps us understand the net force and predict the object's motion.
          </p>
          
          <PhysicsDiagram 
            type="freeBodyDiagram"
            description="Basic free body diagram showing weight and normal force on a stationary block"
          />
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Key Points:</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Red arrow represents weight (mg) - always points downward</li>
              <li>• Blue arrow represents normal force (N) - perpendicular to surface</li>
              <li>• When forces are balanced, the object remains at rest</li>
            </ul>
          </div>
        </section>

        {/* Inclined Plane Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Forces on an Inclined Plane
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            When an object is placed on an inclined plane, the forces become more complex. 
            We need to consider the component of weight along the plane and friction.
          </p>
          
          <PhysicsDiagram 
            type="inclinedPlane"
            description="Forces acting on a block on an inclined plane including weight, normal force, and friction"
          />
          
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Analysis:</h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Weight can be resolved into components parallel and perpendicular to the plane</li>
              <li>• Normal force is perpendicular to the surface</li>
              <li>• Friction opposes motion along the plane</li>
            </ul>
          </div>
        </section>

        {/* Circuit Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Electric Circuits
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Understanding how electrical components work together in circuits is fundamental to physics. 
            Let's explore different circuit configurations.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Simple Circuit</h3>
              <PhysicsDiagram 
                type="simpleCircuit"
                description="Basic circuit with battery, resistor, and bulb in series"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Parallel Circuit</h3>
              <PhysicsDiagram 
                type="parallelCircuit"
                description="Parallel circuit with multiple resistors and a switch"
              />
            </div>
          </div>
        </section>

        {/* Wave Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Wave Properties
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Waves are fundamental to understanding many physical phenomena. 
            Let's visualize different types of waves and their properties.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Transverse Wave</h3>
              <PhysicsDiagram 
                type="transverseWave"
                description="Wave where particles move perpendicular to the direction of wave propagation"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Longitudinal Wave</h3>
              <PhysicsDiagram 
                type="longitudinalWave"
                description="Wave where particles move parallel to the direction of wave propagation"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Standing Wave</h3>
              <PhysicsDiagram 
                type="standingWave"
                description="Interference pattern created by two waves of the same frequency traveling in opposite directions"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LessonWithDiagrams;
