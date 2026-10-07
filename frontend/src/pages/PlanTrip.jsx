import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, Heart, Plane, Hotel, CheckCircle2, Sparkles, Search, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { placesService } from '../services/places.service';
import { tripService } from '../services/trip.service';

const todayIso = () => {
 const d = new Date();
 const offset = d.getTimezoneOffset();
 return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

export default function PlanTrip() {
 const { t } = {}; // not used — suppress linter
 const location = useLocation();
 const navigate = useNavigate();
 const editingTrip = location.state?.trip || null;
 const [step, setStep] = useState(1);
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);
 const [savedTripId, setSavedTripId] = useState(null);
 const [saveError, setSaveError] = useState('');
 const [plan, setPlan] = useState({
  destination: editingTrip?.destination?.name || location.state?.destination || '',
  destinationId: editingTrip?.destination?.id || location.state?.destinationId || null,
 startDate: '',
 endDate: '',
 dates: '',
  travelers: { adults: 2, children: 0, infants: 0 },
 interests: []
 });
 const [editingTripId] = useState(editingTrip?.id || null);

 useEffect(() => {
  if (editingTrip) {
   setPlan(prev => ({ ...prev, startDate: editingTrip.startDate?.slice(0, 10) || '', endDate: editingTrip.endDate?.slice(0, 10) || '', dates: editingTrip.startDate && editingTrip.endDate ? `${editingTrip.startDate.slice(0, 10)} → ${editingTrip.endDate.slice(0, 10)}` : prev.dates }));
  }
 }, [editingTrip]);

 useEffect(() => {
 if (location.state?.destination && !plan.destination) {
  setPlan(prev => ({ ...prev, destination: location.state.destination, destinationId: location.state.destinationId || prev.destinationId }));
 }
 }, [location]);

 const steps = [
 { num: 1, title: 'Destination', desc: 'Where are you going?' },
 { num: 2, title: 'Dates & Travelers', desc: 'When and who?' },
 { num: 3, title: 'Preferences', desc: 'What do you love?' },
 { num: 4, title: 'Your Itinerary', desc: 'Review your plan' }
 ];

 const toggleInterest = (interest) => {
 if (plan.interests.includes(interest)) {
 setPlan({...plan, interests: plan.interests.filter(i => i !== interest)});
 } else {
 setPlan({...plan, interests: [...plan.interests, interest]});
 }
 };

 const handleStartDate = (value) => {
  setPlan(prev => ({
   ...prev,
   startDate: value || '',
   dates: value && prev.endDate ? `${value} → ${prev.endDate}` : ''
  }));
 };

 const handleEndDate = (value) => {
  setPlan(prev => ({
   ...prev,
   endDate: value || '',
   dates: prev.startDate && value ? `${prev.startDate} → ${value}` : ''
  }));
 };

 const [destinationSuggestions, setDestinationSuggestions] = useState([]);
 const [popularDestinations, setPopularDestinations] = useState([]);
 const [destLoading, setDestLoading] = useState(false);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const destDebounce = useRef(null);

 useEffect(() => {
  let active = true;
  placesService.searchPlaces('', 'city')
   .then(result => {
    if (active) setPopularDestinations(Array.isArray(result?.results) ? result.results.slice(0, 6) : []);
   })
   .catch(() => {
    if (active) setPopularDestinations([]);
   });
  return () => { active = false; };
 }, []);

 const handleDestinationChange = async (val) => {
  setPlan(prev => ({ ...prev, destination: val, destinationId: null }));
  if (destDebounce.current) clearTimeout(destDebounce.current);
  if (val.trim().length < 2) { setDestinationSuggestions([]); setShowSuggestions(false); return; }
  destDebounce.current = setTimeout(async () => {
   setDestLoading(true);
   try {
    const result = await placesService.searchPlaces(val.trim(), 'city');
    setDestinationSuggestions(Array.isArray(result?.results) ? result.results.slice(0, 6) : []);
    setShowSuggestions(true);
   } catch (e) { setDestinationSuggestions([]); }
   finally { setDestLoading(false); }
  }, 350);
 };

 const selectDestination = (suggestion) => {
  setPlan(prev => ({ ...prev, destination: suggestion.name, destinationId: suggestion.id }));
  setShowSuggestions(false);
  setDestinationSuggestions([]);
 };

 const updateTravelerCount = (type, delta) => {
  setPlan(prev => {
   const travelers = { ...prev.travelers };
   const maximum = type === 'children' ? 9 : type === 'adults' ? 14 : travelers.adults;
   travelers[type] = Math.max(type === 'adults' ? 1 : 0, Math.min(maximum, travelers[type] + delta));
   if (type === 'adults' && travelers.infants > travelers.adults) travelers.infants = travelers.adults;
   return { ...prev, travelers };
  });
 };

 const handleContinue = () => {
  setSaveError('');
  if (step === 1 && (!plan.destinationId || !plan.destination.trim())) {
   setSaveError('Select a destination from the suggestions before continuing.');
   return;
  }
  if (step === 2 && (!plan.startDate || !plan.endDate || plan.endDate <= plan.startDate)) {
   setSaveError('Select valid travel dates. End date must be after start date.');
   return;
  }
  setStep(currentStep => currentStep + 1);
 };

 const handleSaveTrip = async () => {
  if (saving || saved) return;
  if (!plan.startDate || !plan.endDate || plan.endDate <= plan.startDate) {
   setSaveError('Select valid travel dates. End date must be after start date.');
   return;
  }
  setSaving(true);
  setSaveError('');
  try {
    const nextDay = new Date(`${plan.startDate}T00:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
   const tripTitle = plan.destination ? `Trip to ${plan.destination}` : 'My Trip';
  const tripPayload = {
    title: tripTitle,
    destinationId: plan.destinationId?.startsWith('db_dest_') ? plan.destinationId.replace('db_dest_', '') : undefined,
    destinationName: plan.destination || undefined,
    startDate: plan.startDate,
    endDate: plan.endDate,
    days: [
     {
      dayNumber: 1,
      date: nextDay.toISOString().slice(0, 10),
      activities: [
       { title: 'Arrive at International Airport', description: 'Transfer to city center', activityType: 'Flight', sortOrder: 0 },
       { title: 'Hotel Check-in', description: 'Rest and settle in', activityType: 'Hotel', sortOrder: 1 },
      ],
     },
     {
      dayNumber: 2,
      date: plan.startDate,
      activities: [
       { title: 'Historical District Walking Tour', description: 'Guided tour of main landmarks', activityType: 'Attraction', sortOrder: 0 },
       { title: 'Dinner at local restaurant', description: 'Reservation recommended', activityType: 'Restaurant', sortOrder: 1 },
      ],
     },
    ],
  };
  const resp = editingTripId
   ? await tripService.updateTrip(editingTripId, { title: tripTitle, destinationId: plan.destinationId?.replace('db_dest_', ''), startDate: plan.startDate, endDate: plan.endDate })
   : await tripService.createTrip(tripPayload);
   const trip = resp.data?.trip;
   setSavedTripId(trip?.id || null);
   setSaved(true);
  } catch (err) {
   const msg = err?.response?.data?.message || err.message || 'Failed to save trip.';
   setSaveError(msg);
  } finally {
   setSaving(false);
  }
 };

  return (
    <div className="bg-page min-h-screen">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* LEFT COLUMN: Progress & Navigation (Fixed width) */}
        <div className="w-full lg:w-80 bg-surface border-r border-theme-border p-6 lg:p-8 shrink-0 flex flex-col">
          <div className="mb-10">
            <h1 className="text-2xl font-black text-primary tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" /> Trip Planner
            </h1>
            <p className="text-sm font-medium text-secondary mt-2">Design your perfect itinerary.</p>
          </div>

 <div className="flex-1">
            <div className="relative">
              {/* Vertical line connecting steps */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-theme-border z-0"></div>
              
              <div className="space-y-8 relative z-10">
                {steps.map((s, idx) => {
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  return (
                    <div key={s.num} className={`flex items-start gap-4 transition-opacity ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-300 ${isActive ? 'bg-accent border-accent text-white shadow-md shadow-accent/20' : isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-surface border-theme-border text-muted'}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-black text-sm">{s.num}</span>}
                      </div>
                      <div className="pt-2">
                        <h3 className={`font-black uppercase tracking-widest text-[11px] ${isActive ? 'text-accent' : isCompleted ? 'text-green-500' : 'text-secondary'}`}>Step {s.num}</h3>
                        <p className={`font-bold text-base mt-0.5 ${isActive || isCompleted ? 'text-primary' : 'text-secondary'}`}>{s.title}</p>
                      </div>
                    </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>

 {/* RIGHT COLUMN: Interactive Workspace */}
 <div className="flex-1 p-6 lg:p-12 relative overflow-y-auto">
 <div className="max-w-3xl mx-auto">
 
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-4xl font-black text-primary mb-4 tracking-tight">Where to?</h2>
                <p className="text-lg text-secondary font-medium mb-8">Search for a city, region, or let us inspire you.</p>
                
                <div className="relative mb-8 shadow-xl shadow-theme-border/50 rounded-2xl">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted z-10" />
                  <input
                    type="text"
                    placeholder="e.g. Paris, Tokyo, Bali..."
                    value={plan.destination}
                    onChange={e => handleDestinationChange(e.target.value)}
                    onFocus={() => { if (destinationSuggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full bg-surface border-2 border-theme-border rounded-2xl py-6 pl-16 pr-14 text-2xl font-black text-primary placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
                  />
                  {destLoading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-muted" />}
                  {showSuggestions && destinationSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-surface rounded-2xl border border-theme-border shadow-2xl overflow-hidden">
                      {destinationSuggestions.map(s => (
                        <button
                          key={s.id}
                          className="w-full text-left px-6 py-4 hover:bg-accent/10 flex items-center gap-4 border-b border-theme-border last:border-0 transition-colors"
                          onMouseDown={(e) => { e.preventDefault(); selectDestination(s); }}
                        >
                          <MapPin className="w-5 h-5 text-accent shrink-0" />
                          <div>
                            <div className="font-black text-primary text-base">{s.name}</div>
                            <div className="text-xs text-muted font-semibold">{s.address}</div>
                          </div>
                          {s.source === 'google' && (
                            <span className="ml-auto text-[10px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded">Google</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4">Popular Destinations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {popularDestinations.map(destination => (
                    <div key={destination.id} onClick={() => selectDestination(destination)} className={`cursor-pointer p-4 rounded-xl border-2 transition-colors flex items-center gap-3 ${plan.destinationId === destination.id ? 'border-accent bg-accent/10' : 'border-theme-border bg-surface hover:border-accent/50'}`}>
                      <MapPin className={`w-5 h-5 ${plan.destinationId === destination.id ? 'text-accent' : 'text-muted'}`} />
                      <span className={`font-bold ${plan.destinationId === destination.id ? 'text-accent' : 'text-primary'}`}>{destination.name}</span>
 </div>
                  ))}
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
 <h2 className="text-4xl font-black text-primary mb-4 tracking-tight">When & Who?</h2>
 <p className="text-lg text-secondary font-medium mb-8">Select your travel dates and companions.</p>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <div className="bg-surface p-6 rounded-2xl border-2 border-theme-border shadow-sm">
 <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted mb-4">
 <Calendar className="w-4 h-4" /> Start Date
 </label>
 <input type="date" min={todayIso()} value={plan.startDate} onChange={(e) => handleStartDate(e.target.value)} className="w-full text-xl font-black text-primary border-none p-0 focus:ring-0 placeholder:text-slate-300 outline-none" />
 </div>
 
 <div className="bg-surface p-6 rounded-2xl border-2 border-theme-border shadow-sm">
 <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted mb-4">
 <Calendar className="w-4 h-4" /> End Date
 </label>
 <input type="date" min={plan.startDate || todayIso()} value={plan.endDate} onChange={(e) => handleEndDate(e.target.value)} className="w-full text-xl font-black text-primary border-none p-0 focus:ring-0 placeholder:text-slate-300 outline-none" />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
 <div className="bg-surface p-6 rounded-2xl border-2 border-theme-border shadow-sm">
 <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted mb-4">
 <Users className="w-4 h-4" /> Travelers
 </label>
 <div className="space-y-3">
  {['adults', 'children', 'infants'].map((type) => (
   <div key={type} className="flex items-center justify-between">
    <span className="text-sm font-bold text-primary capitalize">{type}</span>
    <div className="flex items-center gap-3">
     <button type="button" disabled={type === 'adults' ? plan.travelers.adults <= 1 : plan.travelers[type] <= 0} onClick={() => updateTravelerCount(type, -1)} className="w-7 h-7 rounded-full border border-theme-border text-primary disabled:opacity-40">-</button>
     <span className="w-5 text-center font-black text-primary">{plan.travelers[type]}</span>
     <button type="button" disabled={plan.travelers[type] >= (type === 'children' ? 9 : type === 'adults' ? 14 : plan.travelers.adults)} onClick={() => updateTravelerCount(type, 1)} className="w-7 h-7 rounded-full border border-theme-border text-primary disabled:opacity-40">+</button>
    </div>
   </div>
  ))}
  <div className="pt-2 text-sm font-black text-accent">{plan.travelers.adults} Adult{plan.travelers.adults !== 1 ? 's' : ''}, {plan.travelers.children} Child{plan.travelers.children !== 1 ? 'ren' : ''}, {plan.travelers.infants} Infant{plan.travelers.infants !== 1 ? 's' : ''}</div>
 </div>
 </div>
 </div>
 {plan.startDate && plan.endDate && (
 <div className="bg-accent/10 border border-accent/30 rounded-2xl px-4 py-3 text-sm font-black text-accent">
 Selected: {plan.startDate} → {plan.endDate}
 </div>
 )}
 </div>
 )}

 {step === 3 && (
 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
 <h2 className="text-4xl font-black text-primary mb-4 tracking-tight">What do you love?</h2>
 <p className="text-lg text-secondary font-medium mb-8">Select your interests to personalize your itinerary.</p>
 
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
 {[
 {name: 'History', icon: '🏛️'}, {name: 'Food & Dining', icon: '🍷'},
 {name: 'Nature', icon: '🌲'}, {name: 'Shopping', icon: '🛍️'},
 {name: 'Adventure', icon: '🏂'}, {name: 'Relaxation', icon: '💆'},
 {name: 'Art & Museums', icon: '🎨'}, {name: 'Nightlife', icon: '🌃'}
 ].map(interest => {
 const selected = plan.interests.includes(interest.name);
 return (
 <div 
 key={interest.name} 
 onClick={() => toggleInterest(interest.name)}
 className={`cursor-pointer p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${selected ? 'border-blue-600 bg-accent/10 scale-[1.02] shadow-md shadow-accent/10' : 'border-theme-border bg-surface hover:border-theme-border-strong hover:bg-elevated'}`}
 >
 <span className="text-3xl mb-3">{interest.icon}</span>
 <span className={`font-black ${selected ? 'text-accent' : 'text-secondary'}`}>{interest.name}</span>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {step === 4 && (
 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
 <div className="flex items-center gap-4 mb-8">
 <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
 <CheckCircle2 className="w-8 h-8" />
 </div>
 <div>
 <h2 className="text-3xl font-black text-primary tracking-tight">Your Itinerary is Ready</h2>
 <p className="text-muted font-semibold">{plan.destination || 'Your Destination'} • {plan.travelers.adults} Adult{plan.travelers.adults !== 1 ? 's' : ''}, {plan.travelers.children} Child{plan.travelers.children !== 1 ? 'ren' : ''}, {plan.travelers.infants} Infant{plan.travelers.infants !== 1 ? 's' : ''}</p>
 {plan.dates && <p className="text-muted font-medium text-sm mt-1">{plan.dates}</p>}
 </div>
 </div>
 
 {/* Generated Itinerary Realistic Timeline */}
 <div className="bg-surface rounded-3xl border border-theme-border shadow-xl overflow-hidden mb-12">
 <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
 <div>
 <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Trip Overview</div>
 <div className="text-2xl font-black">{plan.destination || 'Paris, France'}</div>
 <div className="mt-4 flex flex-wrap gap-2">
 {plan.interests.map(interest => (
 <span key={interest} className="px-3 py-1 bg-surface/10 rounded-full text-xs font-bold">{interest}</span>
 ))}
 </div>
 </div>
 <div className="flex gap-2">
 <button className="bg-surface/10 hover:bg-surface/20 p-2 rounded-lg transition-colors"><Plane className="w-5 h-5 text-white" /></button>
 <button className="bg-surface/10 hover:bg-surface/20 p-2 rounded-lg transition-colors"><Hotel className="w-5 h-5 text-white" /></button>
 </div>
 </div>

 <div className="p-6 md:p-8 space-y-8">
 {/* Day 1 */}
 <div className="flex gap-6">
 <div className="flex flex-col items-center">
 <div className="w-12 h-12 bg-elevated rounded-xl flex flex-col items-center justify-center shrink-0 border border-theme-border">
 <span className="text-[10px] font-black uppercase text-muted leading-none mb-0.5">Day</span>
 <span className="text-lg font-black text-primary leading-none">1</span>
 </div>
 <div className="w-px h-full bg-slate-200 mt-4"></div>
 </div>
 <div className="pb-4 pt-1 flex-1">
 <h4 className="text-xl font-black text-primary mb-2">Arrival & Check-in</h4>
 <div className="bg-elevated p-4 rounded-xl border border-theme-border">
 <div className="flex items-start gap-3 mb-3">
 <Plane className="w-5 h-5 text-accent shrink-0" />
 <div>
 <div className="font-bold text-primary">Arrive at International Airport</div>
 <div className="text-sm font-semibold text-muted">10:30 AM • Transfer to city center</div>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Hotel className="w-5 h-5 text-accent shrink-0" />
 <div>
 <div className="font-bold text-primary">Hotel Check-in</div>
 <div className="text-sm font-semibold text-muted">02:00 PM • Rest and settle in</div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Day 2 */}
 <div className="flex gap-6">
 <div className="flex flex-col items-center">
 <div className="w-12 h-12 bg-elevated rounded-xl flex flex-col items-center justify-center shrink-0 border border-theme-border">
 <span className="text-[10px] font-black uppercase text-muted leading-none mb-0.5">Day</span>
 <span className="text-lg font-black text-primary leading-none">2</span>
 </div>
 </div>
 <div className="pt-1 flex-1">
 <h4 className="text-xl font-black text-primary mb-2">City Exploration</h4>
 <div className="bg-elevated p-4 rounded-xl border border-theme-border">
 <div className="flex items-start gap-3 mb-3">
 <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
 <div>
 <div className="font-bold text-primary">Historical District Walking Tour</div>
 <div className="text-sm font-semibold text-muted">09:00 AM • Guided tour of main landmarks</div>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Heart className="w-5 h-5 text-rose-500 shrink-0" />
 <div>
 <div className="font-bold text-primary">Dinner at highly rated local restaurant</div>
 <div className="text-sm font-semibold text-muted">07:30 PM • Reservation recommended</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Bottom Action Bar */}
 <div className="mt-8 pt-8 border-t border-theme-border flex justify-between items-center">
 {step > 1 ? (
 <button onClick={() => setStep(step - 1)} className="px-6 py-3 font-black text-muted hover:text-primary transition-colors uppercase tracking-widest text-sm">
 Back
 </button>
 ) : <div></div>}
 
  {step < 4 ? (
  <div className="flex flex-col items-end gap-2">
  {saveError && <p className="text-red-600 text-xs font-bold">{saveError}</p>}
  <button onClick={handleContinue} className="bg-accent hover:bg-accent/90 text-white px-10 py-4 rounded-full font-black shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5 uppercase tracking-widest text-sm">
  Continue
  </button>
  </div>
  ) : saved ? (
  <div className="flex flex-col items-end gap-2">
   <span className="text-green-600 font-black text-sm">✓ Trip saved!</span>
   <button onClick={() => navigate('/my-trips')} className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm">
    View in My Trips
   </button>
  </div>
  ) : (
  <div className="flex flex-col items-end gap-2">
   {saveError && <p className="text-red-600 text-xs font-bold">{saveError}</p>}
   <button
    onClick={handleSaveTrip}
    disabled={saving}
    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-10 py-4 rounded-full font-black shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 uppercase tracking-widest text-sm flex items-center gap-2"
   >
    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
    {saving ? 'Saving…' : 'Save Trip'}
   </button>
  </div>
  )}
  </div>

  </div>
  </div>
  </div>
  </div>
  );
}
