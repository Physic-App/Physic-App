import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <h3 className="text-2xl font-bold text-gradient-primary mb-4">
              PhysicsFlow
            </h3>
            
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Master physics through 3D interactive learning with personalized paths and AI-powered insights.
            </p>

            <div className="flex gap-4">
              {['🐦', '📘', '💼', '📺', '📷'].map((icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="w-12 h-12 glass rounded-full flex items-center justify-center text-lg hover:text-indigo-400 transition-colors duration-300"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {[
            {
              title: 'Product',
              links: ['Features', 'Subjects', 'Pricing', 'Mobile App', 'API']
            },
            {
              title: 'Resources',
              links: ['Documentation', 'Tutorials', 'Blog', 'Community', 'Help Center']
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Press', 'Contact', 'Privacy Policy']
            }
          ].map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold text-white mb-6">
                {section.title}
              </h4>
              
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <motion.a
                      href="#"
                      className="text-gray-400 hover:text-indigo-400 transition-colors duration-300 text-sm"
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-white/10 text-center"
        >
          <p className="text-gray-400 text-sm">
            &copy; 2024 PhysicsFlow. All rights reserved. Made with ❤️ for physics learners worldwide.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
