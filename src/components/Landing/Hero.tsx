import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formulas = [
    'E = mc²', 'F = ma', 'λ = v/f', 'ΔE = hf', '∇ × B = μ₀J', 'ψ(x,t) = Ae^(i(kx-ωt))',
    'P = F/A', 'v = u + at', 'W = F·d', 'KE = ½mv²', 'PE = mgh', 'Q = mcΔT',
    'V = IR', 'P = VI', 'F = kx', 'T = 2π√(l/g)', '∇²φ = ρ/ε₀', 'B = μ₀I/2πr',
    'n₁sinθ₁ = n₂sinθ₂', 'f = 1/T', 'v = fλ', 'F = qvB', 'τ = rF sinθ', 'I = Q/t'
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
      </div>

      {/* Floating Physics Formulas */}
      <div className="absolute inset-0 pointer-events-none">
        {formulas.map((formula, index) => (
          <motion.div
            key={index}
            className="absolute text-gray-400/40 font-mono text-lg font-medium select-none"
            style={{
              top: `${5 + (index * 4)}%`,
              left: `${5 + (index * 4)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 2, -2, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8 + index,
              repeat: Infinity,
              delay: index * 1.5,
            }}
          >
            {formula}
          </motion.div>
        ))}
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-sm ${
              i === 0 ? 'w-16 h-16 gradient-primary' :
              i === 1 ? 'w-12 h-12 gradient-secondary' :
              'w-20 h-20 gradient-accent'
            }`}
            style={{
              top: `${20 + i * 30}%`,
              left: `${15 + i * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, -15, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight"
          >
            <span className="text-gradient block">Master Physics</span>
            <motion.span
              className="text-gradient-primary block mt-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Through 3D Learning
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Experience physics like never before with interactive 3D simulations and AI-powered learning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              className="gradient-primary text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 group relative overflow-hidden"
              whileHover={{ y: -3, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/auth');
              }}
            >
              <span className="relative z-10">Start Learning Free</span>
              <motion.span
                className="relative z-10"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>

          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {[
              { number: '50K+', label: 'Active Students' },
              { number: '95%', label: 'Success Rate' },
              { number: '200+', label: 'Simulations' },
              { number: '24/7', label: 'AI Support' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl md:text-3xl font-bold text-gradient-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-400/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-indigo-500 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
