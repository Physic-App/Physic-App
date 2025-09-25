import React from 'react';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
  const stats = [
    { number: '50K+', label: 'Active Students', icon: '👥' },
    { number: '95%', label: 'Success Rate', icon: '🎯' },
    { number: '200+', label: 'Interactive Simulations', icon: '🧪' },
    { number: '24/7', label: 'AI Support', icon: '🤖' },
  ];

  return (
    <section id="stats" className="py-16 bg-black relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <motion.div
                className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 text-center overflow-hidden cursor-pointer shadow-xl"
                whileHover={{ 
                  y: -12,
                  scale: 1.05,
                  boxShadow: '0 25px 60px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2)',
                  borderColor: 'rgba(99, 102, 241, 0.6)',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Floating particles effect */}
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100"
                  animate={{ 
                    y: [0, -10, 0],
                    x: [0, 5, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                />
                
                <div className="relative z-10">
                  {/* Icon with enhanced animations */}
                  <motion.div
                    className="text-5xl mb-4 filter drop-shadow-lg"
                    whileHover={{ 
                      scale: 1.3, 
                      rotate: [0, -15, 15, 0],
                      y: -5
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {stat.icon}
                  </motion.div>

                  {/* Number with counting animation effect */}
                  <motion.div
                    className="text-3xl md:text-4xl font-black text-gradient-primary mb-2 filter drop-shadow-sm"
                    whileHover={{ 
                      scale: 1.15,
                      textShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.number}
                  </motion.div>

                  {/* Label with smooth color transition */}
                  <p className="text-gray-400 group-hover:text-gray-200 font-medium text-sm transition-colors duration-300">
                    {stat.label}
                  </p>
                </div>
                
                {/* Subtle border glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-indigo-500/40"
                  whileHover={{
                    boxShadow: 'inset 0 0 20px rgba(99, 102, 241, 0.1)'
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Bottom accent line */}
                <motion.div
                  className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full group-hover:w-3/4"
                  style={{ transform: 'translateX(-50%)' }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;