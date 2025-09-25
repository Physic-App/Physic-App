import React from 'react';
import { motion } from 'framer-motion';

const Testimonials: React.FC = () => {

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Engineering Student, MIT',
      avatar: 'SC',
      quote: 'Physics finally makes sense! The 3D simulations helped me visualize electromagnetic fields like never before. My grades improved from C to A+ in just one semester.',
      rating: 5,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      name: 'Alex Rodriguez',
      role: 'Physics Major, Stanford',
      avatar: 'AR',
      quote: 'The interactive quantum mechanics modules are incredible. I can actually see wave functions and probability distributions in action. This platform is a game-changer!',
      rating: 5,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      name: 'Dr. Michael Park',
      role: 'Physics Teacher, Lincoln High',
      avatar: 'MP',
      quote: 'As a high school teacher, I use PhysicsFlow to supplement my lessons. Students are more engaged and understand complex concepts much faster than traditional methods.',
      rating: 5,
      color: 'from-orange-500 to-red-500',
    },
    {
      name: 'Emma Thompson',
      role: 'Graduate Student, Caltech',
      avatar: 'ET',
      quote: 'The quantum simulations are mind-blowing! I finally understand wave-particle duality through these interactive visualizations.',
      rating: 5,
      color: 'from-pink-500 to-rose-500',
    },
    {
      name: 'David Kim',
      role: 'Physics Researcher, NASA',
      avatar: 'DK',
      quote: 'PhysicsFlow has revolutionized how I approach complex problems. The 3D modeling tools are incredibly sophisticated.',
      rating: 5,
      color: 'from-green-500 to-teal-500',
    },
    {
      name: 'Lisa Wang',
      role: 'High School Student',
      avatar: 'LW',
      quote: 'I used to hate physics, but now it\'s my favorite subject! The gamification makes learning so much fun.',
      rating: 5,
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  // Create arrays for each column
  const column1 = [...testimonials, ...testimonials]; // Duplicate for infinite scroll
  const column2 = [...testimonials.slice(2), ...testimonials.slice(0, 2), ...testimonials.slice(2), ...testimonials.slice(0, 2)]; // Different order
  const column3 = [...testimonials.slice(1), ...testimonials.slice(0, 1), ...testimonials.slice(1), ...testimonials.slice(0, 1)]; // Another order

  return (
    <section id="testimonials" className="py-24 bg-gray-900 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gradient">
            What Students Say
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who have transformed their physics learning experience.
          </p>
        </motion.div>

        {/* Vertical Scrolling Testimonials */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Column 1 */}
            <div className="space-y-6 overflow-hidden">
              <motion.div
                className="space-y-6"
                style={{ height: '1200px' }}
                animate={{ y: [0, -600] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              >
                {column1.map((testimonial, index) => (
                  <motion.div
                    key={`col1-${index}`}
                    className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative group shadow-lg"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 25px 50px rgba(99, 102, 241, 0.3), 0 0 30px rgba(99, 102, 241, 0.2)',
                      borderColor: 'rgba(99, 102, 241, 0.6)',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {testimonial.avatar}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-white transition-colors">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6 overflow-hidden">
              <motion.div
                className="space-y-6"
                style={{ height: '1200px' }}
                animate={{ y: [0, -600] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {column2.map((testimonial, index) => (
                  <motion.div
                    key={`col2-${index}`}
                    className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative group shadow-lg"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 25px 50px rgba(99, 102, 241, 0.3), 0 0 30px rgba(99, 102, 241, 0.2)',
                      borderColor: 'rgba(99, 102, 241, 0.6)',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {testimonial.avatar}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-white transition-colors">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Column 3 */}
            <div className="space-y-6 overflow-hidden">
              <motion.div
                className="space-y-6"
                style={{ height: '1200px' }}
                animate={{ y: [0, -600] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              >
                {column3.map((testimonial, index) => (
                  <motion.div
                    key={`col3-${index}`}
                    className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative group shadow-lg"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 25px 50px rgba(99, 102, 241, 0.3), 0 0 30px rgba(99, 102, 241, 0.2)',
                      borderColor: 'rgba(99, 102, 241, 0.6)',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {testimonial.avatar}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-white transition-colors">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Gradient overlays for smooth fade */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
