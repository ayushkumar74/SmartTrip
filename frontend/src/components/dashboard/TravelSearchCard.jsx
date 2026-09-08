import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Hotel, Calendar, Users, MapPin } from 'lucide-react';
import Button from '../ui/Button';

export default function TravelSearchCard() {
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('flights');
 
 return (
 <div className="bg-surface rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] w-full border border-border/50 relative">
 
 {/* Category Tabs */}
 <div className="flex border-b border-border bg-page rounded-t-2xl overflow-hidden">
 <button onClick={() => setActiveTab('flights')} className={`flex-1 py-4 flex flex-col items-center gap-1 font-black uppercase tracking-widest text-xs transition-colors ${activeTab === 'flights' ? 'bg-surface text-primary border-t-4 border-t-primary' : 'text-text-secondary hover:text-text-primary border-t-4 border-t-transparent'}`}>
 <Plane className="w-6 h-6 mb-1" /> Flights
 </button>
 <button onClick={() => setActiveTab('hotels')} className={`flex-1 py-4 flex flex-col items-center gap-1 font-black uppercase tracking-widest text-xs transition-colors ${activeTab === 'hotels' ? 'bg-surface text-primary border-t-4 border-t-primary' : 'text-text-secondary hover:text-text-primary border-t-4 border-t-transparent'}`}>
 <Hotel className="w-6 h-6 mb-1" /> Hotels
 </button>
 <button onClick={() => setActiveTab('packages')} className={`flex-1 py-4 flex flex-col items-center gap-1 font-black uppercase tracking-widest text-xs transition-colors ${activeTab === 'packages' ? 'bg-surface text-primary border-t-4 border-t-primary' : 'text-text-secondary hover:text-text-primary border-t-4 border-t-transparent'}`}>
 <span className="text-2xl mb-1 block leading-none">🌍</span> Plan a Trip
 </button>
 <button onClick={() => setActiveTab('trains')} className={`flex-1 py-4 flex flex-col items-center gap-1 font-black uppercase tracking-widest text-xs transition-colors ${activeTab === 'trains' ? 'bg-surface text-primary border-t-4 border-t-primary' : 'text-text-secondary hover:text-text-primary border-t-4 border-t-transparent'}`}>
 <span className="text-2xl mb-1 block leading-none">🚆</span> Trains
 </button>
 </div>

 {/* Form Area */}
 <div className="p-8">
 
 {/* Flights Mode */}
 {activeTab === 'flights' && (
 <>
          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="tripType" defaultChecked className="text-primary focus:ring-primary" />
              <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">One Way</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="tripType" className="text-primary focus:ring-primary" />
              <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Round Trip</span>
            </label>
          </div>
          
          <div className="flex flex-col md:flex-row rounded-xl border-2 border-border divide-y-2 md:divide-y-0 md:divide-x-2 divide-border relative">
            <div className="flex-1 p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> From</label>
              <input id="flightFrom" type="text" defaultValue="DEL" className="w-full text-3xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent" />
              <div className="text-xs font-semibold text-text-muted truncate">New Delhi, India</div>
            </div>

            <div className="flex-1 p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> To</label>
              <input id="flightTo" type="text" defaultValue="BOM" className="w-full text-3xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent" />
              <div className="text-xs font-semibold text-text-muted truncate">Mumbai, India</div>
            </div>

            <div className="flex-1 p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Departure</label>
              <input id="flightDep" type="text" defaultValue="15 Oct" className="w-full text-2xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent" />
              <div className="text-xs font-semibold text-text-muted truncate">Thursday, 2026</div>
            </div>

            <div className="flex-1 p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Return</label>
              <input id="flightRet" type="text" placeholder="Add return" className="w-full text-xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent placeholder:text-text-muted/50" />
            </div>

            <div className="flex-[1.2] p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Travelers & Class</label>
              <input id="flightPax" type="text" defaultValue="1 Adult" className="w-full text-2xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent" />
              <div className="text-xs font-semibold text-text-muted truncate">Economy/Premium Economy</div>
            </div>
          </div>
 
        <div className="flex justify-center -mb-14 mt-8 relative z-20">
          <Button onClick={() => {
            const f = document.getElementById('flightFrom')?.value || 'DEL';
            const t = document.getElementById('flightTo')?.value || 'BOM';
            navigate(`/flights?from=${f}&to=${t}&date=2026-10-15`);
          }} className="bg-primary hover:bg-primary/90 text-white font-black text-xl px-16 py-4 rounded-full shadow-lg hover:scale-105 transition-transform uppercase tracking-widest">
            Search Flights
          </Button>
        </div>
 </>
 )}

 {/* Hotels Mode */}
 {activeTab === 'hotels' && (
 <>
        <div className="flex flex-col md:flex-row rounded-xl border-2 border-border divide-y-2 md:divide-y-0 md:divide-x-2 divide-border relative">
          <div className="flex-[2] p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Destination</label>
            <input id="hotelDest" type="text" defaultValue="Goa" className="w-full text-3xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent" />
            <div className="text-xs font-semibold text-text-muted truncate">India</div>
          </div>

          <div className="flex-1 p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Check-in</label>
            <input id="hotelIn" type="text" defaultValue="20 Oct" className="w-full text-2xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent" />
            <div className="text-xs font-semibold text-text-muted truncate">Tuesday, 2026</div>
          </div>

          <div className="flex-1 p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Check-out</label>
            <input id="hotelOut" type="text" defaultValue="25 Oct" className="w-full text-2xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent" />
            <div className="text-xs font-semibold text-text-muted truncate">Sunday, 2026</div>
          </div>

          <div className="flex-[1.2] p-3 hover:bg-surface-elevated transition-colors cursor-pointer group">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Guests & Rooms</label>
            <input id="hotelGuests" type="text" defaultValue="2 Guests" className="w-full text-2xl font-black text-text-primary leading-none mb-1 border-none p-0 focus:ring-0 outline-none bg-transparent" />
            <div className="text-xs font-semibold text-text-muted truncate">1 Room</div>
          </div>
        </div>
 
        <div className="flex justify-center -mb-14 mt-8 relative z-20">
          <Button onClick={() => {
            const dest = document.getElementById('hotelDest')?.value || '';
            navigate(`/hotels?search=${encodeURIComponent(dest)}`);
          }} className="bg-primary hover:bg-primary/90 text-white font-black text-xl px-16 py-4 rounded-full shadow-lg hover:scale-105 transition-transform uppercase tracking-widest">
            Search Hotels
          </Button>
        </div>
 </>
 )}

 {/* Plan a Trip Mode */}
 {activeTab === 'packages' && (
 <>
        <div className="flex flex-col md:flex-row rounded-xl border-2 border-border divide-y-2 md:divide-y-0 md:divide-x-2 divide-border relative items-center">
          <div className="flex-1 w-full p-4 hover:bg-surface-elevated transition-colors cursor-pointer group h-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary block mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> Where do you want to go?</label>
            <input type="text" id="planDestination" placeholder="e.g. Bali, Paris, Tokyo" className="w-full text-3xl font-black text-text-primary border-none p-0 focus:ring-0 placeholder:text-text-muted/50 outline-none bg-transparent" />
          </div>
        </div>
        
        <div className="flex justify-center -mb-14 mt-8 relative z-20">
          <Button onClick={() => {
            const dest = document.getElementById('planDestination')?.value;
            navigate('/plan', { state: { destination: dest } });
          }} className="bg-primary hover:bg-primary/90 text-white font-black text-xl px-16 py-4 rounded-full shadow-lg hover:scale-105 transition-transform uppercase tracking-widest">
            Start Planning
          </Button>
        </div>
 </>
 )}

 </div>
 </div>
 );
}
