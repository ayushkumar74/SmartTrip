import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { flightService } from '../services/flight.service';
import Button from '../components/ui/Button';
import { Plane, Loader2, X, ChevronRight, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import AirportAutocomplete from '../components/flights/AirportAutocomplete';
import AirlineLogo from '../components/flights/AirlineLogo';

const todayIso = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

// Subcomponent: 7-Day Fare Calendar
function FareCalendar({ criteria, activeDate, onDateSelect }) {
  const { formatMoney } = useSettings();
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCalendar = async () => {
      if (!criteria.from || !criteria.to || !criteria.date) return;
      setLoading(true);
      try {
        const res = await flightService.getFareCalendar(criteria);
        if (active && res && res.data && res.data.calendar) {
          setCalendar(res.data.calendar);
        }
      } catch (err) {
        console.error('Fare calendar error:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCalendar();
    return () => { active = false; };
  }, [criteria.from, criteria.to, criteria.date]);

  if (loading) {
    return (
      <div className="bg-surface border-b border-theme-border flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
      </div>
    );
  }

  if (calendar.length === 0) return null;

  return (
    <div className="bg-surface border-b border-theme-border overflow-x-auto no-scrollbar py-2">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
        {calendar.map((item, idx) => {
          const isSelected = item.date === activeDate;
          const isPast = item.date < todayIso();
          
          return (
            <button
              key={item.date}
              disabled={isPast || !item.price}
              onClick={() => onDateSelect(item.date)}
              className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl border flex flex-col items-center transition-all ${
                isSelected 
                  ? 'bg-brand-50 border-brand-500 shadow-[0_0_0_1px_rgba(37,99,235,1)] dark:bg-brand-900/30 dark:border-brand-400' 
                  : isPast 
                    ? 'border-transparent opacity-30 cursor-not-allowed' 
                    : !item.price 
                      ? 'border-transparent opacity-50 cursor-not-allowed'
                      : 'border-theme-border hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`text-xs font-bold mb-1 ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-secondary'}`}>
                {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className={`text-sm font-black ${isSelected ? 'text-brand-700 dark:text-brand-300' : item.price ? 'text-primary' : 'text-muted'}`}>
                {item.price ? formatMoney(item.price, 'INR') : '—'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Subcomponent: View Fares Modal
function ViewFaresModal({ flight, onClose, onBook }) {
  const { formatMoney } = useSettings();
  
  // Stagger animation state
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  const fareOptions = flight.fareOptions || [
    // Fallback just in case
    { id: 'regular', name: 'Regular', price: flight.price, cabinBaggage: flight.cabinBaggageKg ? `${flight.cabinBaggageKg}kg` : 'Check Airline', checkInBaggage: flight.checkInBaggageKg ? `${flight.checkInBaggageKg}kg` : 'Check Airline', cancellationFee: 'Check rules', dateChangeFee: 'Check rules' }
  ];

  return (
    <div className={`fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`w-full max-w-4xl bg-surface/95 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-t-2xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${visible ? 'translate-y-0 scale-100' : 'translate-y-12 sm:translate-y-8 scale-95'}`}>
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-theme-border flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-primary">Select a Fare</h2>
            <div className="text-sm font-semibold text-secondary mt-1 flex items-center gap-2">
              <AirlineLogo logoUrl={flight.airlineLogoUrl} airlineCode={flight.airlineCode} airlineName={flight.airline} className="w-5 h-5" />
              <span>{flight.departureAirport} → {flight.arrivalAirport}</span>
              <span className="text-muted">•</span>
              <span>{new Date(flight.departureTime).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-elevated rounded-full transition-colors text-secondary"><X className="w-6 h-6" /></button>
        </div>

        {/* Fare Options */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fareOptions.map((fare, idx) => (
              <div key={fare.id} className="border border-theme-border hover:border-brand-500 hover:shadow-lg rounded-xl flex flex-col transition-all cursor-pointer group bg-page" onClick={() => onBook(flight, fare)}>
                <div className="p-5 border-b border-theme-border bg-slate-50 dark:bg-slate-900/30 rounded-t-xl">
                  <div className="text-lg font-black text-primary mb-1 uppercase tracking-wider">{fare.name}</div>
                  <div className="text-2xl font-black text-brand-600 dark:text-brand-400">{formatMoney(fare.price, flight.currency)}</div>
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Check className="w-4 h-4 text-green-500" /></div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted">Cabin Baggage</div>
                      <div className="text-sm font-semibold text-primary">{fare.cabinBaggage}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Check className="w-4 h-4 text-green-500" /></div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted">Check-in Baggage</div>
                      <div className="text-sm font-semibold text-primary">{fare.checkInBaggage}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Check className="w-4 h-4 text-green-500" /></div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted">Cancellation</div>
                      <div className="text-sm font-semibold text-primary">{fare.cancellationFee}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Check className="w-4 h-4 text-green-500" /></div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted">Date Change</div>
                      <div className="text-sm font-semibold text-primary">{fare.dateChangeFee}</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button className="w-full font-black uppercase tracking-widest text-xs py-3" onClick={(e) => { e.stopPropagation(); onBook(flight, fare); }}>Book {fare.name}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FlightResults() {
  const { formatMoney } = useSettings();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ── URL params (authoritative source of truth for current search) ───────────
  const urlFrom     = searchParams.get('from')   || '';
  const urlTo       = searchParams.get('to')     || '';
  const urlDate     = searchParams.get('date')   || todayIso();
  const urlReturnDate = searchParams.get('returnDate') || '';
  const urlAdults   = searchParams.get('adults') || '1';
  const urlChildren = searchParams.get('children') || '0';
  const urlInfants  = searchParams.get('infants') || '0';
  const urlChildAges = searchParams.get('childAges') || '';
  const urlClass    = searchParams.get('class')  || 'Economy';
  const urlFare     = searchParams.get('fare')   || 'Regular';

  // ── Search-bar input state (separate from URL params) ────────────────────────
  const [displayFrom, setDisplayFrom] = useState(urlFrom);
  const [displayTo,   setDisplayTo]   = useState(urlTo);
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport,   setToAirport]   = useState(null);
  const [searchDate,  setSearchDate]  = useState(urlDate);
  const [returnDate, setReturnDate] = useState(urlReturnDate);
  const [validationMsg, setValidationMsg] = useState('');

  // When URL changes (new search landed), sync the search bar displays
  useEffect(() => {
    setDisplayFrom(urlFrom);
    setDisplayTo(urlTo);
    setSearchDate(urlDate);
    setReturnDate(urlReturnDate);
    setFromAirport(null);
    setToAirport(null);
    setValidationMsg('');
  }, [urlFrom, urlTo, urlDate, urlReturnDate]);

  // ── Flight results state ─────────────────────────────────────────────────────
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const [selectedFlightForFares, setSelectedFlightForFares] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchFlights = async () => {
      if (!urlFrom || !urlTo) {
        setFlights([]);
        setLoading(false);
        return;
      }
    try {
      setLoading(true);
      setSearchError('');
      const data = await flightService.searchFlights({
        from: urlFrom,
        to: urlTo,
        date: urlDate,
        returnDate: urlReturnDate,
        adults: Number(urlAdults) || 1,
        children: Number(urlChildren) || 0,
        infants: Number(urlInfants) || 0,
        childAges: urlChildAges,
        class: urlClass,
        sortBy: 'price',
        sortOrder: 'asc',
      });
      if (active) {
        const offers = data.data.flights || [];
        let fetched = Array.from(new Map(offers.map((flight) => [flight.id, flight])).values());
        
        setFlights(fetched);
      }
    } catch (err) {
      console.error(err);
      if (active) {
        setFlights([]);
        setSearchError('We could not load flights right now. Please try again.');
      }
    } finally {
      if (active) setLoading(false);
    }
    };
    fetchFlights();
    return () => { active = false; };
  }, [urlFrom, urlTo, urlDate, urlAdults, urlChildren, urlInfants, urlClass, urlFare, retryCount]);

  const handleFromTextChange = (text) => {
    setDisplayFrom(text);
    setFromAirport(null);
    setValidationMsg('');
  };

  const handleToTextChange = (text) => {
    setDisplayTo(text);
    setToAirport(null);
    setValidationMsg('');
  };

  const handleFromSelect = (airport) => {
    setFromAirport(airport);
    setDisplayFrom(airport.code || airport.city || airport.name);
    setValidationMsg('');
  };

  const handleToSelect = (airport) => {
    setToAirport(airport);
    setDisplayTo(airport.code || airport.city || airport.name);
    setValidationMsg('');
  };

  const executeSearch = (overrideDate = null) => {
    const effectiveFrom = fromAirport ? fromAirport.code : (displayFrom.trim().length === 3 ? displayFrom.trim().toUpperCase() : null);
    const effectiveTo = toAirport ? toAirport.code : (displayTo.trim().length === 3 ? displayTo.trim().toUpperCase() : null);
    
    if (!effectiveFrom || !effectiveTo || effectiveFrom === effectiveTo) {
      setValidationMsg('Please select valid and distinct departure/destination airports.');
      return;
    }
    
    setValidationMsg('');
    
    const targetDate = overrideDate || searchDate;
    let qs = `/flights?from=${encodeURIComponent(effectiveFrom)}&to=${encodeURIComponent(effectiveTo)}&date=${encodeURIComponent(targetDate)}`;
    if (returnDate && returnDate > targetDate) qs += `&returnDate=${encodeURIComponent(returnDate)}`;
    
    // Preserve other context
    qs += `&adults=${encodeURIComponent(urlAdults)}&children=${encodeURIComponent(urlChildren)}&infants=${encodeURIComponent(urlInfants)}`;
    if (urlChildAges) qs += `&childAges=${encodeURIComponent(urlChildAges)}`;
    qs += `&class=${encodeURIComponent(urlClass)}&fare=${encodeURIComponent(urlFare)}`;
    
    navigate(qs);
  };

  const handleBook = (flight, selectedFare) => {
    setSelectedFlightForFares(null);

    const fareId = selectedFare?.id || 'saver';

    navigate(
      `/flights/${encodeURIComponent(flight.id)}/passenger?fare=${encodeURIComponent(fareId)}`
    );
  };

  const formatTime = (isoString) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-page pb-16">

      {/* ── 1. Search Summary & Fare Calendar (Coordinated Sticky) ──────────────────────── */}
      <div className="sticky top-[64px] z-40 flex flex-col shadow-sm">
        <div className="bg-surface border-b border-theme-border text-primary transition-colors">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-start gap-2 bg-page border border-transparent focus-within:border-brand-500 transition-colors p-1.5 rounded-lg w-full md:w-auto flex-1 min-w-0">
              <AirportAutocomplete id="resultsFrom" value={displayFrom} airport={fromAirport} onChange={handleFromTextChange} onSelect={handleFromSelect} placeholder="From" className="w-full text-sm font-black" />
            </div>
            <span className="text-muted hidden md:block shrink-0"><ChevronRight className="w-4 h-4"/></span>
            <div className="flex items-start gap-2 bg-page border border-transparent focus-within:border-brand-500 transition-colors p-1.5 rounded-lg w-full md:w-auto flex-1 min-w-0">
              <AirportAutocomplete id="resultsTo" value={displayTo} airport={toAirport} onChange={handleToTextChange} onSelect={handleToSelect} placeholder="To" className="w-full text-sm font-black" />
            </div>
            <div className="flex items-center gap-2 bg-page border border-theme-border p-1.5 rounded-lg w-full md:w-auto flex-1">
              <input type="date" value={searchDate} min={todayIso()} onChange={(e) => setSearchDate(e.target.value)} className="bg-transparent border-none font-bold text-sm p-1 outline-none w-full text-primary" />
            </div>
            <div className="flex items-center gap-2 bg-page border border-theme-border p-2 rounded-lg w-full md:w-auto flex-[0.8]">
              <div className="font-bold text-[10px] uppercase tracking-widest text-secondary truncate">
                {parseInt(urlAdults) + parseInt(urlChildren) + parseInt(urlInfants)} Traveller{parseInt(urlAdults) + parseInt(urlChildren) + parseInt(urlInfants) !== 1 ? 's' : ''} · {urlClass}
              </div>
            </div>
            <button onClick={() => executeSearch()} className="bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-colors w-full md:w-auto shrink-0 shadow-sm">
              Update
            </button>
          </div>
          {validationMsg && <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-2"><p className="text-red-500 text-xs font-bold">{validationMsg}</p></div>}
        </div>
        
        {/* 7-Day Fare Calendar included in the sticky block */}
        <FareCalendar criteria={{ from: urlFrom, to: urlTo, date: urlDate }} activeDate={urlDate} onDateSelect={(d) => executeSearch(d)} />
      </div>

      {/* ── 3. Filters + Sort + Results ────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
              <div className="p-4 border-b border-theme-border bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-black text-primary uppercase tracking-widest text-xs">Popular Filters</h3>
              </div>
              <div className="p-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-brand-600 rounded border-theme-border focus:ring-brand-500 bg-transparent" />
                  <span className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors">Non Stop</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-brand-600 rounded border-theme-border focus:ring-brand-500 bg-transparent" />
                  <span className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors">Morning Departures</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-brand-600 rounded border-theme-border focus:ring-brand-500 bg-transparent" />
                  <span className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors">Refundable Fares</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-primary">
                {urlFrom && urlTo ? `Flights from ${urlFrom} to ${urlTo}` : 'Search for Flights'}
              </h2>
              <select className="text-xs font-bold uppercase tracking-widest bg-surface border border-theme-border rounded-lg px-3 py-2 cursor-pointer text-primary focus:ring-1 focus:ring-brand-500 outline-none">
                <option>Cheapest First</option>
                <option>Fastest First</option>
              </select>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 px-5 bg-surface rounded-2xl shadow-sm border border-theme-border">
                <div className="flex items-center gap-3 text-brand-500"><Plane className="w-8 h-8 motion-safe:animate-bounce" /></div>
                <div className="text-center">
                  <p className="font-black text-lg text-primary">Searching flights...</p>
                  <p className="text-sm font-semibold text-secondary mt-1">Comparing prices across airlines</p>
                </div>
                <div className="w-full max-w-xs h-1.5 overflow-hidden rounded-full bg-elevated mt-2"><div className="h-full w-1/2 rounded-full bg-brand-500 motion-safe:animate-pulse" /></div>
              </div>
            ) : searchError ? (
              <div className="bg-surface rounded-2xl border border-red-200 dark:border-red-900/50 py-16 px-6 text-center shadow-sm">
                <Plane className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-primary mb-2">Flight search unavailable</h3>
                <p className="text-secondary font-semibold mb-6">{searchError}</p>
                <Button onClick={() => setRetryCount((count) => count + 1)} className="font-black uppercase tracking-widest text-xs px-8 py-3 rounded-full">Retry search</Button>
              </div>
            ) : flights && flights.length > 0 ? (
              <div className="space-y-4">
                {flights.map((flight, index) => (
                  <div key={flight.id} className="min-w-0 bg-surface rounded-2xl shadow-sm border border-theme-border hover:border-brand-500/50 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row p-5 relative group animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                    
                    {/* Airline Identity */}
                    <div className="w-full md:w-[220px] flex items-center gap-4 shrink-0 mb-5 md:mb-0">
                      <AirlineLogo logoUrl={flight.airlineLogoUrl} airlineCode={flight.airlineCode} airlineName={flight.airline} className="w-12 h-12 text-lg" />
                      <div>
                        <div className="font-black text-primary text-base leading-tight">{flight.airline || flight.airlineCode}</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-secondary mt-0.5">{flight.flightNumber}</div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 min-w-0 grid grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] items-center px-2 md:px-8 py-4 md:py-0">
                      <div className="min-w-0 text-right pr-4">
                        <div className="text-2xl font-black text-primary tracking-tight">{formatTime(flight.departureTime)}</div>
                        <div className="text-xs font-bold text-secondary uppercase mt-1">{flight.departureAirport}</div>
                        {flight.departureCity && <div className="text-[10px] font-semibold text-muted truncate mt-0.5">{flight.departureCity}</div>}
                      </div>
                      <div className="w-full flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">{flight.duration || '--'}</div>
                        <div className="w-full relative flex items-center justify-center">
                          <div className="w-full h-[2px] bg-theme-border rounded-full"></div>
                          <div className="absolute w-2.5 h-2.5 rounded-full border-[2px] border-surface bg-muted left-0"></div>
                          <div className="absolute w-2.5 h-2.5 rounded-full border-[2px] border-surface bg-muted right-0"></div>
                          <div className={`absolute bg-surface px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${flight.stops === 0 ? 'text-green-600 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20' : 'text-secondary border-theme-border'}`}>
                            {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops === 1 ? '' : 's'}`}
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 text-left pl-4">
                        <div className="text-2xl font-black text-primary tracking-tight">{formatTime(flight.arrivalTime)}</div>
                        <div className="text-xs font-bold text-secondary uppercase mt-1">{flight.arrivalAirport}</div>
                        {flight.arrivalCity && <div className="text-[10px] font-semibold text-muted truncate mt-0.5">{flight.arrivalCity}</div>}
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="w-full md:w-[200px] shrink-0 pl-0 md:pl-6 pt-5 md:pt-0 border-t md:border-t-0 md:border-l border-theme-border flex flex-row md:flex-col justify-between items-center md:items-end md:justify-center gap-3">
                      <div className="text-left md:text-right">
                        <div className="text-3xl font-black text-primary leading-none tracking-tight">
                          {formatMoney(flight.price, flight.currency)}
                        </div>
                        <div className="mt-2 flex flex-wrap justify-start md:justify-end gap-1.5 text-[9px] font-black uppercase tracking-widest text-secondary">
                          {flight.cabinClass && <span className="bg-elevated px-1.5 py-0.5 rounded">{flight.cabinClass.replace('_', ' ')}</span>}
                          {flight.baggage && <span className="bg-elevated px-1.5 py-0.5 rounded">{flight.baggage}</span>}
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedFlightForFares(flight)}
                        className="font-black text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-full shadow-sm"
                      >
                        View Fares
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-2xl border border-theme-border py-20 px-6 text-center shadow-sm">
                <Plane className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-black text-primary mb-2">No flights found</h3>
                <p className="text-secondary font-semibold mb-6">Try adjusting your travel dates or filters.</p>
                <Button onClick={() => navigate('/')} className="font-black uppercase tracking-widest text-xs px-8 py-3 rounded-full">Return to Dashboard</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedFlightForFares && (
        <ViewFaresModal flight={selectedFlightForFares} onClose={() => setSelectedFlightForFares(null)} onBook={handleBook} />
      )}
    </div>
  );
}
