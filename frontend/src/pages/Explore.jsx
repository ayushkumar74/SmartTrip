import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { MapPin, Search, Compass, ArrowRight, Sun, Mountain, Wine, Tent, Globe, Loader2, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { placesService } from '../services/places.service';
import WishlistButton from '../components/ui/WishlistButton';
import { useWishlist } from '../hooks/useWishlist';

const STYLE_MAPPING = {
  'Beach Escapes': ['Goa', 'Bali', 'Phuket', 'Maldives', 'Andaman'],
  'Mountain Adventures': ['Manali', 'Kashmir', 'Shimla', 'Leh'],
  'Romantic Getaways': ['Udaipur', 'Paris', 'Bali', 'Maldives'],
  'Cultural Experiences': ['Agra', 'Jaipur', 'Varanasi', 'Delhi', 'Rome'],
  'Weekend Trips': ['Jaipur', 'Agra', 'Rishikesh', 'Delhi'],
};

const themes = [
  { name: 'Beach Escapes', icon: Sun },
  { name: 'Mountain Adventures', icon: Mountain },
  { name: 'Romantic Getaways', icon: Wine },
  { name: 'Cultural Experiences', icon: Compass },
  { name: 'Weekend Trips', icon: Tent },
];

export default function Explore() {
  const { formatCurrency } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted, isLoading: isWishlistLoading } = useWishlist();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [dbDestinations, setDbDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const result = await placesService.searchPlaces('', 'city');
        const results = Array.isArray(result?.results) ? result.results : [];
        setDbDestinations(results.slice(0, 8));
      } catch (err) {
        console.warn('Failed to load destinations from backend', err);
        setDbDestinations([]);
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
    setInputValue(q);
    if (q) {
      performSearch(q);
    } else {
      setSearchResults([]);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setLoading(true);
    try {
      if (STYLE_MAPPING[query]) {
        // Fetch destinations mapped to this travel style
        const promises = STYLE_MAPPING[query].map(city => placesService.searchPlaces(city, 'city'));
        const resultsArrays = await Promise.all(promises);
        const combined = resultsArrays.flatMap(res => Array.isArray(res?.results) ? res.results : []);
        // Deduplicate by ID
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setSearchResults(unique.slice(0, 12));
      } else {
        // Normal search
        const result = await placesService.searchPlaces(query, 'city', { recordHistory: true });
        const results = Array.isArray(result?.results) ? result.results : [];
        setSearchResults(results);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (val.trim().length >= 2) {
        setSearchParams({ search: val.trim() });
      } else if (val.trim() === '') {
        setSearchParams({});
        setSearchResults([]);
      }
    }, 400);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ search: inputValue.trim() });
    } else {
      setSearchParams({});
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setInputValue('');
    setSearchParams({});
    setSearchResults([]);
  };

  const displayedDestinations = searchQuery ? searchResults : dbDestinations;

  const DestinationCard = ({ dest }) => (
    <div
      onClick={() => navigate('/plan', { state: { destination: dest.name, destinationId: dest.id } })}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col group"
    >
      <div className="w-full h-48 relative overflow-hidden bg-page">
        <img
          src={dest.photo || dest.imageUrl || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80`}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/50">
          {dest.address?.split(',').pop()?.trim() || 'Destination'}
        </span>
        <WishlistButton 
          isWishlisted={isWishlisted('destination', dest.id)}
          onToggle={() => toggleWishlist('destination', dest.id)}
          loading={isWishlistLoading(dest.id)}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
          {dest.name}
        </h3>
        <p className="text-secondary line-clamp-2 text-sm font-medium mb-4 flex-1">
          {dest.description || 'Explore this amazing destination.'}
        </p>
        <div className="flex items-center justify-between mt-auto border-t border-theme-border pt-3">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 font-medium truncate">{dest.address}</span>
          </div>
          <span className="text-brand-600 text-xs font-semibold flex items-center group-hover:underline shrink-0 ml-2">
            Explore <ArrowRight className="w-3 h-3 ml-1" />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Explore Destinations</h1>
          <p className="text-sm text-gray-500 mb-6">Discover your next travel adventure from thousands of destinations worldwide.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Search for cities, countries, or regions..."
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
              />
              {inputValue && (
                <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shrink-0">
              Search
            </button>
          </form>

          {/* Clean Travel Styles Filters */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Browse by style</p>
            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => {
                const Icon = theme.icon;
                const isActive = searchQuery === theme.name;
                return (
                  <button
                    key={theme.name}
                    onClick={() => {
                      if (isActive) clearSearch();
                      else setSearchParams({ search: theme.name });
                    }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
                      isActive 
                        ? 'border-brand-600 bg-brand-600 text-white' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {theme.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-black text-primary">
              {searchQuery ? `Results for "${searchQuery}"` : 'Curated Destinations'}
            </h2>
            <p className="text-sm font-semibold text-secondary mt-1">
              {searchQuery 
                ? `${displayedDestinations.length} destination(s) found`
                : 'Popular destinations travelers are exploring right now'}
            </p>
          </div>
          {searchQuery && (
            <button onClick={clearSearch} className="text-xs font-semibold text-brand-600 hover:underline">
              Clear
            </button>
          )}
        </div>

        {initialLoading || loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
            <p className="text-sm font-bold text-muted">Searching destinations...</p>
          </div>
        ) : displayedDestinations.length === 0 ? (
          <div className="bg-surface rounded-xl border border-theme-border p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
            <Globe className="w-12 h-12 text-muted/50 mx-auto mb-4" />
            <h3 className="text-lg font-black text-primary mb-2">No destinations found</h3>
            <p className="text-secondary font-medium text-sm mb-6">Try searching for a different location or travel style.</p>
            <Button onClick={clearSearch} variant="outline" className="uppercase tracking-widest text-xs">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedDestinations.map(dest => (
              <DestinationCard key={dest.id} dest={dest} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

