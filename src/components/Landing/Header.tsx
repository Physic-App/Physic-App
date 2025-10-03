import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#subjects', label: 'Subjects' },
    { href: '#stats', label: 'Stats' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
          scrolled ? 'bg-gray-900/95 backdrop-blur-xl border-b border-white/10' : ''
        }`}
      >
        <div className="container mx-auto px-6">
          <nav className="flex justify-between items-center">
            <motion.a
              href="#"
              className="text-2xl font-bold text-gradient-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PhysicsFlow
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors duration-300 font-medium relative group"
                  whileHover={{ y: -2 }}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </motion.a>
              ))}
            </div>

            {/* Desktop CTA Button */}
            <motion.button
              className="hidden md:flex gradient-primary text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 relative overflow-hidden group items-center"
              whileHover={{ y: -2, boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/auth');
              }}
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center space-y-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle mobile menu"
            >
              <motion.span
                className="w-6 h-0.5 bg-white transition-all duration-300"
                animate={{
                  rotate: mobileMenuOpen ? 45 : 0,
                  y: mobileMenuOpen ? 6 : 0,
                }}
              />
              <motion.span
                className="w-6 h-0.5 bg-white transition-all duration-300"
                animate={{
                  opacity: mobileMenuOpen ? 0 : 1,
                }}
              />
              <motion.span
                className="w-6 h-0.5 bg-white transition-all duration-300"
                animate={{
                  rotate: mobileMenuOpen ? -45 : 0,
                  y: mobileMenuOpen ? -6 : 0,
                }}
              />
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[80vw] bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-40 md:hidden"
          >
            <div className="flex flex-col h-full pt-20 px-6">
              <nav className="flex-1">
                <ul className="space-y-6">
                  {navLinks.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <a
                        href={link.href}
                        onClick={handleLinkClick}
                        className="block text-xl font-medium text-gray-400 hover:text-white transition-colors duration-300 py-2"
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pb-8"
              >
                <motion.button
                  onClick={() => {
                    handleLinkClick();
                    navigate('/auth');
                  }}
                  className="block w-full gradient-primary text-white px-6 py-4 rounded-full font-semibold text-center transition-all duration-300"
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
