import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function TravelInspiration() {
 const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Compass className="h-6 w-6 text-accent" />
        <h2 className="text-2xl font-black text-primary tracking-tight">Travel Inspiration</h2>
      </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-auto md:h-[400px]">
 {/* Large Main Mosaic Card */}
 <div onClick={() => navigate('/explore?search=Paris')} className="md:col-span-2 lg:col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer h-64 md:h-auto">
 <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80" alt="Paris" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
 <div className="absolute bottom-6 left-6">
 <span className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1 block">Romantic Getaways</span>
 <h3 className="text-3xl font-black text-white">Paris, France</h3>
 </div>
 </div>

 {/* Smaller Cards */}
 <div onClick={() => navigate('/explore?search=Agra')} className="relative rounded-2xl overflow-hidden group cursor-pointer h-48 md:h-auto">
 <img src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80" alt="Taj Mahal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
 <div className="absolute bottom-4 left-4">
 <h3 className="text-xl font-black text-white">Agra, India</h3>
 </div>
 </div>

 <div onClick={() => navigate('/explore?search=Bali')} className="relative rounded-2xl overflow-hidden group cursor-pointer h-48 md:h-auto">
 <img src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" alt="Bali" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
 <div className="absolute bottom-4 left-4">
 <h3 className="text-xl font-black text-white">Bali, Indonesia</h3>
 </div>
 </div>

 <div onClick={() => navigate('/explore?search=New%20York')} className="md:col-span-2 lg:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer h-48 md:h-auto">
 <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80" alt="New York" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent"></div>
 <div className="absolute bottom-4 left-4">
 <span className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1 block">City Life</span>
 <h3 className="text-xl font-black text-white">New York, USA</h3>
 </div>
 </div>
 </div>
 </section>
 );
}
