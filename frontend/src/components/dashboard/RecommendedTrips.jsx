import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RECOMMENDED_TRIPS } from '../../mock/travelData';
import { MapPin, ArrowRight, Flame } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function RecommendedTrips() {
 const { formatCurrency } = useSettings();
 const navigate = useNavigate();
 
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-black text-primary tracking-tight">Trending Destinations</h2>
        </div>
        <button className="text-sm font-bold text-accent hover:text-accent/90 flex items-center gap-1 group">
          See All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

 {/* Horizontal Scroll Layout for variety */}
 <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 md:gap-6 snap-x hide-scrollbar">
 {RECOMMENDED_TRIPS.map(trip => (
 <div key={trip.id} onClick={() => navigate(`/explore?search=${encodeURIComponent(trip.destination)}`)} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] shrink-0 snap-start group cursor-pointer relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
 <div className="h-48 overflow-hidden relative">
 <img 
 src={trip.imageUrl} 
 alt={trip.destination} 
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
 <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
 <div>
 <h3 className="text-xl font-black text-white leading-tight">{trip.destination}</h3>
 <div className="flex items-center text-[10px] text-white/90 font-bold tracking-widest uppercase mt-1">
 <MapPin className="w-3 h-3 mr-1" /> {trip.country}
 </div>
 </div>
 </div>
 </div>
 
          <div className="bg-surface p-5 border border-t-0 border-theme-border rounded-b-2xl flex flex-col h-[140px]">
            <p className="text-sm font-medium text-secondary line-clamp-2 mb-3 leading-relaxed">
              {trip.description}
            </p>
            
            <div className="mt-auto flex justify-between items-center border-t border-theme-border pt-3">
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Starting from</div>
                <div className="text-lg font-black text-primary leading-none mt-0.5">
                  {formatCurrency(parseInt(trip.budget.replace('$', '').replace(',', '')))}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                <ArrowRight className="w-4 h-4 text-accent group-hover:text-white" />
              </div>
            </div>
          </div>
 </div>
 ))}
 </div>
 
 {/* Add some global CSS to hide the scrollbar for this specific component if needed */}
 <style dangerouslySetInnerHTML={{__html: `
 .hide-scrollbar::-webkit-scrollbar {
 display: none;
 }
 .hide-scrollbar {
 -ms-overflow-style: none;
 scrollbar-width: none;
 }
 `}} />
 </section>
 );
}
