import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoIntro from './components/VideoIntro';
import Skills from './components/Skills';
import Karya from './components/Karya';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <div className="pop-app-layout">
      {/* Sticky Header */}
      <Navbar />

      {/* Main Content */}
      <main className="pop-main-content">
        {/* 1. Hero Section (Screenshot Replica) */}
        <Hero />

        {/* 2. Video Perkenalan */}
        <VideoIntro />

        {/* 3. Skill & Keahlian */}
        <Skills />

        {/* 4. Galeri Karya & Portofolio */}
        <Karya />

        {/* 5. Kontak */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
