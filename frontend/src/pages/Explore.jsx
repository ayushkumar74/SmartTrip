import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { RECOMMENDED_TRIPS } from '../mock/travelData';
import { MapPin, Search, Compass, Navigation, ArrowRight, Sun, Mountain, Wine, Tent, Star, Globe, Heart } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Explore() {
 const { formatCurrency } = useSettings();
 const [searchParams, setSearchParams] = useSearchParams();
 const navigate = useNavigate();
 const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

 // Update query params when search changes
 const handleSearch = (e) => {
 e.preventDefault();
 if (searchQuery.trim()) {
 setSearchParams({ search: searchQuery });
 } else {
 setSearchParams({});
 }
 };

 useEffect(() => {
 const q = searchParams.get('search');
 if (q !== null && q !== searchQuery) {
 setSearchQuery(q);
 }
 }, [searchParams]);

 const filteredTrips = RECOMMENDED_TRIPS.filter(trip => {
 if (!searchQuery) return true;
 const lowerQuery = searchQuery.toLowerCase();
 return (
 trip.destination.toLowerCase().includes(lowerQuery) ||
 trip.country.toLowerCase().includes(lowerQuery) ||
 trip.description.toLowerCase().includes(lowerQuery) ||
 (trip.region && trip.region.toLowerCase().includes(lowerQuery)) ||
 (trip.themes && trip.themes.some(t => t.toLowerCase().includes(lowerQuery)))
 );
 });

 const themes = [
 { name: 'Beach Escapes', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50' },
 { name: 'Mountain Adventures', icon: Mountain, color: 'text-emerald-500', bg: 'bg-emerald-50' },
 { name: 'Romantic Getaways', icon: Wine, color: 'text-rose-500', bg: 'bg-rose-50' },
 { name: 'Cultural Experiences', icon: Compass, color: 'text-indigo-500', bg: 'bg-indigo-50' },
 { name: 'Weekend Trips', icon: Tent, color: 'text-amber-500', bg: 'bg-amber-50' },
 ];

 return (
 <div className="bg-page min-h-screen">
 {/* 1. Large Photographic Hero */}
 <div className="relative h-[500px] w-full flex items-center justify-center">
 <img 
 src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80" 
 alt="Travel Explore" 
 className="absolute inset-0 w-full h-full object-cover"
 />
 <div className="absolute inset-0 bg-black/40" />
 
 <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
 <h1 className="text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
 Where will you go next?
 </h1>
 
        <form onSubmit={handleSearch} className="bg-surface p-2 rounded-full shadow-2xl flex items-center max-w-3xl mx-auto border border-theme-border/50">
          <div className="flex-1 flex items-center pl-6">
            <Search className="w-6 h-6 text-muted" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, experiences, or regions..."
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xl font-bold text-primary px-4 py-3 placeholder-muted"
            />
          </div>
          <button type="submit" className="bg-accent hover:bg-accent/90 text-white font-black px-10 py-4 rounded-full transition-colors text-lg tracking-wide">
            Search
          </button>
        </form>
      </div>
 </div>

      {/* 2. Explore by Travel Style */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-black text-primary mb-8 tracking-tight">Explore by Travel Style</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <div key={theme.name} onClick={() => setSearchParams({ search: theme.name.split(' ')[0] })} className={`${theme.bg} rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-1 transition-transform border border-theme-border`}>
                <div className={`p-4 bg-surface rounded-full mb-4 shadow-sm ${theme.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-primary text-sm">{theme.name}</h3>
              </div>
            );
          })}
 </div>
 </div>

      {/* 3. Trending Destinations (Large Horizontal Editorial Cards) */}
      <div className="bg-elevated py-16 border-y border-theme-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-primary tracking-tight">{searchQuery ? `Search Results for "${searchQuery}"` : 'Trending This Month'}</h2>
              <p className="text-secondary mt-2 text-lg">{searchQuery ? `Found ${filteredTrips.length} destinations matching your search.` : 'The most popular destinations travelers are booking right now.'}</p>
            </div>
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchParams({}); }} className="text-accent font-bold hover:underline">Clear Search</button>
            )}
 </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredTrips.length === 0 ? (
              <div className="col-span-1 md:col-span-2 bg-surface rounded-2xl border border-theme-border p-12 text-center shadow-sm">
                <Globe className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-black text-primary mb-2">No destinations found</h3>
                <p className="text-secondary font-semibold mb-6">Try searching for a different country, region, or travel style.</p>
                <Button onClick={() => { setSearchQuery(''); setSearchParams({}); }} className="bg-slate-900 text-white uppercase tracking-widest text-xs px-6 py-3 rounded-full hover:bg-slate-800">
                  Clear Search
                </Button>
              </div>
            ) : filteredTrips.slice(0, 4).map((trip) => (
              <div key={trip.id} onClick={() => navigate(`/plan?destination=${encodeURIComponent(trip.destination)}`)} className="bg-surface rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-xl transition-shadow border border-theme-border group cursor-pointer h-full relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const saved = localStorage.getItem('smartTrip_wishlist');
                    let list = saved ? JSON.parse(saved) : [];
                    if (list.find(i => i.id === trip.id)) {
                      list = list.filter(i => i.id !== trip.id);
                    } else {
                      list.push(trip);
                    }
                    localStorage.setItem('smartTrip_wishlist', JSON.stringify(list));
                    // Force a re-render by doing a dummy state update
                    setSearchParams(searchParams);
                  }}
                  className="absolute top-4 right-4 z-10 bg-page/90 p-2 rounded-full hover:bg-surface transition-colors shadow-sm"
                >
                  <Heart className={`w-5 h-5 ${(localStorage.getItem('smartTrip_wishlist') || '[]').includes(`"id":${trip.id}`) ? 'fill-red-500 text-red-500' : 'text-muted'}`} />
                </button>
                <div className="sm:w-2/5 h-64 sm:h-auto overflow-hidden relative">
                  <img src={trip.imageUrl} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-page/90 backdrop-blur text-xs font-black uppercase tracking-widest px-2 py-1 rounded text-primary shadow">
                    {trip.country}
                  </div>
                </div>
                <div className="sm:w-3/5 p-6 flex flex-col">
                  <h3 className="text-2xl font-black text-primary mb-2 group-hover:text-accent transition-colors">{trip.destination}</h3>
                  <p className="text-secondary line-clamp-3 mb-6 font-medium leading-relaxed">
                    {trip.description}
                  </p>
                  <div className="mt-auto flex justify-between items-end">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-muted">Packages from</div>
                      <div className="text-xl font-black text-primary">{formatCurrency(parseInt(trip.budget.replace('$', '').replace(',', '')))}</div>
                    </div>
                    <div className="bg-accent/10 text-accent rounded-full w-10 h-10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
 </div>
 ))}
 </div>
 </div>
 </div>

      {/* 4. Featured Destinations Mosaic */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-black text-primary mb-2 tracking-tight">Curated For You</h2>
        <p className="text-secondary mb-8 text-lg">Hand-picked destinations for an unforgettable experience.</p>
 
 <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
 {/* Main Large Block */}
 <div className="md:col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer min-h-[300px]">
 <img src="https://images.unsplash.com/photo-1512453979436-5a5369612a45?auto=format&fit=crop&w=1000&q=80" alt="Los Angeles" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
 <div className="absolute bottom-8 left-8 right-8">
 <h3 className="text-4xl font-black text-white mb-2">Los Angeles</h3>
 <p className="text-white/90 font-medium">Experience the magic of Hollywood and endless sunny beaches.</p>
 </div>
 </div>
 
 {/* Medium Blocks */}
 <div className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer min-h-[250px]">
 <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80" alt="Paris" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
 <div className="absolute bottom-6 left-6 right-6">
 <h3 className="text-2xl font-black text-white mb-1">Paris</h3>
 <p className="text-white/90 font-medium text-sm">The city of love, lights, and culture.</p>
 </div>
 </div>

 <div className="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[250px]">
 <img src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80" alt="Taj Mahal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
 <div className="absolute bottom-6 left-6">
 <h3 className="text-xl font-black text-white">Agra</h3>
 </div>
 </div>

 <div className="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[250px]">
 <img src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" alt="Bali" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
 <div className="absolute bottom-6 left-6">
 <h3 className="text-xl font-black text-white">Bali</h3>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
