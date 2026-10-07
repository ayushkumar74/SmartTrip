import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Star, MapPin, Check, Search, ShieldCheck, Hotel, Calendar, Users, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';
import { hotelService } from '../services/hotel.service';
import { placesService } from '../services/places.service';
import { Loader2, AlertTriangle } from 'lucide-react';
import WishlistButton from '../components/ui/WishlistButton';
import { useWishlist } from '../hooks/useWishlist';

const todayIso = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
};

const isDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export default function Hotels() {
  const { formatCurrency, formatMoney } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { toggleWishlist, isWishlisted, isLoading: isWishlistLoading } = useWishlist();
  
  const initialDest = searchParams.get('search') || '';
  const initialIn = searchParams.get('in') || '';
  const initialOut = searchParams.get('out') || '';
  const initialAdults = parseInt(searchParams.get('adults')) || 2;
  const initialChildren = parseInt(searchParams.get('children')) || 0;
  const initialRooms = parseInt(searchParams.get('rooms')) || 1;

  const [dest, setDest] = useState(initialDest);
  const [selectedDestination, setSelectedDestination] = useState(initialDest ? { name: initialDest, id: null } : null);
  const [checkIn, setCheckIn] = useState(initialIn);
  const [checkOut, setCheckOut] = useState(initialOut);
  
  const [showHotelGuests, setShowHotelGuests] = useState(false);
  const [hotelAdults, setHotelAdults] = useState(initialAdults);
  const [hotelChildren, setHotelChildren] = useState(initialChildren);
  const [hotelRooms, setHotelRooms] = useState(initialRooms);
  
  const [searchQuery, setSearchQuery] = useState(initialDest);
  const [submittedSearch, setSubmittedSearch] = useState(
    initialDest && isDateOnly(initialIn) && isDateOnly(initialOut) && initialOut > initialIn
      ? { destination: initialDest, checkIn: initialIn, checkOut: initialOut, guests: initialAdults }
      : null
  );
  
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minStars, setMinStars] = useState(0);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationMsg, setValidationMsg] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const destinationTimer = useRef(null);

  useEffect(() => {
    if (!submittedSearch) return;
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await hotelService.searchHotels(submittedSearch);
        setHotels(data.data.hotels);
      } catch (err) {
        setError('Failed to fetch hotels. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [submittedSearch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const destination = params.get('search') || '';
    const nextIn = params.get('in') || '';
    const nextOut = params.get('out') || '';
    const adults = parseInt(params.get('adults')) || 2;
    const validSearch = destination && isDateOnly(nextIn) && isDateOnly(nextOut) && nextOut > nextIn;
    setDest(destination);
    setCheckIn(nextIn);
    setCheckOut(nextOut);
    setHotelAdults(adults);
    setSearchQuery(destination);
    setSelectedDestination(destination ? { name: destination, id: null } : null);
    setSubmittedSearch(validSearch ? { destination, checkIn: nextIn, checkOut: nextOut, guests: adults } : null);
  }, [location.search]);

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    setSubmittedSearch(null);
    setHotels([]);
    if (checkOut && val >= checkOut) setCheckOut('');
  };

  const handleCheckOutChange = (e) => {
    const val = e.target.value;
    setSubmittedSearch(null);
    setHotels([]);
    if (val && (!isDateOnly(val) || (checkIn && val <= checkIn))) {
      setValidationMsg('Check-out must be after check-in');
      setCheckOut('');
      return;
    }
    setCheckOut(val);
    setValidationMsg('');
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDest(value);
    setSelectedDestination(null);
    setSubmittedSearch(null);
    setHotels([]);
    setValidationMsg('');
    if (destinationTimer.current) clearTimeout(destinationTimer.current);
    if (value.trim().length < 2) {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
      return;
    }

    destinationTimer.current = setTimeout(async () => {
      setDestinationLoading(true);
      try {
        const result = await placesService.searchPlaces(value.trim(), 'city');
        setDestinationSuggestions(Array.isArray(result?.results) ? result.results.slice(0, 6) : []);
        setShowDestinationSuggestions(true);
      } catch (err) {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      } finally {
        setDestinationLoading(false);
      }
    }, 300);
  };

  const selectDestination = (suggestion) => {
    setDest(suggestion.name);
    setSelectedDestination(suggestion);
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
    setValidationMsg('');
  };

  const handleSearch = () => {
    if (!selectedDestination || dest.trim() !== selectedDestination.name) {
      setValidationMsg('Select a destination from the suggestions');
      return;
    }
    if (!isDateOnly(checkIn)) {
      setValidationMsg('Select a check-in date');
      return;
    }
    if (!isDateOnly(checkOut)) {
      setValidationMsg('Select a check-out date');
      return;
    }
    if (checkOut <= checkIn) {
      setValidationMsg('Check-out must be after check-in');
      return;
    }

    setValidationMsg('');
    setSearchQuery(dest);
    setSubmittedSearch({ destination: dest.trim(), checkIn, checkOut, guests: hotelAdults });
    let query = `/hotels?search=${encodeURIComponent(dest)}&in=${encodeURIComponent(checkIn)}&out=${encodeURIComponent(checkOut)}&adults=${hotelAdults}&children=${hotelChildren}&rooms=${hotelRooms}`;
    navigate(query);
  };

  // Price parsing utility
  const getHotelPrice = (hotel) => {
    return hotel.rooms?.[0]?.price || hotel.priceINR || 0;
  };

  // Ensure max price slider makes sense based on results
  const highestPriceInResults = Math.max(...hotels.map(getHotelPrice), 50000);

  const filteredHotels = hotels.filter(hotel => {
    const p = getHotelPrice(hotel);
    return p <= maxPrice && hotel.rating >= minStars;
  });

  const clearFilters = () => {
    setMaxPrice(50000); // Or highestPriceInResults, effectively unbounded
    setMinStars(0);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* 1. Integrated Search Header */}
      <div className="bg-white px-4 py-4 md:px-8 shadow-sm relative z-20 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner">
          <div className="flex-2 flex items-center bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200 relative">
            <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              value={dest} 
              onChange={handleDestinationChange}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
              onFocus={() => { if (destinationSuggestions.length > 0) setShowDestinationSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 180)}
              placeholder="Destination or Hotel Name"
              className="bg-transparent border-none w-full text-slate-900 font-black text-sm p-0 outline-none focus:ring-0 uppercase" 
            />
            {destinationLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                {destinationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectDestination(suggestion); }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 border-b border-slate-200 last:border-0"
                  >
                    <div className="font-black text-slate-900 text-sm">{suggestion.name}</div>
                    <div className="text-xs font-semibold text-slate-500">{suggestion.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200">
            <input 
              type="date" 
              min={todayIso()}
              value={checkIn} 
              onChange={handleCheckInChange} 
              className="bg-transparent border-none w-full text-slate-900 font-bold text-sm p-0 outline-none focus:ring-0 uppercase" 
            />
          </div>
          <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200">
            <input 
              type="date" 
              min={checkIn || todayIso()}
              value={checkOut} 
              onChange={handleCheckOutChange} 
              className="bg-transparent border-none w-full text-slate-900 font-bold text-sm p-0 outline-none focus:ring-0 uppercase" 
            />
          </div>
          <div className="flex-[1.2] flex items-center bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200 relative" onClick={() => setShowHotelGuests(!showHotelGuests)}>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm font-black text-slate-900 truncate uppercase">
                {hotelAdults + hotelChildren} <span className="font-semibold">Guest{hotelAdults + hotelChildren > 1 ? 's' : ''},</span> {hotelRooms} <span className="font-semibold">Room{hotelRooms > 1 ? 's' : ''}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
            
            {showHotelGuests && (
              <div className="absolute z-40 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-4 right-0" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold text-sm text-slate-900">Rooms</div>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={hotelRooms <= 1} onClick={() => setHotelRooms(r => r - 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-50 text-slate-900 hover:bg-slate-100">-</button>
                    <span className="font-bold w-4 text-center text-slate-900">{hotelRooms}</span>
                    <button type="button" disabled={hotelRooms >= 9} onClick={() => setHotelRooms(r => r + 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-50 text-slate-900 hover:bg-slate-100">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-bold text-sm text-slate-900">Adults</div>
                    <div className="text-xs text-slate-500">12+ yrs</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={hotelAdults <= 1} onClick={() => setHotelAdults(a => a - 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-50 text-slate-900 hover:bg-slate-100">-</button>
                    <span className="font-bold w-4 text-center text-slate-900">{hotelAdults}</span>
                    <button type="button" disabled={hotelAdults >= 14} onClick={() => setHotelAdults(a => a + 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-50 text-slate-900 hover:bg-slate-100">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="font-bold text-sm text-slate-900">Children</div>
                    <div className="text-xs text-slate-500">0-11 yrs</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={hotelChildren <= 0} onClick={() => setHotelChildren(c => c - 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-50 text-slate-900 hover:bg-slate-100">-</button>
                    <span className="font-bold w-4 text-center text-slate-900">{hotelChildren}</span>
                    <button type="button" disabled={hotelChildren >= 9} onClick={() => setHotelChildren(c => c + 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-50 text-slate-900 hover:bg-slate-100">+</button>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-2" size="sm" onClick={(e) => { e.stopPropagation(); setShowHotelGuests(false); }}>Apply</Button>
              </div>
            )}
          </div>
          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs px-6 py-2 rounded-lg transition-colors shadow">
            Search
          </button>
        </div>
        {validationMsg && <div className="max-w-6xl mx-auto mt-2 text-sm font-bold text-red-600">{validationMsg}</div>}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* 2. Filter Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Filters</h3>
                <span onClick={clearFilters} className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">CLEAR</span>
              </div>
              <div className="p-4 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Price Range (Night)</h4>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mb-2">Max: {formatCurrency(maxPrice, 'INR')}</div>
                  <input type="range" min="500" max="50000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-blue-600" />
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2">
                    <span>{formatCurrency(500, 'INR')}</span>
                    <span>{formatCurrency(50000, 'INR')}</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-widest">Star Rating</h4>
                  <div className="space-y-2">
                    {[5,4,3].map(star => (
                      <label key={star} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={minStars === star} onChange={() => setMinStars(minStars === star ? 0 : star)} className="w-4 h-4 text-blue-600 rounded-sm border-slate-300" />
                        <span className="flex items-center text-sm font-semibold text-slate-700 group-hover:text-slate-900">
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
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{submittedSearch ? `Properties in ${submittedSearch.destination}` : 'Search hotels'}</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{submittedSearch ? `${filteredHotels.length} properties found` : 'Choose a destination and stay dates, then search.'}</p>
              </div>
              <select className="text-xs font-bold uppercase tracking-widest bg-slate-50 border-none rounded px-3 py-2 cursor-pointer text-slate-700">
                <option>Our Top Picks</option>
                <option>Price (Low to High)</option>
                <option>Rating (Highest)</option>
              </select>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
              ) : !submittedSearch ? (
                <div className="bg-amber-50 text-amber-800 p-6 rounded-xl text-center border border-amber-200">
                  <Search className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-bold text-lg mb-1">Search for your stay</h3>
                  <p className="text-sm">Select a destination, check-in, and check-out dates, then click Search.</p>
                </div>
              ) : !isDateOnly(checkIn) || !isDateOnly(checkOut) ? (
                <div className="bg-amber-50 text-amber-800 p-6 rounded-xl text-center border border-amber-200">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-bold text-lg mb-1">Choose your stay dates</h3>
                  <p className="text-sm">Check-in and check-out dates are required to search hotels.</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-700 p-6 rounded-xl text-center border border-red-200">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-bold text-lg mb-1">Search Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              ) : filteredHotels.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <Hotel className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-slate-900 mb-2">No hotels found in {submittedSearch.destination} for these dates.</h3>
                  <p className="text-slate-500 font-semibold mb-6">Try a different destination, date range, or filter.</p>
                  <Button onClick={clearFilters} className="bg-blue-600 text-white uppercase tracking-widest text-xs px-6 py-3 rounded-full hover:bg-blue-700">
                    Clear Filters
                  </Button>
                </div>
              ) : filteredHotels.map(hotel => (
                <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row overflow-hidden group">
                  
                  {/* Left: Compact Property Image */}
                  <div className="w-full md:w-[210px] h-44 md:h-auto shrink-0 relative overflow-hidden cursor-pointer">
                    <img 
                      src={(hotel.images?.[0] || hotel.imageUrl)} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/90 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow backdrop-blur-sm">
                      {hotel.tag || 'Recommended'}
                    </div>
                    <WishlistButton 
                      isWishlisted={isWishlisted('hotel', hotel.id)}
                      onToggle={() => toggleWishlist('hotel', hotel.id)}
                      loading={isWishlistLoading(hotel.id)}
                    />
                  </div>
                  
                  {/* Middle: Details */}
                  <div className="flex-1 p-4 flex flex-col justify-between cursor-pointer border-r border-slate-200 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                          {hotel.highlight || 'Top Rated'}
                        </span>
                      </div>
                      
                      <h3 className="font-black text-2xl text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {hotel.name}
                      </h3>
                      
                      <div className="flex items-center text-xs font-semibold text-slate-500 mb-3 flex-wrap gap-1">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        <span className="text-blue-600 hover:underline truncate">{(hotel.address || hotel.location)}</span>
                        <span className="mx-1">•</span>
                        <span>{hotel.distance || '2 km from center'}</span>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{(hotel.rooms?.[0]?.name || hotel.roomType || 'Standard Room')}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {(hotel.amenities || ['Free WiFi', 'Pool', 'Breakfast']).slice(0, 3).map(amenity => (
                            <div key={amenity} className="flex items-center text-[11px] font-semibold text-slate-700">
                              <Check className="w-3 h-3 text-green-500 mr-1" /> {amenity}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {(hotel.cancellation ?? 'Free Cancellation').includes('Free') ? (
                        <div className="flex items-center text-xs font-bold text-green-700">
                          <ShieldCheck className="w-4 h-4 mr-1" /> {hotel.cancellation ?? 'Free Cancellation'}
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-slate-500">
                          {hotel.cancellation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Rigid Price & CTA Box */}
                  <div className="w-full md:w-[210px] shrink-0 bg-slate-50 p-5 flex flex-col justify-between">
                    <div className="flex justify-end mb-4">
                      <div className="text-right mr-3">
                        <div className="text-sm font-black text-slate-900">Excellent</div>
                        <div className="text-[10px] font-semibold text-slate-500">{hotel.reviews || '342'} reviews</div>
                      </div>
                      <div className="bg-blue-600 text-white font-black text-xl w-10 h-10 flex items-center justify-center rounded-lg rounded-tr-none shadow-sm">
                        {hotel.rating}
                      </div>
                    </div>

                    <div className="text-right mt-auto">
                      <div className="text-3xl font-black text-slate-900 leading-none mb-1">
                        {formatMoney(getHotelPrice(hotel), hotel.rooms?.[0]?.currency || 'INR')}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                        + Taxes & Fees / Night
                      </div>
                      <Button onClick={() => navigate(`/hotels/${hotel.id}/rooms`, { state: { hotel, checkIn, checkOut, guests: `${hotelAdults + hotelChildren} Guests`, adults: hotelAdults, children: hotelChildren, rooms: hotelRooms, childAges: [] } })} className="w-full font-black rounded-lg text-xs py-3 uppercase tracking-widest shadow bg-blue-600 hover:bg-blue-700 text-white">
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
