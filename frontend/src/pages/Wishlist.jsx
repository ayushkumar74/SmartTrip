import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Heart, MapPin, Search } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Wishlist() {
 const { t, formatCurrency } = useSettings();
 const navigate = useNavigate();
 const [wishlist, setWishlist] = useState([]);

 useEffect(() => {
 // Load wishlist from local storage
 const saved = localStorage.getItem('smartTrip_wishlist');
 if (saved) {
 try {
 setWishlist(JSON.parse(saved));
 } catch (e) {
 setWishlist([]);
 }
 }
 }, []);

 const removeFromWishlist = (id) => {
 const updated = wishlist.filter(item => item.id !== id);
 setWishlist(updated);
 localStorage.setItem('smartTrip_wishlist', JSON.stringify(updated));
 };

  return (
  <div className="max-w-[1200px] mx-auto py-6 px-4 sm:px-6 min-h-screen">
  <div className="flex justify-between items-end mb-8">
  <div>
  <h1 className="text-3xl font-bold font-heading text-primary">Wishlist</h1>
  <p className="text-secondary mt-1">Saved destinations and properties for your future trips.</p>
  </div>
  <Button onClick={() => navigate('/explore')}>
  <Search className="w-4 h-4 mr-2" /> Explore More
  </Button>
  </div>

  {wishlist.length === 0 ? (
  <div className="bg-surface border-2 border-dashed border-theme-border rounded-3xl text-center py-20 px-4">
  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-page mb-6">
  <Heart className="h-10 w-10 text-muted" />
  </div>
  <h3 className="text-2xl font-bold font-heading text-primary mb-2">Your wishlist is empty</h3>
  <p className="text-secondary mt-2 mb-8 max-w-sm mx-auto">Found a place you like? Save it here by clicking the heart icon while exploring.</p>
  <Button onClick={() => navigate('/explore')} variant="primary" className="font-bold shadow-md px-8 py-3 rounded-full">
  Start Exploring
  </Button>
  </div>
 ) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {wishlist.map(item => (
  <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden group" noPadding>
  <div className="h-48 relative overflow-hidden" onClick={() => navigate(`/plan?destination=${encodeURIComponent(item.destination)}`)}>
  <img src={item.imageUrl} alt={item.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
  <button 
  onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); }} 
  className="absolute top-4 right-4 bg-surface/90 p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
  >
  <Heart className="w-5 h-5 fill-current" />
  </button>
  <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur text-xs font-black uppercase tracking-widest px-2 py-1 rounded text-primary shadow">
  {item.country}
  </div>
  </div>
  <div className="p-5" onClick={() => navigate(`/plan?destination=${encodeURIComponent(item.destination)}`)}>
  <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">{item.destination}</h3>
  <p className="text-sm text-secondary line-clamp-2 mb-4">{item.description}</p>
  <div className="flex justify-between items-center pt-4 border-t border-theme-border">
  <div className="text-[10px] uppercase font-bold tracking-widest text-muted">Budget</div>
  <div className="text-sm font-black text-primary">{item.budget}</div>
  </div>
  </div>
  </Card>
  ))}
 </div>
 )}
 </div>
 );
}
