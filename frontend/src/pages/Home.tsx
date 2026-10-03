import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { About } from '../components/About';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121214] font-sans selection:bg-purple-100 selection:text-purple-900">
      <Navbar />
      <main className="w-full">
        <Hero />
        <Features />
        <About />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};
