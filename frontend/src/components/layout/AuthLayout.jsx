import React, { useState, useEffect } from 'react';
import { Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    image: '/images/auth/auth-bg-1.jpg',
    category: 'SMARTTRIP EXPLORE',
    headline: 'Find your next escape.',
    supporting: 'Discover destinations that match the way you love to travel.',
  },
  {
    image: '/images/auth/auth-bg-2.jpg',
    category: 'SMARTTRIP PLAN',
    headline: 'Plan less. Travel more.',
    supporting: 'Build smarter itineraries around your flights, stays and interests.',
  },
  {
    image: '/images/auth/auth-bg-3.jpg',
    category: 'SMARTTRIP BOOK',
    headline: 'Your whole trip, in one place.',
    supporting: 'Search, compare and manage your travel plans from one simple platform.',
  }
];

export default function AuthLayout({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#F6F8FB] px-4 py-4 sm:px-6 lg:px-8 box-border">
      <style>{`
        @keyframes authCardIn {
          from {
            opacity: 0;
            transform: translate3d(0, 14px, 0) scale(.985);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Auth Container */}
      <section
        className="relative z-20 flex w-full max-w-[900px] flex-row rounded-[24px] bg-white shadow-[0_22px_70px_rgba(0,0,0,0.08)] overflow-hidden max-h-[96dvh]"
        style={{
          animation: 'authCardIn 420ms cubic-bezier(.22,1,.36,1) both',
        }}
      >
        {/* Left Panel: Travel Carousel (hidden on small screens) */}
        <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 md:block">
          {SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              
              <div className="absolute bottom-10 left-8 right-8 text-white">
                <span className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-white/80">
                  {slide.category}
                </span>
                <h2 className="mb-2 text-[22px] font-black leading-tight tracking-tight">
                  {slide.headline}
                </h2>
                <p className="text-[13px] leading-relaxed text-white/80">
                  {slide.supporting}
                </p>
              </div>
            </div>
          ))}
          
          {/* Indicators */}
          <div className="absolute bottom-5 left-8 z-20 flex gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-6 bg-brand-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Panel: Form Card */}
        <div className="relative w-full md:w-1/2 px-6 py-6 sm:px-8 sm:py-6 overflow-y-auto no-scrollbar">
          {/* SmartTrip Logo */}
          <div className="mb-4 flex justify-center">
            <Link
              to="/"
              className="group flex w-fit items-center gap-2 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
              aria-label="Go to SmartTrip home"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-brand-600 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_4px_10px_rgba(15,23,42,.07)] transition-transform duration-200 group-hover:-translate-y-0.5">
                <Plane className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="font-heading text-[19px] font-black tracking-tight text-slate-900">
                Smart<span className="text-brand-600">Trip</span>
              </span>
            </Link>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}