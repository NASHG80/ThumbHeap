import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { ThumbnailEditor } from '../components/ThumbnailEditor';
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
        <ThumbnailEditor />
        <About />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};
