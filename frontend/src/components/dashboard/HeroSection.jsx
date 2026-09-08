import React from 'react';
import { useAuth } from '../../context/AuthContext';
import TravelSearchCard from './TravelSearchCard';

export default function HeroSection() {
 const { user } = useAuth();
 const firstName = user?.name?.split(' ')[0] || 'Traveler';

 return (
 <div className="relative w-full flex flex-col items-center">
 {/* Immersive Background Container */}
 <div className="w-full h-[550px] relative">
 <img 
 src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80" 
 alt="Flight above clouds" 
 className="w-full h-full object-cover object-center"
 />
 {/* Advanced gradient for depth: dark at top for navbar, dark at bottom for booking engine contrast */}
 <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
 
 {/* Headline text naturally positioned over hero */}
 <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 -mt-20">
 <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
 The world is waiting, {firstName}.
 </h1>
 <p className="text-xl md:text-2xl text-white/90 font-bold max-w-3xl drop-shadow-lg">
 Search hundreds of airlines and hotels to find the perfect trip.
 </p>
 </div>
 </div>

 {/* Booking Engine overlapping the bottom of the hero */}
 <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 mb-12">
 <TravelSearchCard />
 </div>
 </div>
 );
}
