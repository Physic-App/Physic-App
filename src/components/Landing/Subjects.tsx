import React from 'react';
import { motion } from 'framer-motion';

const Subjects: React.FC = () => {
  const subjects = [
    {
      icon: '💪',
      title: 'Force and Pressure',
      subtitle: 'Forces & Pressure Effects',
      description: 'Understand how forces create pressure and their applications in daily life.',
    },
    {
      icon: '🛞',
      title: 'Friction',
      subtitle: 'Surface Interactions',
      description: 'Explore friction forces and their role in motion and energy transfer.',
    },
    {
      icon: '⚡',
      title: 'Electric Current and Its Effects',
      subtitle: 'Electricity & Magnetism',
      description: 'Discover how electric current creates magnetic effects and powers our world.',
    },
    {
      icon: '🏃',
      title: 'Motion',
      subtitle: 'Kinematics & Dynamics',
      description: 'Master the fundamentals of motion, velocity, and acceleration.',
    },
    {
      icon: '⚖️',
      title: 'Force and Laws of Motion',
      subtitle: 'Newton\'s Laws',
      description: 'Learn Newton\'s three laws and their applications in real-world scenarios.',
    },
    {
      icon: '🌍',
      title: 'Gravitation',
      subtitle: 'Universal Attraction',
      description: 'Understand gravitational forces and their effects on celestial bodies.',
    },
    {
      icon: '💡',
      title: 'Light: Reflection and Refraction',
      subtitle: 'Optics & Light',
      description: 'Explore how light behaves when it reflects and refracts through materials.',
    },
    {
      icon: '🔋',
      title: 'Electricity',
      subtitle: 'Electric Circuits',
      description: 'Master electric circuits, voltage, current, and electrical power.',
    },
    {
      icon: '🧲',
      title: 'Magnetic Effects of Electric Current',
      subtitle: 'Electromagnetism',
      description: 'Discover the magnetic fields created by electric currents and their applications.',
    },
    {
      icon: '⚡',
      title: 'Work and Energy',
      subtitle: 'Energy Conservation',
      description: 'Learn about work, energy transformations, and conservation principles.',
    },
    {
      icon: '🔥',
      title: 'Thermodynamics',
      subtitle: 'Heat & Energy Transfer',
      description: 'Explore energy transfer, entropy, and the fundamental laws governing heat and temperature.',
    },
    {
      icon: '🌌',
      title: 'Quantum Physics',
      subtitle: 'Quantum Mechanics',
      description: 'Dive into the quantum world with wave-particle duality and uncertainty principles.',
    },
    {
      icon: '🌊',
      title: 'Wave Physics',
      subtitle: 'Waves & Optics',
      description: 'Visualize wave propagation, interference, diffraction, and optical phenomena.',
    },
    {
      icon: '☀️',
      title: 'Modern Physics',
      subtitle: 'Relativity & Nuclear',
      description: 'Explore Einstein\'s theories, nuclear physics, and cutting-edge discoveries.',
    },
  ];

  return (
    <section id="subjects" className="py-24 bg-black relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-block gradient-primary text-white px-6 py-3 rounded-full font-bold text-sm mb-6"
          >
            Subjects
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gradient">
            Explore Physics Subjects
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Master every branch of physics with specialized learning paths and interactive content.
          </p>
        </motion.div>

        {/* Dual-Row Scrolling Animation */}
        <div className="space-y-8 overflow-hidden">
          {/* First Row - Right to Left */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: [0, -2200] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              style={{ width: 'max-content' }}
            >
              {[...subjects.slice(0, 7), ...subjects.slice(0, 7), ...subjects.slice(0, 7)].map((subject, index) => (
                <motion.div
                  key={`row1-${index}`}
                  className="group flex-shrink-0 w-80"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="relative h-80 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 cursor-pointer overflow-hidden"
                    whileHover={{ 
                      y: -8,
                      boxShadow: '0 25px 50px rgba(99, 102, 241, 0.15)',
                      borderColor: 'rgba(99, 102, 241, 0.4)',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      {/* Icon with background */}
                      <div className="flex items-center justify-between mb-4">
                        <motion.div 
                          className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:shadow-indigo-500/25"
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {subject.icon}
                        </motion.div>
                        
                        {/* Progress indicator */}
                        <motion.div
                          className="w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100"
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        />
                      </div>
                      
                      {/* Title and subtitle */}
                      <div className="mb-3">
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors duration-300">
                          {subject.title}
                        </h3>
                        <p className="text-indigo-400 font-medium text-sm bg-indigo-500/10 px-3 py-1 rounded-full inline-block mb-3">
                          {subject.subtitle}
                        </p>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed text-sm transition-colors duration-300 line-clamp-3">
                        {subject.description}
                      </p>
                    </div>
                    
                    {/* Hover effect border */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-indigo-500/0 group-hover:border-indigo-500/30 transition-colors duration-300"
                      whileHover={{
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                      }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Second Row - Left to Right */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: [-2200, 0] }}
              transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
              style={{ width: 'max-content' }}
            >
              {[...subjects.slice(7), ...subjects.slice(7), ...subjects.slice(7)].map((subject, index) => (
                <motion.div
                  key={`row2-${index}`}
                  className="group flex-shrink-0 w-80"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="relative h-80 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 cursor-pointer overflow-hidden"
                    whileHover={{ 
                      y: -8,
                      boxShadow: '0 25px 50px rgba(99, 102, 241, 0.15)',
                      borderColor: 'rgba(99, 102, 241, 0.4)',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      {/* Icon with background */}
                      <div className="flex items-center justify-between mb-4">
                        <motion.div 
                          className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:shadow-indigo-500/25"
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {subject.icon}
                        </motion.div>
                        
                        {/* Progress indicator */}
                        <motion.div
                          className="w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100"
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        />
                      </div>
                      
                      {/* Title and subtitle */}
                      <div className="mb-3">
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors duration-300">
                          {subject.title}
                        </h3>
                        <p className="text-indigo-400 font-medium text-sm bg-indigo-500/10 px-3 py-1 rounded-full inline-block mb-3">
                          {subject.subtitle}
                        </p>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed text-sm transition-colors duration-300 line-clamp-3">
                        {subject.description}
                      </p>
                    </div>
                    
                    {/* Hover effect border */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-indigo-500/0 group-hover:border-indigo-500/30 transition-colors duration-300"
                      whileHover={{
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                      }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subjects;
