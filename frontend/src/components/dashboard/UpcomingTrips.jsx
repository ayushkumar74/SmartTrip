import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { Plane, Building2, Calendar, MapPin, ChevronRight, Loader2 } from 'lucide-react';

function StatusBadge({ status }) {
  if (status === 'CONFIRMED') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">
      Confirmed
    </span>
  );
  if (status === 'PENDING') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
      Pending
    </span>
  );
  return null;
}

export default function UpcomingTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    bookingService.getUserBookings()
      .then(data => {
        if (!mounted || !data?.data?.bookings) return;
        const now = new Date();
        const upcoming = data.data.bookings
          .filter(b => {
            if (!['PENDING', 'CONFIRMED'].includes(b.status)) return false;
            const d = b.type === 'FLIGHT' ? b.flightBooking?.departureTime
              : b.type === 'HOTEL' ? b.hotelBooking?.checkIn : null;
            return d && new Date(d) > now;
          })
          .sort((a, b) => {
            const da = a.type === 'FLIGHT' ? new Date(a.flightBooking.departureTime) : new Date(a.hotelBooking.checkIn);
            const db = b.type === 'FLIGHT' ? new Date(b.flightBooking.departureTime) : new Date(b.hotelBooking.checkIn);
            return da - db;
          });
        setTrips(upcoming);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-6 w-6 text-brand-500 animate-spin" />
    </div>
  );

  if (trips.length === 0) return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Your Travel</p>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Trips</h2>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Plane className="w-7 h-7 text-brand-400" />
        </div>
        <p className="font-semibold text-gray-800 mb-1">No upcoming trips yet</p>
        <p className="text-sm text-gray-500 mb-5">Your confirmed and pending trips will appear here.</p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Search flights & hotels
        </button>
      </div>
    </section>
  );

  const displayed = trips.slice(0, 3);

  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Your Travel</p>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Trips</h2>
        </div>
        {trips.length > 0 && (
          <button
            onClick={() => navigate('/my-trips')}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            View all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayed.map(trip => {
          if (trip.type === 'FLIGHT' && trip.flightBooking) {
            const f = trip.flightBooking;
            const depDate = new Date(f.departureTime);
            const arrDate = new Date(f.arrivalTime);
            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/my-trips/${trip.id}`)}
                className="group cursor-pointer bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all duration-200 flex items-center overflow-hidden"
              >
                {/* Color accent strip */}
                <div className="w-1 self-stretch bg-brand-500 rounded-l-xl shrink-0" />

                {/* Flight icon */}
                <div className="px-4 py-4 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Plane className="w-5 h-5 text-brand-600" />
                  </div>
                </div>

                {/* Flight info */}
                <div className="flex-1 min-w-0 py-4 pr-4">
                  <div className="flex items-center gap-3">
                    {/* Dep */}
                    <div className="text-center shrink-0">
                      <div className="text-lg font-bold text-gray-900">
                        {depDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 uppercase">{f.departureLocation}</div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                      <div className="w-full flex items-center gap-1">
                        <div className="h-px bg-gray-200 flex-1" />
                        <Plane className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <div className="h-px bg-gray-200 flex-1" />
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium truncate">
                        {f.provider || ''} {f.flightNumber || ''}
                      </div>
                    </div>

                    {/* Arr */}
                    <div className="text-center shrink-0">
                      <div className="text-lg font-bold text-gray-900">
                        {arrDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 uppercase">{f.arrivalLocation}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {depDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <StatusBadge status={trip.status} />
                    {trip.bookingReference && (
                      <span className="text-xs text-gray-400 font-mono">#{trip.bookingReference.toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pr-4">
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                </div>
              </div>
            );
          }

          if (trip.type === 'HOTEL' && trip.hotelBooking) {
            const h = trip.hotelBooking;
            const checkIn = new Date(h.checkIn);
            const checkOut = new Date(h.checkOut);
            const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/my-trips/${trip.id}`)}
                className="group cursor-pointer bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all duration-200 flex items-center overflow-hidden"
              >
                <div className="w-1 self-stretch bg-indigo-500 rounded-l-xl shrink-0" />

                <div className="px-4 py-4 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 py-4 pr-4">
                  <div className="font-bold text-gray-900 text-sm truncate">{h.hotelName}</div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' – '}
                      {checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' · '}
                      {nights} night{nights > 1 ? 's' : ''}
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>
                  {h.roomType && (
                    <div className="text-xs text-gray-400 mt-1">{h.roomType} · {h.guests} guest{h.guests > 1 ? 's' : ''}</div>
                  )}
                </div>

                <div className="shrink-0 pr-4">
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
