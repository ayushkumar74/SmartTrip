import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plane, Hotel, Calendar, Users, MapPin, Loader2, X, ChevronDown, Check, Search } from 'lucide-react';
import Button from '../ui/Button';
import { placesService } from '../../services/places.service';

const todayIso = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
};

const tomorrowIso = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
};

export default function TravelSearchCard({ activeTab = 'flights', onSearch }) {
  const isCompact = false;
  const navigate = useNavigate();
  const location = useLocation();


  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('');

  // FLIGHTS STATE
  const [flightFrom, setFlightFrom] = useState('');
  const [flightTo, setFlightTo] = useState('');
  const [flightDep, setFlightDep] = useState('');
  const [flightRet, setFlightRet] = useState('');
  const [tripType, setTripType] = useState('oneway');
  const returnDateInputRef = useRef(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [flightChildAges, setFlightChildAges] = useState([]);
  const [showTravelers, setShowTravelers] = useState(false);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [showCabinClass, setShowCabinClass] = useState(false);
  const [specialFare, setSpecialFare] = useState('Regular');
  const [searchFeedback, setSearchFeedback] = useState('');

  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);
  const [fromShow, setFromShow] = useState(false);
  const [toShow, setToShow] = useState(false);

  // HOTELS STATE
  const [hotelDest, setHotelDest] = useState('');
  const [hotelIn, setHotelIn] = useState('');
  const [hotelOut, setHotelOut] = useState('');
  
  const [hotelAdults, setHotelAdults] = useState(2);
  const [hotelChildren, setHotelChildren] = useState(0);
  const [hotelRooms, setHotelRooms] = useState(1);
  const [hotelChildAges, setHotelChildAges] = useState([]);
  const [showHotelGuests, setShowHotelGuests] = useState(false);

  const [planDestination, setPlanDestination] = useState('');

  const fromTimer = useRef(null);
  const toTimer = useRef(null);

  const airportLookup = async (query, side) => {
    const q = String(query || '').trim();
    if (!q || q.length < 2) {
      if (side === 'from') setFromSuggestions([]);
      if (side === 'to') setToSuggestions([]);
      return;
    }

    if (side === 'from') setFromLoading(true);
    if (side === 'to') setToLoading(true);

    try {
      const result = await placesService.searchPlaces(q, 'airport');
      const mapped = Array.isArray(result?.results) ? result.results : [];
      if (side === 'from') setFromSuggestions(mapped);
      if (side === 'to') setToSuggestions(mapped);
    } catch (err) {
      console.error('Airport search error', err);
      if (side === 'from') setFromSuggestions([]);
      if (side === 'to') setToSuggestions([]);
    } finally {
      if (side === 'from') setFromLoading(false);
      if (side === 'to') setToLoading(false);
    }
  };

  const selectAirport = (choice, side) => {
    const code = choice.iataCode || choice.code || (String(choice.name || '').match(/\(([A-Z]{3})\)/)?.[1] || '');
    const addressParts = String(choice.address || choice.city || choice.country || '').split(',').map(p => p.trim()).filter(Boolean);
    const selected = {
      code,
      id: choice.id,
      name: choice.name,
      city: addressParts[0] || choice.city || '',
      country: addressParts[addressParts.length - 1] || choice.country || '',
    };

    if (side === 'from') {
      setFlightFrom(code);
      setFromAirport(selected);
      setFromSuggestions([]);
      setFromShow(false);
    }

    if (side === 'to') {
      setFlightTo(code);
      setToAirport(selected);
      setToSuggestions([]);
      setToShow(false);
    }
  };

  const handleFromChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFlightFrom(value);
    setFromAirport(null);
    if (fromTimer.current) clearTimeout(fromTimer.current);
    fromTimer.current = setTimeout(() => airportLookup(value, 'from'), 350);
  };

  const handleToChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFlightTo(value);
    setToAirport(null);
    if (toTimer.current) clearTimeout(toTimer.current);
    toTimer.current = setTimeout(() => airportLookup(value, 'to'), 350);
  };

  const handleDepChange = (e) => {
    const value = e.target.value;
    setFlightDep(value);
    if (tripType === 'roundtrip' && flightRet && value && flightRet <= value) {
      setFlightRet('');
    }
  };

  const handleRetChange = (e) => {
    const value = e.target.value;
    if (tripType === 'roundtrip' && flightDep && value && value <= flightDep) {
      setFlightRet('');
      return;
    }
    setFlightRet(tripType === 'roundtrip' ? value : '');
  };

  // Children handling
  const handleFlightChildrenChange = (newCount) => {
    setChildren(newCount);
    setFlightChildAges(prev => {
      const next = [...prev];
      if (newCount > next.length) {
        while (next.length < newCount) next.push(5); // default age
      } else {
        next.length = newCount;
      }
      return next;
    });
  };

  const handleFlightChildAgeChange = (index, age) => {
    setFlightChildAges(prev => {
      const next = [...prev];
      next[index] = age;
      return next;
    });
  };

  const handleHotelChildrenChange = (newCount) => {
    setHotelChildren(newCount);
    setHotelChildAges(prev => {
      const next = [...prev];
      if (newCount > next.length) {
        while (next.length < newCount) next.push(5);
      } else {
        next.length = newCount;
      }
      return next;
    });
  };

  const handleHotelChildAgeChange = (index, age) => {
    setHotelChildAges(prev => {
      const next = [...prev];
      next[index] = age;
      return next;
    });
  };

  const handleHotelInChange = (e) => {
    const val = e.target.value;
    setHotelIn(val);
    if (hotelOut && val >= hotelOut) setHotelOut('');
  };

  const handleHotelOutChange = (e) => {
    const val = e.target.value;
    setHotelOut(val);
  };

  const clearSearchSelection = () => {
    setFlightFrom('');
    setFlightTo('');
    setFlightDep('');
    setFlightRet('');
    setTripType('oneway');
    setFromAirport(null);
    setToAirport(null);
    setAdults(1);
    setChildren(0);
    setInfants(0);
    setCabinClass('Economy');
    setSpecialFare('Regular');
    setFlightChildAges([]);
    setSearchFeedback('Search values cleared');
  };

  const handleSearchFlight = () => {
    const fromCode = (fromAirport?.code || flightFrom.trim().toUpperCase()).trim();
    const toCode = (toAirport?.code || flightTo.trim().toUpperCase()).trim();
    const depDate = flightDep;

    if (!fromCode || !toCode) {
      setSearchFeedback('Choose both origin and destination');
      return;
    }
    if (fromCode === toCode) {
      setSearchFeedback('Origin and destination must differ');
      return;
    }
    if (!depDate) {
      setSearchFeedback('Select a departure date');
      return;
    }
    if (tripType === 'roundtrip' && (!flightRet || flightRet <= depDate)) {
      setSearchFeedback('Select a valid return date for round trip');
      return;
    }

    setSearchFeedback('');
    let query = `/flights?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&date=${encodeURIComponent(depDate)}`;
    if (tripType === 'roundtrip') query += `&returnDate=${encodeURIComponent(flightRet)}`;
    query += `&adults=${adults}&children=${children}&infants=${infants}&class=${encodeURIComponent(cabinClass)}&fare=${encodeURIComponent(specialFare)}`;
    if (children > 0) query += `&childAges=${flightChildAges.join(',')}`;
    
    setIsSearching(true);
    setSearchType('flights');
    setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(query);
      }
      setIsSearching(false);
    }, 100);
  };

  const handleSearchHotel = () => {
    if (!hotelDest) {
      setSearchFeedback('Select a destination');
      return;
    }
    if (!hotelIn) {
      setSearchFeedback('Select a check-in date');
      return;
    }
    if (!hotelOut) {
      setSearchFeedback('Select a check-out date');
      return;
    }
    if (hotelOut <= hotelIn) {
      setSearchFeedback('Check-out must be after check-in');
      return;
    }

    setSearchFeedback('');
    let query = `/hotels?search=${encodeURIComponent(hotelDest)}&in=${encodeURIComponent(hotelIn)}&out=${encodeURIComponent(hotelOut)}`;
    query += `&adults=${hotelAdults}&children=${hotelChildren}&rooms=${hotelRooms}`;
    if (hotelChildren > 0) query += `&childAges=${hotelChildAges.join(',')}`;
    
    setIsSearching(true);
    setSearchType('hotels');
    setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(query);
      }
      setIsSearching(false);
    }, 100);
  };

  const specialFares = ['Regular', 'Student', 'Armed Forces', 'Senior Citizen', 'Doctors & Nurses'];
  const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];

  return (
    <div className={`w-full relative z-10 transition-colors bg-surface border-theme-border rounded-b-xl shadow-lg`}>
      <div className={`relative bg-surface flex-1 w-full p-4 md:p-5 rounded-b-xl`}>
        {activeTab === 'flights' && (
          <>
            {!isCompact && (
              <div className="flex gap-6 mb-5">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="tripType" checked={tripType === 'oneway'} onChange={() => { setTripType('oneway'); setFlightRet(''); }} className="text-brand-600 border-theme-border focus:ring-brand-600 bg-transparent" />
                  <span className="text-sm font-bold text-primary transition-colors">One Way</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="tripType" checked={tripType === 'roundtrip'} onChange={() => setTripType('roundtrip')} className="text-brand-600 border-theme-border focus:ring-brand-600 bg-transparent" />
                  <span className="text-sm font-bold text-primary transition-colors">Round Trip</span>
                </label>
              </div>
            )}

            <div className={`flex flex-col lg:flex-row rounded-xl border border-theme-border divide-y lg:divide-y-0 lg:divide-x divide-theme-border relative bg-surface transition-colors w-full ${isCompact ? 'shadow-sm items-center h-[56px]' : ''}`}>
              <div className={`flex-[1.2] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group relative rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> From</label>
                <input id="flightFrom" type="text" value={flightFrom} onChange={handleFromChange} onFocus={() => { setFromShow(true); if (flightFrom && flightFrom.length >= 2) airportLookup(flightFrom, 'from'); }} onBlur={() => setTimeout(() => setFromShow(false), 180)} className={`w-full font-black text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent uppercase placeholder-slate-300 dark:placeholder-slate-700 ${isCompact ? 'text-base' : 'text-xl'}`} placeholder="CITY OR AIRPORT" />
                {!isCompact && <div className="text-xs font-medium text-secondary truncate">{fromAirport?.city ? `${fromAirport.city}, ${fromAirport.country}` : 'Choose a city or airport'}</div>}
                {fromShow && (
                  <div className="absolute z-30 left-0 top-full mt-1 w-[calc(100vw-32px)] md:w-[26rem] bg-surface border border-theme-border rounded-xl shadow-xl max-h-80 overflow-y-auto">
                    {fromLoading ? <div className="px-4 py-4 flex items-center gap-2 text-sm font-bold text-secondary"><Loader2 className="w-4 h-4 animate-spin" /> Searching...</div> : fromSuggestions.length === 0 ? <div className="px-4 py-4 text-sm font-bold text-secondary">No airports found</div> : <ul>{fromSuggestions.map((opt, idx) => <li key={opt.id || idx} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-theme-border last:border-0" onMouseDown={(e) => { e.preventDefault(); selectAirport(opt, 'from'); }}><div className="font-black text-primary text-sm">{opt.name}</div><div className="text-xs font-medium text-secondary flex justify-between gap-4"><span>{opt.address}</span><span className="text-brand-600 font-black uppercase">{opt.iataCode || opt.code || ''}</span></div></li>)}</ul>}
                  </div>
                )}
              </div>

              <div className={`flex-[1.2] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group relative ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> To</label>
                <input id="flightTo" type="text" value={flightTo} onChange={handleToChange} onFocus={() => { setToShow(true); if (flightTo && flightTo.length >= 2) airportLookup(flightTo, 'to'); }} onBlur={() => setTimeout(() => setToShow(false), 180)} className={`w-full font-black text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent uppercase placeholder-slate-300 dark:placeholder-slate-700 ${isCompact ? 'text-base' : 'text-xl'}`} placeholder="CITY OR AIRPORT" />
                {!isCompact && <div className="text-xs font-medium text-secondary truncate">{toAirport?.city ? `${toAirport.city}, ${toAirport.country}` : 'Choose a city or airport'}</div>}
                {toShow && (
                  <div className="absolute z-30 left-0 lg:left-auto lg:right-0 top-full mt-1 w-[calc(100vw-32px)] md:w-[26rem] bg-surface border border-theme-border rounded-xl shadow-xl max-h-80 overflow-y-auto">
                    {toLoading ? <div className="px-4 py-4 flex items-center gap-2 text-sm font-bold text-secondary"><Loader2 className="w-4 h-4 animate-spin" /> Searching...</div> : toSuggestions.length === 0 ? <div className="px-4 py-4 text-sm font-bold text-secondary">No airports found</div> : <ul>{toSuggestions.map((opt, idx) => <li key={opt.id || idx} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-theme-border last:border-0" onMouseDown={(e) => { e.preventDefault(); selectAirport(opt, 'to'); }}><div className="font-black text-primary text-sm">{opt.name}</div><div className="text-xs font-medium text-secondary flex justify-between gap-4"><span>{opt.address}</span><span className="text-brand-600 font-black uppercase">{opt.iataCode || opt.code || ''}</span></div></li>)}</ul>}
                  </div>
                )}
              </div>

              <div className={`flex-1 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Departure</label>
                <input id="flightDep" type="date" min={todayIso()} value={flightDep} onChange={handleDepChange} className={`w-full font-black text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent cursor-pointer ${isCompact ? 'text-base' : 'text-lg'}`} />
              </div>

              <div className={`flex-1 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Return</label>
                <input id="flightRet" ref={returnDateInputRef} type="date" min={flightDep || todayIso()} value={flightRet} onChange={handleRetChange} onClick={() => { if (tripType === 'roundtrip') returnDateInputRef.current?.showPicker?.(); }} disabled={tripType === 'oneway'} placeholder="Add return" className={`w-full font-black text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${isCompact ? 'text-base' : 'text-lg'}`} />
              </div>

              {/* TRAVELLERS POPOVER */}
              <div className={`flex-1 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group relative cursor-pointer ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`} onClick={() => { setShowTravelers(!showTravelers); setShowCabinClass(false); }}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Travellers</label>
                <div className="flex items-center justify-between mt-1">
                  <div className={`font-black text-primary truncate leading-none ${isCompact ? 'text-base' : 'text-lg'}`}>{adults + children + infants} {!isCompact && <span className="text-sm font-semibold">Traveller{adults + children + infants > 1 ? 's' : ''}</span>}</div>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </div>
                {showTravelers && (
                  <div className="absolute z-40 top-full mt-2 w-[calc(100vw-32px)] md:w-72 bg-surface border border-theme-border rounded-xl shadow-xl p-5 left-0 md:left-auto md:right-0 lg:left-0" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="font-bold text-sm text-primary">Adults</div>
                        <div className="text-xs text-secondary">12+ yrs</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={adults <= 1} onClick={() => { setAdults(a => a - 1); if (infants > adults - 1) setInfants(adults - 1); }} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">-</button>
                        <span className="font-bold w-4 text-center text-primary">{adults}</span>
                        <button type="button" disabled={adults >= 9} onClick={() => setAdults(a => a + 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">+</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="font-bold text-sm text-primary">Children</div>
                        <div className="text-xs text-secondary">2-11 yrs</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={children <= 0} onClick={() => handleFlightChildrenChange(children - 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">-</button>
                        <span className="font-bold w-4 text-center text-primary">{children}</span>
                        <button type="button" disabled={children >= 9} onClick={() => handleFlightChildrenChange(children + 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">+</button>
                      </div>
                    </div>
                    {children > 0 && (
                      <div className="mb-4 pl-3 border-l-2 border-theme-border space-y-3">
                        {flightChildAges.map((age, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-secondary">Child {idx + 1} Age</span>
                            <select value={age} onChange={(e) => handleFlightChildAgeChange(idx, parseInt(e.target.value))} className="text-xs border border-theme-border rounded p-1.5 bg-surface text-primary outline-none focus:ring-1 focus:ring-brand-500">
                              {[...Array(10)].map((_, i) => <option key={i+2} value={i+2}>{i+2} yrs</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <div className="font-bold text-sm text-primary">Infants</div>
                        <div className="text-xs text-secondary">Under 2 yrs</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={infants <= 0} onClick={() => setInfants(i => i - 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">-</button>
                        <span className="font-bold w-4 text-center text-primary">{infants}</span>
                        <button type="button" disabled={infants >= adults} onClick={() => setInfants(i => i + 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">+</button>
                      </div>
                    </div>
                    <Button className="w-full" size="sm" onClick={(e) => { e.stopPropagation(); setShowTravelers(false); }}>Apply</Button>
                  </div>
                )}
              </div>

              {/* CABIN CLASS POPOVER */}
              <div className={`flex-[0.8] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group relative cursor-pointer rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`} onClick={() => { setShowCabinClass(!showCabinClass); setShowTravelers(false); }}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1">Class</label>
                <div className="flex items-center justify-between mt-1">
                  <div className={`font-black text-primary truncate leading-none ${isCompact ? 'text-base' : 'text-lg'}`}>{cabinClass}</div>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </div>
                {showCabinClass && (
                  <div className="absolute z-40 top-full mt-2 w-48 bg-surface border border-theme-border rounded-xl shadow-xl p-2 right-0 lg:left-0" onClick={e => e.stopPropagation()}>
                    {cabinClasses.map(cls => (
                      <div key={cls} onClick={(e) => { e.stopPropagation(); setCabinClass(cls); setShowCabinClass(false); }} className={`px-3 py-2 text-sm font-semibold cursor-pointer rounded-md flex items-center justify-between transition-colors ${cabinClass === cls ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-secondary hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                        {cls} {cabinClass === cls && <Check className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isCompact && (
                <div className="p-1.5 shrink-0 h-full flex items-center">
                  <Button onClick={handleSearchFlight} className="h-full px-5 py-0 rounded-lg shadow text-sm font-bold uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white flex items-center">
                    Search
                  </Button>
                </div>
              )}
            </div>

            {!isCompact && (
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted shrink-0">Special Fares:</span>
                    <div className="flex items-center gap-2">
                      {specialFares.map(fare => (
                        <button key={fare} onClick={() => setSpecialFare(fare)} className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-colors shrink-0 ${specialFare === fare ? 'bg-primary text-page border-primary dark:bg-slate-200 dark:text-slate-900' : 'bg-transparent text-secondary border-theme-border hover:border-slate-400 dark:hover:border-slate-500'}`}>
                          {fare}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={clearSearchSelection} className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors">
                      Clear Selection
                    </button>
                    {searchFeedback && <div className="text-xs font-bold text-red-500 animate-fade-in">{searchFeedback}</div>}
                  </div>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <Button onClick={handleSearchFlight} className="w-full md:w-auto font-black text-base px-10 py-3 rounded-xl shadow uppercase tracking-widest hover:-translate-y-0.5 transition-all bg-brand-600 hover:bg-brand-700 text-white">
                    <div className="flex items-center justify-center gap-2">
                      <Search className="w-5 h-5" /> Search Flights
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'hotels' && (
          <>
            <div className={`flex flex-col lg:flex-row rounded-xl border border-theme-border divide-y lg:divide-y-0 lg:divide-x divide-theme-border relative bg-surface w-full ${isCompact ? 'shadow-sm items-center h-[56px]' : ''}`}>
              <div className={`flex-[1.5] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Destination</label>
                <input id="hotelDest" type="text" value={hotelDest} onChange={(e) => setHotelDest(e.target.value)} className={`w-full font-black text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent placeholder-slate-300 dark:placeholder-slate-700 ${isCompact ? 'text-base' : 'text-xl'}`} placeholder="WHERE TO?" />
                {!isCompact && <div className="text-xs font-medium text-secondary truncate">City or Hotel Name</div>}
              </div>

              <div className={`flex-1 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Check-in</label>
                <input id="hotelIn" type="date" min={todayIso()} value={hotelIn} onChange={handleHotelInChange} className={`w-full font-black text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent cursor-pointer ${isCompact ? 'text-base' : 'text-lg'}`} />
              </div>

              <div className={`flex-1 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Check-out</label>
                <input id="hotelOut" type="date" min={hotelIn || todayIso()} value={hotelOut} onChange={handleHotelOutChange} className={`w-full font-black text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent cursor-pointer disabled:opacity-30 ${isCompact ? 'text-base' : 'text-lg'}`} disabled={!hotelIn} />
              </div>

              <div className={`flex-[1.2] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group relative rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none ${isCompact ? 'px-4 flex flex-col justify-center h-full' : 'p-3 md:p-4'}`} onClick={() => setShowHotelGuests(!showHotelGuests)}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Guests & Rooms</label>
                <div className="flex items-center justify-between mt-1">
                  <div className={`font-black text-primary truncate leading-none ${isCompact ? 'text-base' : 'text-lg'}`}>
                    {hotelAdults + hotelChildren} {!isCompact && <><span className="text-sm font-semibold">Guest{hotelAdults + hotelChildren > 1 ? 's' : ''},</span> {hotelRooms} <span className="text-sm font-semibold">Room{hotelRooms > 1 ? 's' : ''}</span></>}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </div>
                {showHotelGuests && (
                  <div className="absolute z-40 top-full mt-2 w-[calc(100vw-32px)] md:w-72 bg-surface border border-theme-border rounded-xl shadow-xl p-5 right-0" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="font-bold text-sm text-primary">Rooms</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={hotelRooms <= 1} onClick={() => setHotelRooms(r => r - 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">-</button>
                        <span className="font-bold w-4 text-center text-primary">{hotelRooms}</span>
                        <button type="button" disabled={hotelRooms >= 9} onClick={() => setHotelRooms(r => r + 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">+</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="font-bold text-sm text-primary">Adults</div>
                        <div className="text-xs text-secondary">12+ yrs</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={hotelAdults <= 1} onClick={() => setHotelAdults(a => a - 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">-</button>
                        <span className="font-bold w-4 text-center text-primary">{hotelAdults}</span>
                        <button type="button" disabled={hotelAdults >= 14} onClick={() => setHotelAdults(a => a + 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">+</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="font-bold text-sm text-primary">Children</div>
                        <div className="text-xs text-secondary">0-11 yrs</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={hotelChildren <= 0} onClick={() => handleHotelChildrenChange(hotelChildren - 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">-</button>
                        <span className="font-bold w-4 text-center text-primary">{hotelChildren}</span>
                        <button type="button" disabled={hotelChildren >= 9} onClick={() => handleHotelChildrenChange(hotelChildren + 1)} className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center disabled:opacity-30 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">+</button>
                      </div>
                    </div>
                    {hotelChildren > 0 && (
                      <div className="mb-4 pl-3 border-l-2 border-theme-border space-y-3">
                        {hotelChildAges.map((age, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-secondary">Child {idx + 1} Age</span>
                            <select value={age} onChange={(e) => handleHotelChildAgeChange(idx, parseInt(e.target.value))} className="text-xs border border-theme-border rounded p-1.5 bg-surface text-primary outline-none focus:ring-1 focus:ring-brand-500">
                              {[...Array(12)].map((_, i) => <option key={i} value={i}>{i === 0 ? '< 1' : i} yrs</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button className="w-full" size="sm" onClick={(e) => { e.stopPropagation(); setShowHotelGuests(false); }}>Apply</Button>
                  </div>
                )}
              </div>

              {isCompact && (
                <div className="p-1.5 shrink-0 h-full flex items-center">
                  <Button onClick={handleSearchHotel} className="h-full px-5 py-0 rounded-lg shadow text-sm font-bold uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white flex items-center">
                    Search
                  </Button>
                </div>
              )}
            </div>

            {!isCompact && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                <div className="flex-1">
                  {searchFeedback && <div className="text-xs font-bold text-red-500 animate-fade-in">{searchFeedback}</div>}
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <Button onClick={handleSearchHotel} className="w-full md:w-auto font-black text-base px-10 py-3 rounded-xl shadow uppercase tracking-widest hover:-translate-y-0.5 transition-all bg-brand-600 hover:bg-brand-700 text-white">
                    <div className="flex items-center justify-center gap-2">
                      <Search className="w-5 h-5" /> Search Hotels
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'packages' && (
          <>
            <div className={`flex flex-col md:flex-row rounded-xl border border-theme-border bg-surface relative items-center w-full`}>
              <div className={`flex-1 w-full hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group rounded-xl p-4 md:p-6`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Where do you want to holiday?</label>
                <input type="text" id="packageDestination" placeholder="e.g. Maldives, Swiss Alps, Dubai" className={`w-full font-black text-primary border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder-slate-700 outline-none bg-transparent text-2xl`} />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mt-4">
              <div className="shrink-0 w-full md:w-auto">
                <Button onClick={() => {
                  setIsSearching(true);
                  setSearchType('packages');
                  setTimeout(() => {
                    navigate('/packages');
                    setIsSearching(false);
                  }, 1200);
                }} className="w-full md:w-auto font-black text-base px-10 py-3 rounded-xl shadow uppercase tracking-widest hover:-translate-y-0.5 transition-all bg-brand-600 hover:bg-brand-700 text-white">
                  <div className="flex items-center justify-center gap-2">
                    Search Packages
                  </div>
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'explore' && (
          <>
            <div className={`flex flex-col md:flex-row rounded-xl border border-theme-border bg-surface relative items-center w-full`}>
              <div className={`flex-1 w-full hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group rounded-xl p-4 md:p-6`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Discover new destinations</label>
                <input type="text" placeholder="Anywhere in the world" className={`w-full font-black text-primary border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder-slate-700 outline-none bg-transparent text-2xl`} />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mt-4">
              <div className="shrink-0 w-full md:w-auto">
                <Button onClick={() => {
                  navigate('/explore');
                }} className="w-full md:w-auto font-black text-base px-10 py-3 rounded-xl shadow uppercase tracking-widest hover:-translate-y-0.5 transition-all bg-brand-600 hover:bg-brand-700 text-white">
                  <div className="flex items-center justify-center gap-2">
                    Start Exploring
                  </div>
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'plan' && (
          <>
            <div className={`flex flex-col md:flex-row rounded-xl border border-theme-border bg-surface relative items-center w-full ${isCompact ? 'shadow-sm h-[56px]' : ''}`}>
              <div className={`flex-1 w-full hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group rounded-xl ${isCompact ? 'px-6 flex flex-col justify-center h-full' : 'p-4 md:p-6'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Where do you want to go?</label>
                <input type="text" id="planDestination" value={planDestination} onChange={(e) => setPlanDestination(e.target.value)} placeholder="e.g. Bali, Paris, Tokyo" className={`w-full font-black text-primary border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder-slate-700 outline-none bg-transparent ${isCompact ? 'text-lg' : 'text-2xl'}`} />
              </div>
              
              {isCompact && (
                <div className="p-1.5 shrink-0 h-full flex items-center">
                  <Button onClick={() => {
                    setIsSearching(true);
                    setSearchType('packages');
                    setTimeout(() => {
                      navigate('/plan', { state: { destination: planDestination } });
                      setIsSearching(false);
                    }, 1200);
                  }} className="h-full px-5 py-0 rounded-lg shadow text-sm font-bold uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white flex items-center">
                    Start Planning
                  </Button>
                </div>
              )}
            </div>

            {!isCompact && (
              <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mt-4">
                <div className="shrink-0 w-full md:w-auto">
                  <Button onClick={() => {
                    setIsSearching(true);
                    setSearchType('packages');
                    setTimeout(() => {
                      navigate('/plan', { state: { destination: planDestination } });
                      setIsSearching(false);
                    }, 1200);
                  }} className="w-full md:w-auto font-black text-base px-10 py-3 rounded-xl shadow uppercase tracking-widest hover:-translate-y-0.5 transition-all bg-brand-600 hover:bg-brand-700 text-white">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl leading-none -mt-0.5">🌍</span> Start Planning
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading Overlay */}
      {isSearching && (
        <div className="fixed inset-0 z-[999] bg-page/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-theme-border flex flex-col items-center text-center max-w-sm w-full mx-4 animate-fade-in">
            {searchType === 'flights' && (
              <>
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-brand-600">
                  <Plane className="w-8 h-8 motion-safe:animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-primary mb-2">Hold on, we're fetching flights for you</h3>
                <p className="text-sm font-semibold text-secondary">Comparing hundreds of airlines...</p>
              </>
            )}
            {searchType === 'hotels' && (
              <>
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-brand-600">
                  <Hotel className="w-8 h-8 motion-safe:animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-primary mb-2">Hold on, we're fetching hotels for you</h3>
                <p className="text-sm font-semibold text-secondary">Finding the best rooms at great prices...</p>
              </>
            )}
            {searchType === 'packages' && (
              <>
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-brand-600">
                  <MapPin className="w-8 h-8 motion-safe:animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-primary mb-2">Preparing your trip planner</h3>
                <p className="text-sm font-semibold text-secondary">Getting recommendations ready...</p>
              </>
            )}
            <div className="w-full max-w-xs h-1.5 overflow-hidden rounded-full bg-elevated mt-6">
              <div className="h-full w-1/2 rounded-full bg-brand-500 motion-safe:animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
