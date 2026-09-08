import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { bookingService } from '../../services/booking.service';
import { Plane, Calendar, MapPin, ChevronRight, Loader2, Info } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function UpcomingTrips() {
 const { t } = useSettings();
 const navigate = useNavigate();
 const [trips, setTrips] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 let mounted = true;
 const fetchTrips = async () => {
 try {
 const data = await bookingService.getUserBookings();
 if (mounted && data?.data?.bookings) {
 const upcoming = data.data.bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
 setTrips(upcoming);
 }
 } catch (err) {
 console.error('Failed to load upcoming trips', err);
 } finally {
 if (mounted) setLoading(false);
 }
 };
 fetchTrips();
 return () => { mounted = false; };
 }, []);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

 if (trips.length === 0) {
 return null; // Don't show anything if no upcoming trips, keep dashboard clean
 }

  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight">{t('dashboard.upcoming.title') || 'Upcoming Trips'}</h2>
          <p className="text-sm font-semibold text-muted mt-1">Your next adventures await</p>
        </div>
        <Button variant="ghost" className="text-accent font-bold hover:bg-elevated" onClick={() => navigate('/my-trips')}>View All</Button>
      </div>
 
 <div className="space-y-4">
 {trips.map(trip => {
 const flight = trip.flightBooking;
 const flightDate = flight ? new Date(flight.departureTime).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) : 'Unknown';
 const depTime = flight ? new Date(flight.departureTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--';
 const arrTime = flight ? new Date(flight.arrivalTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--';
 
        return (
          <div key={trip.id} className="bg-surface border border-theme-border rounded-xl hover:border-accent shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-center relative group">
            {/* Left Color Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-accent"></div>

            {/* Date & Destination Block */}
            <div className="p-6 w-full md:w-64 flex-shrink-0 bg-page border-b md:border-b-0 md:border-r border-theme-border flex flex-col justify-center pl-8">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Departure</div>
              <div className="text-lg font-black text-primary">{flightDate}</div>
              <div className="text-sm font-semibold text-muted mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> To {flight?.arrivalLocation || 'Destination'}
              </div>
            </div>

            {/* Horizontal Timeline (Middle) */}
            <div className="flex-1 w-full p-6 flex items-center justify-between gap-4">
              {/* Origin */}
              <div className="text-center w-24">
                <div className="text-2xl font-black text-primary">{depTime}</div>
                <div className="text-xs font-bold text-muted uppercase">{flight?.departureAirport || 'ORIGIN'}</div>
              </div>

              {/* Path */}
              <div className="flex-1 flex flex-col items-center justify-center relative px-2">
                <div className="w-full h-0.5 bg-theme-border relative flex items-center justify-center">
                  <div className="absolute left-0 w-2 h-2 rounded-full bg-muted"></div>
                  <div className="absolute right-0 w-2 h-2 rounded-full bg-muted"></div>
                  <div className="bg-surface px-3 text-accent">
                    <Plane className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-[10px] font-black text-muted uppercase tracking-widest mt-2 text-center">
                  {flight?.airline || 'Airline'} • {flight?.flightNumber || 'FLIGHT'}
                </div>
              </div>

              {/* Destination */}
              <div className="text-center w-24">
                <div className="text-2xl font-black text-primary">{arrTime}</div>
                <div className="text-xs font-bold text-muted uppercase">{flight?.arrivalAirport || 'DEST'}</div>
              </div>
            </div>

            {/* Status & Action Block */}
            <div className="p-6 w-full md:w-56 flex-shrink-0 border-t md:border-t-0 md:border-l border-theme-border flex flex-row md:flex-col justify-between items-center md:items-end gap-4 bg-page">
              <div className="text-left md:text-right w-full">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-0.5">Booking Ref</div>
                <div className="text-sm font-bold text-primary bg-surface border border-theme-border px-2 py-0.5 rounded inline-block mb-2">
                  {trip.bookingReference.toUpperCase()}
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${trip.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {trip.status === 'PENDING' ? 'PENDING' : 'CONFIRMED'}
                  </span>
                </div>
              </div>
              
              <Button variant="outline" className="text-xs font-bold w-auto md:w-full border-accent/30 text-accent hover:bg-elevated" onClick={() => navigate(`/my-trips/${trip.id}`)}>
                View Itinerary <ChevronRight className="ml-1 w-3 h-3" />
              </Button>
            </div>

 </div>
 );
 })}
 </div>
 </section>
 );
}
