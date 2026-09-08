import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Star, MapPin, Check, Search, ShieldCheck, Hotel } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Hotels() {
 const { formatCurrency } = useSettings();
 
 const [maxPrice, setMaxPrice] = React.useState(1000);
 const [minStars, setMinStars] = React.useState(0);

 const MOCK_HOTELS = [
 { 
 id: 1, 
 name: 'Taj Lake Palace', 
 location: 'Udaipur, Rajasthan', 
 rating: 4.9, 
 reviews: 1245,
    priceUSD: 450, 
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Breakfast Included'],
 roomType: 'Heritage Lake View Room',
 tag: 'Exceptional',
 distance: '2.5 km from city center',
 cancellation: 'Free Cancellation till Oct 12',
 highlight: 'Couples love this property'
 },
 { 
 id: 2, 
 name: 'The Leela Goa', 
 location: 'Cavelossim, Goa', 
 rating: 4.8, 
 reviews: 892,
 priceUSD: 320, 
 imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
 amenities: ['Private Beach', 'Free WiFi', 'Pool', 'Bar'],
 roomType: 'Lagoon Terrace Room',
 tag: 'Bestseller',
 distance: 'Beachfront property',
 cancellation: 'Non-Refundable',
 highlight: 'Top rated for location'
 },
 { 
 id: 3, 
 name: 'ITC Grand Chola', 
 location: 'Chennai, Tamil Nadu', 
 rating: 3.8, 
 reviews: 2156,
 priceUSD: 210, 
 imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
 amenities: ['Free WiFi', 'Pool', 'Fitness Center', 'Multiple Dining Options'],
 roomType: 'Executive Club Room',
 tag: 'Luxury',
 distance: '8 km from Airport',
 cancellation: 'Free Cancellation',
 highlight: 'Eco-responsible luxury'
 }
 ];

 const filteredHotels = MOCK_HOTELS.filter(hotel => hotel.priceUSD <= maxPrice && hotel.rating >= minStars);

 const clearFilters = () => {
 setMaxPrice(1000);
 setMinStars(0);
 };

  return (
    <div className="bg-page min-h-screen pb-20">
      
      {/* 1. Integrated Search Header */}
      <div className="bg-surface px-4 py-4 md:px-8 shadow-md relative z-20">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-2 bg-page p-2 rounded border-4 border-theme-border/50">
          <div className="flex-1 flex items-center bg-surface rounded px-3 py-2 cursor-pointer hover:bg-elevated transition-colors">
            <Search className="w-5 h-5 text-muted mr-2 shrink-0" />
            <div className="truncate text-primary font-black text-sm">India</div>
          </div>
          <div className="flex-1 flex items-center bg-surface rounded px-3 py-2 cursor-pointer hover:bg-elevated transition-colors">
            <div className="truncate text-primary font-bold text-xs uppercase tracking-widest">Oct 20 - Oct 25</div>
          </div>
          <div className="flex-[0.8] flex items-center bg-surface rounded px-3 py-2 cursor-pointer hover:bg-elevated transition-colors">
            <div className="truncate text-primary font-bold text-xs uppercase tracking-widest">2 Guests, 1 Room</div>
          </div>
          <button className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-xs px-6 py-2 rounded transition-colors shadow">
            Update
          </button>
        </div>
      </div>

 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
 <div className="flex flex-col lg:flex-row gap-6">
 
      {/* 2. Filter Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-surface rounded shadow-sm border border-theme-border">
          <div className="p-4 border-b border-theme-border bg-page rounded-t flex justify-between items-center">
            <h3 className="font-black text-primary uppercase tracking-widest text-xs">Filters</h3>
            <span onClick={clearFilters} className="text-xs text-accent font-bold cursor-pointer hover:underline">CLEAR</span>
          </div>
          <div className="p-4 space-y-6">
 <div>
 <div className="flex justify-between items-center mb-3">
 <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest">Price Range</h4>
 <span className="text-xs font-bold text-blue-600">{formatCurrency(maxPrice)}</span>
 </div>
 <input type="range" min="50" max="1000" step="10" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-blue-600" />
 <div className="flex justify-between text-xs font-semibold text-text-muted mt-2">
 <span>{formatCurrency(50)}</span>
 <span>{formatCurrency(1000)}+</span>
 </div>
 </div>
 <div className="border-t border-border pt-4">
 <h4 className="text-xs font-bold text-text-primary mb-3 uppercase tracking-widest">Star Rating</h4>
 <div className="space-y-2">
 {[5,4,3].map(star => (
 <label key={star} className="flex items-center gap-3 cursor-pointer group">
 <input type="checkbox" checked={minStars === star} onChange={() => setMinStars(minStars === star ? 0 : star)} className="w-4 h-4 text-blue-600 rounded-sm border-border-strong" />
 <span className="flex items-center text-sm font-semibold text-text-secondary group-hover:text-text-primary">
 {star} <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" /> & up
 </span>
 </label>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* 3. Results Container */}
 <div className="flex-1">
 <div className="bg-surface p-4 rounded shadow-sm border border-border flex justify-between items-center mb-4">
 <div>
 <h2 className="text-xl font-black text-text-primary tracking-tight">Properties in India</h2>
 <p className="text-xs font-semibold text-text-muted mt-0.5">{filteredHotels.length} properties found</p>
 </div>
 <select className="text-xs font-bold uppercase tracking-widest bg-surface-elevated border-none rounded px-3 py-2 cursor-pointer text-text-secondary">
 <option>Our Top Picks</option>
 <option>Price (Low to High)</option>
 <option>Rating (Highest)</option>
 </select>
 </div>

 <div className="space-y-4">
 {filteredHotels.length === 0 ? (
 <div className="bg-surface rounded border border-border p-12 text-center shadow-sm">
 <Hotel className="w-12 h-12 text-text-muted/50 mx-auto mb-4" />
 <h3 className="text-xl font-black text-text-primary mb-2">No properties found</h3>
 <p className="text-text-muted font-semibold mb-6">Try adjusting your filters or price range to see more results.</p>
 <Button onClick={clearFilters} className="bg-text-primary text-page uppercase tracking-widest text-xs px-6 py-3 rounded-full hover:bg-text-secondary">
 Clear Filters
 </Button>
 </div>
 ) : filteredHotels.map(hotel => (
 <div key={hotel.id} className="bg-surface rounded shadow-sm border border-border hover:shadow-md transition-shadow flex flex-col md:flex-row overflow-hidden group">
 
 {/* Left: Large Property Image */}
 <div className="w-full md:w-[280px] h-56 md:h-auto shrink-0 relative overflow-hidden cursor-pointer">
 <img 
 src={hotel.imageUrl} 
 alt={hotel.name} 
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
 />
 <div className="absolute top-2 left-2 bg-slate-900/90 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow backdrop-blur-sm">
 {hotel.tag}
 </div>
 </div>
 
 {/* Middle: Details */}
 <div className="flex-1 p-5 flex flex-col justify-between cursor-pointer border-r border-border">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className="flex">
 {[...Array(Math.floor(hotel.rating))].map((_, i) => (
 <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
 ))}
 </div>
 <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
 {hotel.highlight}
 </span>
 </div>
 
 <h3 className="font-black text-2xl text-text-primary mb-1 group-hover:text-blue-600 transition-colors">
 {hotel.name}
 </h3>
 
 <div className="flex items-center text-xs font-semibold text-text-muted mb-4">
 <MapPin className="h-3.5 w-3.5 mr-1 text-text-muted" />
 <span className="text-blue-600 hover:underline">{hotel.location}</span>
 <span className="mx-2">•</span>
 <span>{hotel.distance}</span>
 </div>
 
 <div className="bg-surface-elevated p-3 rounded border border-border mb-4">
 <h4 className="font-bold text-text-primary text-sm mb-1">{hotel.roomType}</h4>
 <div className="flex flex-wrap gap-x-3 gap-y-1">
 {hotel.amenities.map(amenity => (
 <div key={amenity} className="flex items-center text-[11px] font-semibold text-text-secondary">
 <Check className="w-3 h-3 text-green-500 mr-1" /> {amenity}
 </div>
 ))}
 </div>
 </div>
 </div>
 
 <div>
 {hotel.cancellation.includes('Free') ? (
 <div className="flex items-center text-xs font-bold text-green-700">
 <ShieldCheck className="w-4 h-4 mr-1" /> {hotel.cancellation}
 </div>
 ) : (
 <div className="text-xs font-bold text-text-muted">
 {hotel.cancellation}
 </div>
 )}
 </div>
 </div>

 {/* Right: Rigid Price & CTA Box */}
 <div className="w-full md:w-[240px] shrink-0 bg-surface-elevated/50 p-5 flex flex-col justify-between">
 <div className="flex justify-end mb-4">
 <div className="text-right mr-3">
 <div className="text-sm font-black text-text-primary">Excellent</div>
 <div className="text-[10px] font-semibold text-text-muted">{hotel.reviews} reviews</div>
 </div>
 <div className="bg-blue-700 text-white font-black text-xl w-10 h-10 flex items-center justify-center rounded-lg rounded-tr-none shadow-sm">
 {hotel.rating}
 </div>
 </div>

 <div className="text-right mt-auto">
 <div className="text-3xl font-black text-text-primary leading-none mb-1">
 {formatCurrency(hotel.priceUSD)}
 </div>
 <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">
 + Taxes & Fees / Night
 </div>
 <Button className="w-full font-black rounded-full text-xs py-3 uppercase tracking-widest shadow-md bg-blue-600 hover:bg-blue-700 text-white">
 Select Room
 </Button>
 </div>
 </div>

 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
