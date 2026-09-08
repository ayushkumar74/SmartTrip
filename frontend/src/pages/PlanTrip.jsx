import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Heart, Navigation, Plane, Hotel, CheckCircle2, List, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function PlanTrip() {
 const location = useLocation();
 const [step, setStep] = useState(1);
 const [plan, setPlan] = useState({
 destination: '',
 dates: '',
 travelers: '2 Adults',
 interests: []
 });

 useEffect(() => {
 if (location.state?.destination && !plan.destination) {
 setPlan(prev => ({ ...prev, destination: location.state.destination }));
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
                
                <div className="relative mb-12 shadow-xl shadow-theme-border/50 rounded-2xl">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted" />
                  <input 
                    type="text" 
                    placeholder="e.g. Paris, Tokyo, Bali..."
                    value={plan.destination}
                    onChange={e => setPlan({...plan, destination: e.target.value})}
                    className="w-full bg-surface border-2 border-theme-border rounded-2xl py-6 pl-16 pr-6 text-2xl font-black text-primary placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4">Popular Destinations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Bali, Indonesia', 'Kyoto, Japan', 'Rome, Italy', 'Cape Town, SA', 'New York, USA', 'Dubai, UAE'].map(dest => (
                    <div key={dest} onClick={() => setPlan({...plan, destination: dest})} className={`cursor-pointer p-4 rounded-xl border-2 transition-colors flex items-center gap-3 ${plan.destination === dest ? 'border-accent bg-accent/10' : 'border-theme-border bg-surface hover:border-accent/50'}`}>
                      <MapPin className={`w-5 h-5 ${plan.destination === dest ? 'text-accent' : 'text-muted'}`} />
                      <span className={`font-bold ${plan.destination === dest ? 'text-accent' : 'text-primary'}`}>{dest}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
 <h2 className="text-4xl font-black text-text-primary mb-4 tracking-tight">When & Who?</h2>
 <p className="text-lg text-text-secondary font-medium mb-8">Select your travel dates and companions.</p>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <div className="bg-surface p-6 rounded-2xl border-2 border-border shadow-sm">
 <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-muted mb-4">
 <Calendar className="w-4 h-4" /> Travel Dates
 </label>
 <input type="text" value={plan.dates} onChange={(e) => setPlan({...plan, dates: e.target.value})} placeholder="Select dates (e.g. Oct 12 - Oct 18)" className="w-full text-xl font-black text-text-primary border-none p-0 focus:ring-0 placeholder:text-slate-300 outline-none" />
 </div>
 
 <div className="bg-surface p-6 rounded-2xl border-2 border-border shadow-sm">
 <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-muted mb-4">
 <Users className="w-4 h-4" /> Travelers
 </label>
 <select value={plan.travelers} onChange={(e) => setPlan({...plan, travelers: e.target.value})} className="w-full text-xl font-black text-text-primary border-none p-0 focus:ring-0 outline-none cursor-pointer bg-surface">
 <option>1 Adult</option>
 <option>2 Adults</option>
 <option>Family (2 Adults, 2 Kids)</option>
 <option>Group (4+)</option>
 </select>
 </div>
 </div>
 </div>
 )}

 {step === 3 && (
 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
 <h2 className="text-4xl font-black text-text-primary mb-4 tracking-tight">What do you love?</h2>
 <p className="text-lg text-text-secondary font-medium mb-8">Select your interests to personalize your itinerary.</p>
 
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
 className={`cursor-pointer p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${selected ? 'border-blue-600 bg-blue-50 scale-[1.02] shadow-md shadow-blue-100' : 'border-border bg-surface hover:border-border-strong hover:bg-surface-elevated'}`}
 >
 <span className="text-3xl mb-3">{interest.icon}</span>
 <span className={`font-black ${selected ? 'text-blue-700' : 'text-text-secondary'}`}>{interest.name}</span>
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
 <h2 className="text-3xl font-black text-text-primary tracking-tight">Your Itinerary is Ready</h2>
 <p className="text-text-muted font-semibold">{plan.destination || 'Your Destination'} • {plan.travelers}</p>
 {plan.dates && <p className="text-text-muted font-medium text-sm mt-1">{plan.dates}</p>}
 </div>
 </div>
 
 {/* Generated Itinerary Realistic Timeline */}
 <div className="bg-surface rounded-3xl border border-border shadow-xl overflow-hidden mb-12">
 <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
 <div>
 <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Trip Overview</div>
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
 <div className="w-12 h-12 bg-surface-elevated rounded-xl flex flex-col items-center justify-center shrink-0 border border-border">
 <span className="text-[10px] font-black uppercase text-text-muted leading-none mb-0.5">Day</span>
 <span className="text-lg font-black text-text-primary leading-none">1</span>
 </div>
 <div className="w-px h-full bg-slate-200 mt-4"></div>
 </div>
 <div className="pb-4 pt-1 flex-1">
 <h4 className="text-xl font-black text-text-primary mb-2">Arrival & Check-in</h4>
 <div className="bg-surface-elevated p-4 rounded-xl border border-border">
 <div className="flex items-start gap-3 mb-3">
 <Plane className="w-5 h-5 text-blue-600 shrink-0" />
 <div>
 <div className="font-bold text-text-primary">Arrive at International Airport</div>
 <div className="text-sm font-semibold text-text-muted">10:30 AM • Transfer to city center</div>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Hotel className="w-5 h-5 text-blue-600 shrink-0" />
 <div>
 <div className="font-bold text-text-primary">Hotel Check-in</div>
 <div className="text-sm font-semibold text-text-muted">02:00 PM • Rest and settle in</div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Day 2 */}
 <div className="flex gap-6">
 <div className="flex flex-col items-center">
 <div className="w-12 h-12 bg-surface-elevated rounded-xl flex flex-col items-center justify-center shrink-0 border border-border">
 <span className="text-[10px] font-black uppercase text-text-muted leading-none mb-0.5">Day</span>
 <span className="text-lg font-black text-text-primary leading-none">2</span>
 </div>
 </div>
 <div className="pt-1 flex-1">
 <h4 className="text-xl font-black text-text-primary mb-2">City Exploration</h4>
 <div className="bg-surface-elevated p-4 rounded-xl border border-border">
 <div className="flex items-start gap-3 mb-3">
 <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
 <div>
 <div className="font-bold text-text-primary">Historical District Walking Tour</div>
 <div className="text-sm font-semibold text-text-muted">09:00 AM • Guided tour of main landmarks</div>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Heart className="w-5 h-5 text-rose-500 shrink-0" />
 <div>
 <div className="font-bold text-text-primary">Dinner at highly rated local restaurant</div>
 <div className="text-sm font-semibold text-text-muted">07:30 PM • Reservation recommended</div>
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
 <div className="mt-8 pt-8 border-t border-border flex justify-between items-center">
 {step > 1 ? (
 <button onClick={() => setStep(step - 1)} className="px-6 py-3 font-black text-text-muted hover:text-text-primary transition-colors uppercase tracking-widest text-sm">
 Back
 </button>
 ) : <div></div>}
 
 {step < 4 ? (
 <button onClick={() => setStep(step + 1)} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-black shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 uppercase tracking-widest text-sm">
 Continue
 </button>
 ) : (
 <button className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full font-black shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 uppercase tracking-widest text-sm">
 Book This Trip
 </button>
 )}
 </div>

 </div>
 </div>
 </div>
 </div>
 );
}
