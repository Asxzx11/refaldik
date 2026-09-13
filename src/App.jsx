import React from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Karya from './components/Karya';
import Footer from './components/Footer';
import AdminModal from './components/AdminModal';
import './App.css';

export default function App() {
  return (
    <PortfolioProvider>
      <div className="pop-app-layout">
        {/* Sticky Header */}
        <Navbar />

        {/* Main Content */}
        <main className="pop-main-content">
          {/* 1. Hero Section (with Real-Time About Me) */}
          <Hero />

          {/* 2. Skill & Keahlian */}
          <Skills />

          {/* 3. Galeri Karya & Portofolio (Real-Time Synchronized) */}
          <Karya />
        </main>

        {/* Footer */}
        <Footer />

        {/* Secret Admin Modal (Ctrl + Shift + P) */}
        <AdminModal />
      </div>
    </PortfolioProvider>
  );
}
