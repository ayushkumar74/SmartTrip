import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { tripService } from '../services/trip.service';
import { Loader2, Plane, Calendar, MapPin, Search, Sparkles, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

function StatusBadge({ status }) {
  const map = {
    CONFIRMED: 'bg-green-50 text-green-700 border-green-100',
    PENDING:   'bg-amber-50 text-amber-700 border-amber-100',
    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
    COMPLETED: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {status?.toLowerCase()}
    </span>
  );
}

export default function MyTrips() {
  const { t, formatCurrency } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const showSuccess = location.state?.newBooking;
  const isManageBookingsRoute = location.pathname === '/manage-bookings';
  const [activeTab, setActiveTab] = useState('upcoming');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [itineraryTrips, setItineraryTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    bookingService.getUserBookings()
      .then(d => setBookings(d.data.bookings || []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));

    tripService.listTrips()
      .then(d => setItineraryTrips(d.data?.trips || []))
      .catch(() => {})
      .finally(() => setTripsLoading(false));
  }, []);

  const now = new Date();
  const upcoming = bookings.filter(b => {
    if (!['PENDING', 'CONFIRMED'].includes(b.status)) return false;
    const d = b.type === 'FLIGHT' ? b.flightBooking?.departureTime : b.hotelBooking?.checkIn;
    return d && new Date(d) >= now;
  });
  const completed = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
  const tabBookings = activeTab === 'upcoming' ? upcoming : completed;

  if (loading && tripsLoading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isManageBookingsRoute ? 'Manage Bookings' : 'My Trips'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage your upcoming and past reservations.</p>
        </div>
        <button
          onClick={() => navigate('/flights')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Search className="w-4 h-4" /> Search Flights
        </button>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          Booking created successfully! It may take a moment to confirm.
        </div>
      )}

      {/* Itinerary trips */}
      {!tripsLoading && itineraryTrips.length > 0 && (
        <div className="mb-10">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" /> Planned Itineraries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itineraryTrips.map(trip => (
              <div key={trip.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                <div className="font-semibold text-gray-900 mb-1 truncate">{trip.title}</div>
                {trip.destination && (
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />{trip.destination.name}, {trip.destination.country}
                  </div>
                )}
                {trip.startDate && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(trip.startDate).toLocaleDateString('en-GB')} → {new Date(trip.endDate).toLocaleDateString('en-GB')}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  {trip._count?.days ?? 0} day{trip._count?.days !== 1 ? 's' : ''} planned
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 flex gap-6">
          {[
            { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
            { key: 'past', label: 'Past & Cancelled', count: completed.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6">{error}</div>
      )}

      {/* Booking list */}
      {!loading && tabBookings.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl text-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">
            {activeTab === 'upcoming' ? 'No upcoming trips' : 'No past trips yet'}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming trips. Start planning!"
              : 'Completed or cancelled bookings will appear here.'}
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={() => navigate('/flights')}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Search Flights
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tabBookings.map(booking => {
            const flight = booking.flightBooking;
            const hotel = booking.hotelBooking;
            const isHotel = booking.type === 'HOTEL';

            return (
              <div
                key={booking.id}
                onClick={() => navigate(`/my-trips/${booking.id}`)}
                className="bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer flex items-center overflow-hidden group"
              >
                {/* Type indicator */}
                <div className={`w-1 self-stretch rounded-l-xl shrink-0 ${isHotel ? 'bg-indigo-500' : 'bg-brand-500'}`} />

                {/* Icon */}
                <div className="px-4 py-4 shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHotel ? 'bg-indigo-50' : 'bg-blue-50'}`}>
                    {isHotel
                      ? <Building2 className="w-5 h-5 text-indigo-600" />
                      : <Plane className="w-5 h-5 text-brand-600" />
                    }
                  </div>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0 py-4 pr-4">
                  {flight && (
                    <>
                      <div className="font-semibold text-gray-900 text-sm">
                        {flight.departureLocation} → {flight.arrivalLocation}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(flight.departureTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <StatusBadge status={booking.status} />
                        {booking.bookingReference && (
                          <span className="text-xs text-gray-400 font-mono">#{booking.bookingReference.toUpperCase()}</span>
                        )}
                      </div>
                      {flight.flightNumber && (
                        <div className="text-xs text-gray-400 mt-1">{flight.provider || ''} {flight.flightNumber}</div>
                      )}
                    </>
                  )}
                  {hotel && (
                    <>
                      <div className="font-semibold text-gray-900 text-sm">{hotel.hotelName}</div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(hotel.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(hotel.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      {hotel.roomType && (
                        <div className="text-xs text-gray-400 mt-1">{hotel.roomType} · {hotel.guests} guest{hotel.guests > 1 ? 's' : ''}</div>
                      )}
                    </>
                  )}
                </div>

                {/* Amount + arrow */}
                <div className="shrink-0 pr-4 flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-400">Total</div>
                    <div className="font-bold text-gray-900 text-sm">{formatCurrency(parseFloat(booking.totalAmount) || 0)}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
