import React from 'react';
import Header from '../components/Landing/Header';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import Subjects from '../components/Landing/Subjects';
import Testimonials from '../components/Landing/Testimonials';
import Stats from '../components/Landing/Stats';
import CTA from '../components/Landing/CTA';
import Footer from '../components/Landing/Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main>
        <Hero />
        <Features />
        <Subjects />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
