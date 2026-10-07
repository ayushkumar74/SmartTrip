import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Loader2, AlertTriangle, CheckCircle, MapPin, Star, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const isDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export default function HotelBookingReview() {
  const { t, formatMoney } = useSettings();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkIn, setCheckIn] = useState(state?.checkIn || '');
  const [checkOut, setCheckOut] = useState(state?.checkOut || '');
  const [bookingError, setBookingError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!state?.hotel) {
      navigate('/hotels');
      return;
    }
    setLoading(false);
  }, [state, navigate]);

  const handleConfirmBooking = async () => {
    if (isSubmitting.current) return;
    
    if (!agreed) {
      setBookingError('You must agree to the terms and conditions.');
      return;
    }

    if (!validStay) {
      setBookingError('Select a valid check-in and check-out date.');
      return;
    }

    isSubmitting.current = true;
    setBookingLoading(true);
    setBookingError('');

    try {
      const hotel = state.hotel;

      const guestData = state.guestData;
      if (!Array.isArray(guestData) || guestData.length === 0) {
        setBookingError('Complete guest details before reviewing the booking.');
        isSubmitting.current = false;
        setBookingLoading(false);
        return;
      }

      const payload = {
        hotelId:   hotel.id,
        roomId:    state.roomId || hotel.rooms?.[0]?.id,
        checkIn,
        checkOut,
        guestData,
      };

      const response = await bookingService.createHotelBooking(payload);
      const bookingId = response.data.booking.id;
      await bookingService.payBooking(bookingId);
      const confirmed = await bookingService.getBookingDetails(bookingId);
      // Redirect to the backend-fetched booking confirmation
      navigate(`/my-trips/${confirmed.data.booking.id}`, { state: { newBooking: true } });
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      isSubmitting.current = false;
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (error || !state?.hotel) return <div className="text-center py-12 text-red-600">{error}</div>;

  const hotel = state.hotel;
  const checkInDate = checkIn ? new Date(`${checkIn}T00:00:00`) : null;
  const checkOutDate = checkOut ? new Date(`${checkOut}T00:00:00`) : null;
  const validStay = isDateOnly(checkIn) && isDateOnly(checkOut) && checkInDate && checkOutDate && checkOutDate > checkInDate;
  const nights = validStay ? Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24)) : 0;
  const room = state.room || hotel.rooms?.find((candidate) => candidate.id === state.roomId) || hotel.rooms?.[0];
  const roomPrice = Number(room?.price);
  const roomCurrency = room?.currency || 'USD';
  const hasRoomPrice = Number.isFinite(roomPrice) && roomPrice >= 0;
  const primaryGuest = state.guestData?.[0];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-heading text-primary">Review Hotel Booking</h1>
          <p className="text-muted text-sm mt-1">Please review your stay details and guest information before confirming.</p>
        </div>
      </div>

      {bookingError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="font-medium">{bookingError}</span>
        </div>
      )}

      {!validStay && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-semibold shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
          <span>Check-in and check-out dates are required, and check-out must be after check-in.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-theme-border">
            <CardHeader title="Hotel Summary" className="mb-4 pb-4 border-b border-theme-border" />
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {hotel.images?.[0] || hotel.imageUrl ? (
                <img src={hotel.images?.[0] || hotel.imageUrl} alt={hotel.name} className="w-full sm:w-48 h-32 object-cover rounded-lg shadow-sm border border-slate-100 dark:border-slate-800" />
              ) : (
                <div className="w-full sm:w-48 h-32 bg-brand-50 dark:bg-brand-900/20 rounded-lg flex items-center justify-center border border-brand-100 dark:border-brand-800/50">
                  <MapPin className="w-8 h-8 text-brand-300" />
                </div>
              )}
              <div className="flex-1 w-full">
                <div className="flex mb-1">
                  {[...Array(Math.floor(hotel.rating || 0))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <h3 className="text-xl font-black text-primary mb-1">{hotel.name}</h3>
                <div className="flex items-center text-sm font-medium text-secondary mb-4">
                  <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                  {hotel.address || hotel.location}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-surface rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Check-in</p>
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={checkIn} onChange={(e) => { const value = e.target.value; setCheckIn(value); if (checkOut && (!isDateOnly(value) || value >= checkOut)) setCheckOut(''); setBookingError(''); }} className="font-bold text-primary bg-transparent border-none p-0 w-full focus:ring-0 text-sm" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Check-out</p>
                    <input type="date" min={checkIn || undefined} value={checkOut} onChange={(e) => { const value = e.target.value; setCheckOut(isDateOnly(value) && checkIn && value > checkIn ? value : ''); setBookingError(''); }} className="font-bold text-primary bg-transparent border-none p-0 w-full focus:ring-0 text-sm" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Duration</p>
                    <p className="font-bold text-primary text-sm">{nights} night{nights !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Capacity</p>
                    <p className="font-bold text-primary text-sm">{state.guests || '2 Guests, 1 Room'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm border-theme-border">
            <CardHeader title="Room Details" className="mb-4 pb-4 border-b border-theme-border" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-4 text-sm">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Room Type</p>
                <p className="font-bold text-primary text-base">{room?.name || hotel.roomType || 'Standard Room'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Occupancy</p>
                <p className="font-medium text-primary">{room?.occupancy || 'Standard'}</p>
              </div>
              {room?.mealPlan && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Meal Plan</p>
                  <p className="font-medium text-primary">{room.mealPlan}</p>
                </div>
              )}
              {room?.cancellationPolicy && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Cancellation Policy</p>
                  <p className="font-medium text-emerald-600">{room.cancellationPolicy}</p>
                </div>
              )}
              {room?.inclusions && Array.isArray(room.inclusions) && room.inclusions.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Room Inclusions</p>
                  <div className="flex flex-wrap gap-2">
                    {room.inclusions.map((inc, idx) => (
                      <span key={idx} className="bg-brand-50 text-brand-700 border border-brand-100 text-xs font-semibold px-2 py-1 rounded dark:bg-brand-900/20 dark:border-brand-800/50 dark:text-brand-300">
                        <Check className="w-3 h-3 inline mr-1" />{inc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="shadow-sm border-theme-border">
            <CardHeader title="Guest Details" className="mb-4 pb-4 border-b border-theme-border" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4 text-sm">
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Primary Guest</p>
                <p className="font-bold text-primary text-base">{primaryGuest ? `${primaryGuest.title || ''} ${primaryGuest.firstName || ''} ${primaryGuest.lastName || ''}`.trim() : 'Guest details required'}</p>
              </div>
              {primaryGuest?.gender && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Gender</p>
                  <p className="font-bold text-primary">{primaryGuest.gender}</p>
                </div>
              )}
              {primaryGuest?.nationality && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Nationality</p>
                  <p className="font-bold text-primary">{primaryGuest.nationality}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Contact</p>
                <p className="font-bold text-primary">{primaryGuest?.email || 'N/A'} <span className="text-slate-300 mx-1">|</span> {primaryGuest?.mobile || 'N/A'}</p>
              </div>
              {primaryGuest?.specialRequest && (
                <div className="col-span-2 md:col-span-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Special Request</p>
                  <p className="font-medium text-primary italic">"{primaryGuest.specialRequest}"</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-sm border-theme-border sticky top-6">
            <h3 className="font-black text-xl text-primary mb-5">Price Summary</h3>
            
            <div className="space-y-3 text-sm font-medium text-secondary mb-6">
              <div className="flex justify-between items-center">
                <span>Room (1x Room x {nights} Nights)</span>
                <span className="font-bold text-primary">{validStay && hasRoomPrice ? formatMoney(roomPrice * nights, roomCurrency) : 'Unavailable'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                <span>Taxes & Fees</span>
                <span className="font-bold text-primary">{validStay && hasRoomPrice ? formatMoney(45, roomCurrency) : 'Unavailable'}</span>
              </div>
              
              {room?.discount && (
                <div className="flex justify-between items-center text-emerald-600 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <span>Discount applied</span>
                  <span className="font-bold">-{formatMoney(room.discount, roomCurrency)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-lg text-primary">Total Amount</span>
                <span className="text-2xl font-black text-brand-600">
                  {validStay && hasRoomPrice ? formatMoney((roomPrice * nights) + 45 - (room?.discount || 0), roomCurrency) : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className="mb-6 bg-brand-50 dark:bg-brand-900/20 p-3 rounded flex items-start gap-3 border border-brand-100 dark:border-brand-800/50">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="terms" className="text-xs font-medium text-brand-800 dark:text-brand-300 leading-relaxed cursor-pointer">
                I agree to the hotel rules, cancellation policy, and Terms of Service. I understand this booking requires confirmation.
              </label>
            </div>
            
            <Button 
              fullWidth 
              size="lg" 
              className="text-base font-bold shadow-sm"
              onClick={handleConfirmBooking}
              isLoading={bookingLoading}
              disabled={!agreed || !validStay || !hasRoomPrice}
            >
              Confirm Booking
            </Button>
            
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
              <CheckCircle className="h-4 w-4" /> Secure Transaction
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
