import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturesGrid } from './components/FeaturesGrid';
import { LiveDemoSection } from './components/LiveDemoSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/privacy' || window.location.hash === '#privacy') {
    return <PrivacyPolicyPage />;
  }

  if (currentPath === '/terms' || window.location.hash === '#terms') {
    return <TermsOfServicePage />;
  }

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] selection:bg-[#25D366]/30 selection:text-[#25D366]">
      <Navbar />
      <main>
        <Hero />
        <FeaturesGrid />
        <LiveDemoSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
