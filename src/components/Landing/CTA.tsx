import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CTA: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section id="cta" className="py-24 gradient-primary relative overflow-hidden">
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
            Ready to Transform Your Physics Learning?
          </h2>

          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join over 50,000 students who have mastered physics through interactive 3D learning. Start your journey today!
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-center items-center"
          >
            <motion.button
              onClick={() => navigate('/auth')}
              className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 group relative overflow-hidden shadow-2xl"
              whileHover={{ y: -3, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Get Started with Physics</span>
              <motion.span
                className="relative z-10"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🚀
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
