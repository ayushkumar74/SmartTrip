import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import TravelSearchCard from './TravelSearchCard';
import TravelCategoryNav from './TravelCategoryNav';

// Hero background images (rotate by session)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80', // lake & mountains
  'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=2000&q=80', // tropical beach
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=2000&q=80', // city skyline
];

const heroImage = HERO_IMAGES[new Date().getDay() % HERO_IMAGES.length];

const getInitialTab = (location) => {
  if (location.state?.activeTab) return location.state.activeTab;
  if (location.hash && location.hash.startsWith('#booking-')) {
    const tab = location.hash.replace('#booking-', '');
    if (['flights', 'hotels', 'packages', 'explore', 'plan'].includes(tab)) {
      return tab;
    }
  }
  return 'flights';
};

export default function HeroSection() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Traveler';

  const [activeTab, setActiveTab] = useState(() => getInitialTab(location));
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchingTransition, setIsSearchingTransition] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    setActiveTab(getInitialTab(location));
  }, [location.hash, location.state]);

  useEffect(() => {
    let ticking = false;
    let lastSticky = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (navRef.current) {
            // Using a reliable bounding rect check.
            const rect = navRef.current.getBoundingClientRect();
            const sticky = rect.top <= 0;
            
            if (sticky !== lastSticky) {
              lastSticky = sticky;
              setIsSticky(sticky);
              window.dispatchEvent(new CustomEvent('hero-sticky', { detail: sticky }));
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.dispatchEvent(new CustomEvent('hero-sticky', { detail: false }));
    };
  }, []);

  const handleSearch = (url) => {
    // Initiate transition
    setIsSearchingTransition(true);
    // Wait for the animation to complete before navigating
    setTimeout(() => {
      navigate(url);
    }, 280);
  };

  return (
    <section 
      className={`relative w-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearchingTransition ? 'h-[72px] min-h-[72px]' : ''}`} 
      style={{ minHeight: isSearchingTransition ? '72px' : '420px' }}
    >
      {/* Hero Background */}
      <div 
        className={`absolute inset-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearchingTransition ? '-translate-y-full' : 'translate-y-0'}`} 
        style={{ zIndex: 0 }}
      >
        <img
          src={heroImage}
          alt="Travel destination"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80';
          }}
        />
        {/* Gradient overlay — dark at top/bottom, lighter in middle */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/10" />
      </div>

      {/* Hero Text Content */}
      <div
        className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] pb-4 md:pt-[112px] md:pb-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearchingTransition ? '-translate-y-8 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
        style={{ zIndex: 10 }}
      >
        <div className="max-w-2xl">
          <p className="text-brand-300 text-xs font-semibold uppercase tracking-widest mb-1.5 drop-shadow">
            Welcome back, {firstName}
          </p>
          <h1 className="text-3xl md:text-[40px] font-black text-white leading-tight drop-shadow-xl">
            Where will you go next?
          </h1>
          <p className="mt-2 text-white/90 text-sm md:text-base font-medium drop-shadow max-w-md">
            Flights, hotels &amp; holiday packages — all in one place.
          </p>
        </div>
      </div>

      {/* Search Widget — overlapping hero */}
      <div
        className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearchingTransition ? '-translate-y-[100%]' : 'translate-y-0'}`}
        style={{ zIndex: 90, marginTop: '-16px' }}
      >
        <div ref={navRef} className="relative z-20">
          <TravelCategoryNav isSticky={isSticky || isSearchingTransition} activeTab={activeTab} onTabSelect={setActiveTab} />
        </div>
        
        {/* Search card */}
        <div className={`rounded-b-xl overflow-visible shadow-2xl bg-white relative z-10 border-x border-b border-theme-border transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearchingTransition ? 'opacity-0' : 'opacity-100'}`}>
          <TravelSearchCard activeTab={activeTab} onSearch={handleSearch} />
        </div>
      </div>

      {/* Bottom spacer so content below the overlapping card has room */}
      <div className={`h-10 md:h-12 bg-gradient-to-b from-black/10 to-transparent transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearchingTransition ? 'opacity-0' : 'opacity-100'}`} style={{ zIndex: 0 }} />
    </section>
  );
}
