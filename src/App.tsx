import React from 'react';
import { ThemeProvider } from './lib/ThemeContext';
import { Navbar } from './components/Navbar';
import { BackgroundLines } from './components/BackgroundLines';
import { Hero } from './components/Hero';
import { BusinessLines } from './components/BusinessLines';
import { UpstreamSection } from './components/UpstreamSection';
import { Ecosystem } from './components/Ecosystem';
import { SoftwareFactory } from './components/SoftwareFactory';
import { Architecture } from './components/Architecture';
import { Benefits } from './components/Benefits';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen selection:bg-blue-500/30">
        <BackgroundLines />
        <Navbar />
        <main>
          <Hero />
          <BusinessLines />
          <UpstreamSection />
          <Ecosystem />
          <SoftwareFactory />
          <Architecture />
          <Benefits />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
