import React from 'react';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  const features = [
    {
      icon: '🧊',
      title: '3D Interactive Simulations',
      description: 'Visualize complex physics phenomena through immersive 3D models and real-time simulations.',
    },
    {
      icon: '🧠',
      title: 'AI-Powered Learning',
      description: 'Personalized learning paths powered by artificial intelligence that adapts to your pace.',
    },
    {
      icon: '🎮',
      title: 'Gamified Experience',
      description: 'Earn achievements, maintain streaks, and compete with peers in a fun environment.',
    },
    {
      icon: '📱',
      title: 'Cross-Platform Access',
      description: 'Learn anywhere, anytime with seamless synchronization across all devices.',
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Track your learning journey with detailed analytics and personalized recommendations.',
    },
    {
      icon: '🎓',
      title: 'Expert Content',
      description: 'Learn from curriculum designed by physics professors from top universities.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-gray-900 relative overflow-hidden">
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
            Features
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gradient">
            Why Choose PhysicsFlow?
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Experience physics like never before with cutting-edge technology and proven learning methodologies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <motion.div
                className="glass p-8 h-full relative overflow-hidden cursor-pointer border-2 border-transparent"
                whileHover={{ 
                  y: -12, 
                  boxShadow: '0 25px 60px rgba(99, 102, 241, 0.3)',
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {/* Animated gradient background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className="text-5xl mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-indigo-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Hover arrow indicator */}
                  <motion.div
                    className="absolute bottom-4 right-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                  >
                    <span className="text-xl">→</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
