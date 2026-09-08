import React from 'react';
import { Compass } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle, imageSrc }) {
 return (
 <div className="flex min-h-screen bg-surface">
 {/* Left side - Visual (Hidden on mobile) */}
 <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
 <img 
 src={imageSrc || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'} 
 alt="Travel background" 
 className="absolute inset-0 h-full w-full object-cover opacity-60"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
 
 <div className="relative z-10 flex flex-col justify-end p-12 h-full w-full text-white">
 <div className="flex items-center gap-2 mb-6">
 <Compass className="h-10 w-10 text-blue-400" />
 <span className="text-3xl font-bold font-heading">SmartTrip</span>
 </div>
 <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading leading-tight">
 {title || 'Plan smarter. Travel better.'}
 </h1>
 <p className="text-lg text-gray-200 max-w-lg">
 {subtitle || 'Your intelligent companion for personalized travel planning, smart bookings, and seamless experiences.'}
 </p>
 </div>
 </div>

 {/* Right side - Form */}
 <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 lg:p-16">
 <div className="w-full max-w-md">
 {/* Mobile branding */}
 <div className="flex lg:hidden items-center gap-2 mb-10 justify-center">
 <Compass className="h-8 w-8 text-blue-600" />
 <span className="text-2xl font-bold font-heading text-text-primary">SmartTrip</span>
 </div>
 
 {children}
 </div>
 </div>
 </div>
 );
}
