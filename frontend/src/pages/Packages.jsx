import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { MapPin, Clock, Star, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { packageService } from '../services/package.service';
import WishlistButton from '../components/ui/WishlistButton';
import { useWishlist } from '../hooks/useWishlist';

export default function Packages() {
  const navigate = useNavigate();
  const { formatMoney } = useSettings();
  const { toggleWishlist, isWishlisted, isLoading: isWishlistLoading } = useWishlist();
  const [searchDest, setSearchDest] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    packageService.listPackages(searchQuery)
      .then((response) => { if (active) setPackages(response.data?.packages || []); })
      .catch(() => { if (active) setError('Unable to load holiday packages.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [searchQuery]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearchQuery(searchDest.trim());
  };

  useEffect(() => {
    let active = true;
    const query = searchDest.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      packageService.listPackages(query)
        .then((response) => {
          if (!active) return;
          const records = response.data?.packages || [];
          const unique = Array.from(new Map(records.map((pkg) => [pkg.destination, pkg])).values());
          setSuggestions(unique.slice(0, 6));
        })
        .catch(() => { if (active) setSuggestions([]); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [searchDest]);

  return (
    <div className="bg-page min-h-screen pb-20">
      <div className="bg-surface border-b border-theme-border sticky top-14 z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-black text-primary mb-2 font-heading">Holiday Packages</h1>
          <p className="text-muted text-sm font-semibold mb-6">Discover curated experiences and all-inclusive getaways.</p>
          <form onSubmit={submitSearch} className="flex flex-col md:flex-row gap-2 bg-page p-2 rounded border-4 border-theme-border/50 max-w-3xl">
            <div className="flex-[2] flex items-center bg-surface rounded px-3 py-2 relative">
              <MapPin className="w-5 h-5 text-muted mr-2 shrink-0" />
              <input type="text" value={searchDest} onChange={(event) => { const value = event.target.value; setSearchDest(value); if (!value.trim()) { setSearchQuery(''); setSuggestions([]); } }} placeholder="Where to?" className="bg-transparent border-none w-full text-primary font-black text-sm p-0 outline-none focus:ring-0" />
              {suggestions.length > 0 && <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-surface border border-theme-border rounded-lg shadow-xl overflow-hidden">{suggestions.map((suggestion) => <button type="button" key={suggestion.id} onMouseDown={(event) => { event.preventDefault(); setSearchDest(suggestion.destination); setSuggestions([]); }} className="block w-full text-left px-4 py-3 hover:bg-elevated border-b border-theme-border last:border-0"><div className="font-bold text-primary">{suggestion.destination}</div><div className="text-xs text-muted">{suggestion.name} · {suggestion.country}</div></button>)}</div>}
            </div>
            <button type="submit" className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-xs px-8 py-2 rounded transition-colors shadow">Search</button>
            {searchQuery && <button type="button" onClick={() => { setSearchDest(''); setSearchQuery(''); }} className="text-accent font-black uppercase text-xs px-3">Clear</button>}
          </form>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div> : error ? <p className="text-center text-red-600 font-bold">{error}</p> : packages.length === 0 ? <p className="text-center text-muted font-bold py-20">No packages found.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-surface rounded-xl overflow-hidden shadow-sm border border-theme-border hover:shadow-xl transition-shadow group flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 bg-slate-900/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{pkg.tag || 'Package'}</div>
                  <WishlistButton 
                    isWishlisted={isWishlisted('package', pkg.id)}
                    onToggle={() => toggleWishlist('package', pkg.id)}
                    loading={isWishlistLoading(pkg.id)}
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs font-semibold text-muted mb-2"><MapPin className="h-3.5 w-3.5 mr-1" />{pkg.destination}, {pkg.country}<span className="mx-2">•</span><Clock className="h-3.5 w-3.5 mr-1" />{pkg.durationDays} Days</div>
                  <h3 className="text-xl font-black text-primary mb-3">{pkg.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">{(pkg.highlights || []).map((highlight) => <span key={highlight} className="bg-elevated border border-theme-border text-secondary text-[10px] font-bold px-2 py-1 rounded">{highlight}</span>)}</div>
                  <div className="mt-auto pt-4 border-t border-theme-border flex items-end justify-between"><div><div className="flex items-center gap-1 mb-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /><span className="font-bold text-sm text-primary">{pkg.rating}</span><span className="text-[10px] text-muted">({pkg.reviewCount})</span></div><div className="text-sm text-muted">Starting from</div><div className="text-2xl font-black text-accent">{formatMoney(pkg.priceINR, pkg.currency || 'INR')}</div></div><Button onClick={() => navigate(`/packages/${pkg.id}`)} className="font-black text-xs px-6 py-2 rounded uppercase tracking-widest bg-accent hover:bg-accent/90 text-white shadow-md">View Details</Button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
