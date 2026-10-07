import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Heart, Search, Loader2, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { wishlistService } from '../services/wishlist.service';

const getWishlistEntity = (item) => {
 if (item.destination) return { type: 'destination', value: item.destination };
 if (item.hotel) return { type: 'hotel', value: item.hotel };
 if (item.package) return { type: 'package', value: item.package };
 return { type: 'unknown', value: {} };
};

const getEntityDisplay = (item, formatMoney) => {
 const { type, value } = getWishlistEntity(item);
 if (type === 'destination') {
    return {
     type,
     name: value.name,
     country: value.country,
     description: value.description || 'Saved destination',
     imageUrl: value.imageUrl,
   budget: value.budgetINR ? formatMoney(value.budgetINR, 'INR') : 'Explore destination',
     route: `/plan?destination=${encodeURIComponent(value.name)}`,
    };
 }
 if (type === 'hotel') {
    return {
     type,
     name: value.name,
     country: value.country,
     description: value.description || value.address || 'Saved hotel',
     imageUrl: value.imageUrl,
     budget: `${value.starRating || 0} star hotel`,
     route: `/hotels/${value.id}/review`,
    };
 }
 if (type === 'package') {
    return {
     type,
     name: value.name,
     country: value.country,
     description: value.description || `${value.durationDays}-day holiday package`,
     imageUrl: value.imageUrl,
   budget: value.priceINR ? formatMoney(value.priceINR, 'INR') : 'View package',
     route: `/packages/${value.id}`,
    };
 }
 return null;
};

export default function Wishlist() {
 const { t, formatMoney } = useSettings();
 const navigate = useNavigate();
 const [wishlist, setWishlist] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [removingId, setRemovingId] = useState(null);

 useEffect(() => {
    let active = true;
    wishlistService.getWishlist()
     .then((response) => {
        if (active) setWishlist(response.data?.items || []);
     })
     .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load your wishlist. Please try again.');
     })
     .finally(() => {
        if (active) setLoading(false);
     });
    return () => { active = false; };
 }, []);

 const removeFromWishlist = async (id) => {
    try {
     setRemovingId(id);
     setError('');
     await wishlistService.removeFromWishlist(id);
     setWishlist((items) => items.filter((item) => item.id !== id));
    } catch (requestError) {
     setError(requestError.response?.data?.message || 'Unable to remove this wishlist item. Please try again.');
    } finally {
     setRemovingId(null);
    }
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

    {error && (
     <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        <X className="h-4 w-4 shrink-0" />
        <span>{error}</span>
     </div>
    )}

    {loading ? (
     <div className="flex items-center justify-center py-20 text-secondary">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t('common.loading') || 'Loading wishlist...'}
     </div>
    ) : wishlist.length === 0 ? (
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
    {wishlist.map(item => {
   const display = getEntityDisplay(item, formatMoney);
     if (!display) return null;
     return (
    <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden group" noPadding>
    <div className="h-48 relative overflow-hidden" onClick={() => navigate(display.route)}>
   <img src={display.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'} alt={display.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
  <button 
    onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); }}
    disabled={removingId === item.id}
  className="absolute top-4 right-4 bg-surface/90 p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
    aria-label={`Remove ${display.name} from wishlist`}
  >
    {removingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5 fill-current" />}
  </button>
  <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur text-xs font-black uppercase tracking-widest px-2 py-1 rounded text-primary shadow">
    {display.country || display.type}
  </div>
  </div>
    <div className="p-5" onClick={() => navigate(display.route)}>
    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">{display.name}</h3>
    <p className="text-sm text-secondary line-clamp-2 mb-4">{display.description}</p>
  <div className="flex justify-between items-center pt-4 border-t border-theme-border">
  <div className="text-[10px] uppercase font-bold tracking-widest text-muted">Budget</div>
    <div className="text-sm font-black text-primary">{display.budget}</div>
  </div>
  </div>
  </Card>
     );
    })}
 </div>
 )}
 </div>
 );
}
