import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Loader2, ArrowLeft, Plane, Hotel, Users, Receipt, Star, Check, MapPin } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function TripDetails() {
 const { formatMoney } = useSettings();
 const { id } = useParams();
 const navigate = useNavigate();

 const [booking, setBooking] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [cancelLoading, setCancelLoading] = useState(false);

 const fetchBooking = async () => {
   try {
     const data = await bookingService.getBookingDetails(id);
     setBooking(data.data.booking);
   } catch (err) {
     setError('Failed to load trip details. It may not exist or you do not have permission.');
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   fetchBooking();
 }, [id]);

 const handleCancel = async () => {
   if (!booking || booking.status === 'CANCELLED') return;
   if (!window.confirm('Are you sure you want to cancel this booking?')) return;

   try {
     setCancelLoading(true);
     const response = await bookingService.cancelBooking(id, 'User requested cancellation');
    const updated = response.data.booking;
     setBooking(updated);
     setError('');
   } catch (err) {
     setError(err?.response?.data?.message || 'Unable to cancel this booking.');
   } finally {
     setCancelLoading(false);
   }
 };

 if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
 if (error || !booking) return <div className="text-center py-12 text-red-600">{error}</div>;

 const flight = booking.flightBooking;
 const hotel = booking.hotelBooking;
 const pkg = booking.packageBooking;
 const passengers = booking.passengers || [];
 const payment = booking.payments?.[0];
 const cancellation = booking.cancellations?.[0];
 const hotelNights = hotel ? Math.max(0, Math.ceil((new Date(hotel.checkOut) - new Date(hotel.checkIn)) / (1000 * 3600 * 24))) : 0;
 const flightAddOns = Number(flight?.addOnsTotal || 0);
 const flightBaseFare = flight ? Number(booking.totalAmount) - 45 - flightAddOns : 0;

  return (
    <div className="booking-document max-w-4xl mx-auto py-8 px-4 sm:px-6 print:py-0 print:px-0">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/my-trips')} className="print:hidden p-2 text-gray-400 hover:text-primary dark:text-slate-400 dark:hover:text-white bg-surface hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black font-heading text-primary uppercase tracking-tight">{flight ? 'SmartTrip Electronic Flight Ticket' : hotel ? 'SmartTrip Hotel Booking Voucher' : 'SmartTrip Package Booking Voucher'}</h1>
            <p className="text-sm font-bold text-secondary mt-1">SmartTrip Booking Reference: <span className="font-mono text-primary">{booking.bookingReference}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={booking.status === 'CONFIRMED' ? 'green' : booking.status === 'PENDING' ? 'yellow' : booking.status === 'CANCELLED' ? 'red' : 'gray'} className="text-sm px-3 py-1">
            {booking.status}
          </Badge>
        </div>
      </div>
      <div className="print:hidden flex flex-wrap gap-3 mb-6">
        <Button variant="outline" onClick={() => window.print()}>{flight ? 'Print Ticket / Save PDF' : 'Print Voucher / Save PDF'}</Button>
        <Button variant="outline" onClick={() => navigate('/my-trips')}>Back to My Trips</Button>
      </div>

      <div className="space-y-6 print:space-y-4">
        {flight && (
          <Card className="shadow-sm border-theme-border print:shadow-none print:border-gray-300">
            <CardHeader title="Flight Itinerary" className="mb-4 pb-4 border-b border-theme-border print:border-gray-300" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-theme-border print:border-gray-300">
              <div className="flex items-center gap-4">
                {flight.airlineLogoUrl ? (
                  <img src={flight.airlineLogoUrl} alt={flight.airline} className="h-12 w-12 object-contain bg-white rounded p-1 border border-slate-200" />
                ) : (
                  <span className="h-12 w-12 rounded bg-brand-50 text-brand-700 flex items-center justify-center text-lg font-black border border-brand-100">
                    {flight.airlineCode || flight.airline?.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="font-bold text-primary text-lg">{flight.airline}</p>
                  <p className="text-sm font-bold text-secondary">{flight.flightNumber}</p>
                </div>
              </div>
              
              <div className="flex-1 w-full max-w-md mx-auto flex items-center justify-between bg-surface dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 print:bg-transparent print:border-none print:p-0">
                <div className="text-center">
                  <p className="text-xl font-black text-primary">{new Date(flight.departureTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="font-bold text-primary mt-1">{flight.departureAirport}</p>
                  <p className="text-xs text-secondary">{new Date(flight.departureTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
                
                <div className="flex-1 px-4 flex flex-col items-center">
                  <p className="text-xs font-bold text-muted mb-2">{flight.duration || ''}</p>
                  <div className="w-full relative flex items-center justify-center">
                    <div className="h-[2px] bg-slate-200 dark:bg-slate-700 w-full absolute rounded-full print:bg-gray-300"></div>
                    <div className="relative bg-surface dark:bg-slate-800 print:bg-white px-2 text-brand-500">
                      <Plane className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mt-2">
                    {flight.stops === 0 ? 'Non-stop' : flight.stops > 0 ? `${flight.stops} stop${flight.stops === 1 ? '' : 's'}` : 'Non-stop'}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-xl font-black text-primary">{new Date(flight.arrivalTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="font-bold text-primary mt-1">{flight.arrivalAirport}</p>
                  <p className="text-xs text-secondary">{new Date(flight.arrivalTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Cabin & Fare</p>
                <p className="font-bold text-primary">{flight.cabinClass?.replace('_', ' ') || 'Economy'}</p>
                {flight.fareClass && <p className="font-bold text-brand-600 text-[10px] uppercase tracking-wider">{flight.fareClass}</p>}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Seat</p>
                <p className="font-bold text-primary">{flight.seat || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Included Baggage</p>
                <p className="font-bold text-primary">Cabin: <span className="font-medium text-secondary">{flight.cabinBaggageKg ? `${flight.cabinBaggageKg} kg` : flight.baggage || 'See fare rules'}</span></p>
                <p className="font-bold text-primary">Check-in: <span className="font-medium text-secondary">{flight.checkInBaggageKg ? `${flight.checkInBaggageKg} kg` : 'See fare rules'}</span></p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Extras</p>
                <p className="font-bold text-primary">Bag: <span className="font-medium text-secondary">{flight.extraBaggageKg ? `${flight.extraBaggageKg} kg` : 'None'}</span></p>
                <p className="font-bold text-primary">Meal: <span className="font-medium text-secondary">{flight.meal && flight.meal !== 'NONE' ? flight.meal.replace('_', ' ') : 'No meal'}</span></p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 print:border-gray-200 bg-slate-50 dark:bg-slate-900/50 print:bg-transparent rounded-lg p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <p className="text-xs font-semibold text-muted mb-1">SmartTrip Ticket ID</p>
                <p className="font-mono font-bold text-primary text-base">{flight.smartTripTicketId || 'Issued after confirmation'}</p>
              </div>
              {flight.providerPnr && (
                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Airline PNR / Record Locator</p>
                  <p className="font-mono font-black text-emerald-700 text-lg tracking-widest">{flight.providerPnr}</p>
                </div>
              )}
            </div>
          </Card>
        )}
        
        {hotel && (
          <Card className="shadow-sm border-theme-border print:shadow-none print:border-gray-300">
            <CardHeader title="HOTEL BOOKING VOUCHER" className="mb-4 pb-4 border-b border-theme-border print:border-gray-300" />
            <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-theme-border print:border-gray-300">
              {hotel.hotelImageUrl ? (
                <img src={hotel.hotelImageUrl} alt={hotel.hotelName} className="w-full md:w-56 h-36 object-cover rounded-lg shadow-sm border border-slate-100 dark:border-slate-800" />
              ) : (
                <div className="w-full md:w-56 h-36 bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center rounded-lg border border-brand-100 dark:border-brand-800/50">
                  <Hotel className="h-10 w-10 text-brand-400" />
                </div>
              )}
              <div className="flex-1 w-full">
                <div className="flex mb-1">
                  {[...Array(Math.floor(hotel.hotelRating || 0))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <h3 className="text-2xl font-black text-primary mb-1">{hotel.hotelName}</h3>
                <div className="flex items-center text-sm font-medium text-secondary mb-4">
                  <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                  {hotel.hotelCity || hotel.city || 'City unavailable'}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-surface dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 print:bg-transparent print:border-none print:p-0">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Check-in</p>
                    <p className="font-bold text-primary text-sm">{new Date(hotel.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Check-out</p>
                    <p className="font-bold text-primary text-sm">{new Date(hotel.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Duration</p>
                    <p className="font-bold text-primary text-sm">{hotelNights} night{hotelNights !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Guests</p>
                    <p className="font-bold text-primary text-sm">{passengers.length} Guest{passengers.length !== 1 ? 's' : ''}, 1 Room</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-4 text-sm">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Room Type</p>
                <p className="font-bold text-primary text-base">{hotel.roomType || 'Standard Room'}</p>
              </div>
              {hotel.mealPlan && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Meal Plan</p>
                  <p className="font-bold text-primary">{hotel.mealPlan}</p>
                </div>
              )}
              {hotel.cancellationPolicy && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Cancellation Policy</p>
                  <p className="font-medium text-emerald-600">{hotel.cancellationPolicy}</p>
                </div>
              )}
              {hotel.roomAmenities && Array.isArray(hotel.roomAmenities) && hotel.roomAmenities.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Room Inclusions</p>
                  <div className="flex flex-wrap gap-2">
                    {hotel.roomAmenities.map((inc, idx) => (
                      <span key={idx} className="bg-brand-50 text-brand-700 border border-brand-100 text-xs font-semibold px-2 py-1 rounded dark:bg-brand-900/20 dark:border-brand-800/50 dark:text-brand-300">
                        <Check className="w-3 h-3 inline mr-1" />{inc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {hotel.providerConfirmation && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 print:border-gray-200 bg-slate-50 dark:bg-slate-900/50 print:bg-transparent rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Hotel Confirmation Number</p>
                  <p className="font-mono font-black text-emerald-700 text-lg tracking-widest">{hotel.providerConfirmation}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {pkg && (
          <Card className="shadow-sm border-theme-border print:shadow-none print:border-gray-300">
            <CardHeader title="PACKAGE BOOKING VOUCHER" className="mb-4 pb-4 border-b border-theme-border print:border-gray-300" />
            <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-theme-border print:border-gray-300">
              {pkg.packageImageUrl ? (
                <img src={pkg.packageImageUrl} alt={pkg.packageName} className="w-full md:w-56 h-36 object-cover rounded-lg shadow-sm border border-slate-100 dark:border-slate-800" />
              ) : (
                <div className="w-full md:w-56 h-36 bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center rounded-lg border border-brand-100 dark:border-brand-800/50">
                  <MapPin className="h-10 w-10 text-brand-400" />
                </div>
              )}
              <div className="flex-1 w-full">
                <h3 className="text-2xl font-black text-primary mb-1">{pkg.packageName}</h3>
                <div className="flex items-center text-sm font-medium text-secondary mb-4">
                  <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                  {pkg.destination || 'Destination unavailable'}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-surface dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 print:bg-transparent print:border-none print:p-0">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Travel Date</p>
                    <p className="font-bold text-primary text-sm">{pkg.travelDate ? new Date(pkg.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Duration</p>
                    <p className="font-bold text-primary text-sm">{pkg.durationDays} Days</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Travelers</p>
                    <p className="font-bold text-primary text-sm">{pkg.travelers} Traveler{pkg.travelers !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
            {pkg.providerConfirmation && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 print:border-gray-200 bg-slate-50 dark:bg-slate-900/50 print:bg-transparent rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Package Provider Confirmation</p>
                  <p className="font-mono font-black text-emerald-700 text-lg tracking-widest">{pkg.providerConfirmation}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 break-inside-avoid">
          <Card className="shadow-sm border-theme-border print:shadow-none print:border-gray-300">
            <h3 className="font-black text-primary flex items-center gap-2 mb-4 pb-3 border-b border-theme-border print:border-gray-300 uppercase tracking-tight">
              <Users className="h-5 w-5 text-brand-600" /> {hotel ? 'Guest Details' : pkg ? 'Traveler Details' : 'Passenger Details'}
            </h3>
            <div className="space-y-4">
              {passengers.map((p, idx) => {
                const isIntl = Boolean(flight && flight.departureCountryCode && flight.arrivalCountryCode && flight.departureCountryCode !== flight.arrivalCountryCode);
                return (
                  <div key={p.id} className={idx !== passengers.length - 1 ? 'border-b border-slate-100 dark:border-slate-800 print:border-gray-200 pb-4' : ''}>
                    <p className="font-bold text-primary text-base">{p.title} {p.firstName} {p.lastName} {idx === 0 && hotel ? <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">Primary Guest</span> : ''}</p>
                    <div className="grid grid-cols-2 mt-2 text-sm gap-y-2 gap-x-4">
                      {p.dateOfBirth && <div><span className="text-xs font-semibold uppercase text-muted block">DOB</span><span className="font-medium text-secondary">{new Date(p.dateOfBirth).toLocaleDateString('en-GB')}</span></div>}
                      {p.gender && <div><span className="text-xs font-semibold uppercase text-muted block">Gender</span><span className="font-medium text-secondary">{p.gender}</span></div>}
                      {p.nationality && <div><span className="text-xs font-semibold uppercase text-muted block">Nationality</span><span className="font-medium text-secondary">{p.nationality}</span></div>}
                      {flight && <div><span className="text-xs font-semibold uppercase text-muted block">Seat</span><span className="font-medium text-secondary">{flight.seat || 'Not assigned'}</span></div>}
                      {flight && isIntl && p.passportNumber && (
                        <div className="col-span-2 pt-2"><span className="text-xs font-semibold uppercase text-muted block">Passport Number</span><span className="font-medium text-secondary">{p.passportNumber}</span></div>
                      )}
                      {hotel && p.email && (
                        <div className="col-span-2 pt-2"><span className="text-xs font-semibold uppercase text-muted block">Contact</span><span className="font-medium text-secondary">{p.email} {p.mobile ? `| ${p.mobile}` : ''}</span></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="shadow-sm border-theme-border print:shadow-none print:border-gray-300 h-fit">
            <h3 className="font-black text-primary flex items-center gap-2 mb-4 pb-3 border-b border-theme-border print:border-gray-300 uppercase tracking-tight">
              <Receipt className="h-5 w-5 text-emerald-600" /> Payment Summary
            </h3>
            <div className="space-y-3 text-sm font-medium text-secondary">
              <div className="flex justify-between items-center">
                <span>{hotel ? 'Room Amount' : pkg ? 'Package Amount' : 'Base Fare'}</span>
                <span className="font-bold text-primary">{formatMoney(flight ? flightBaseFare : (parseFloat(booking.totalAmount) - 45 + (hotel?.discount || 0)), booking.currency)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 print:border-gray-200">
                <span>Taxes & Fees</span>
                <span className="font-bold text-primary">{formatMoney(45, booking.currency)}</span>
              </div>
              
              {hotel && hotel.discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 pb-3 border-b border-slate-100 dark:border-slate-800 print:border-gray-200">
                  <span>Discount applied</span>
                  <span className="font-bold">-{formatMoney(hotel.discount, booking.currency)}</span>
                </div>
              )}
              
              {flight && flightAddOns > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 print:border-gray-200">
                  <span>Add-ons (Seat, Baggage, Meal)</span>
                  <span className="font-bold text-primary">{formatMoney(flightAddOns, booking.currency)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-primary text-base">Total Amount</span>
                <span className="font-black text-brand-600 text-xl">{formatMoney(parseFloat(booking.totalAmount), booking.currency)}</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 print:border-gray-300 bg-slate-50 dark:bg-slate-900/50 print:bg-transparent rounded p-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Payment Status</span>
                <Badge variant={payment?.status === 'SUCCESS' || payment?.status === 'COMPLETED' ? 'green' : payment?.status === 'PENDING' ? 'yellow' : payment?.status === 'REFUNDED' ? 'blue' : 'gray'} className="text-xs">
                  {payment?.status || 'PENDING'}
                </Badge>
              </div>

            {cancellation && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 print:border-gray-300">
                <h4 className="font-bold text-primary mb-3 text-sm uppercase tracking-wider text-muted">Cancellation & Refund</h4>
                <div className="space-y-3 text-sm font-medium text-secondary">
                  <div className="flex justify-between items-center">
                    <span>Cancellation Status</span>
                    <Badge variant={cancellation.status === 'PROCESSED' ? 'green' : 'yellow'} className="text-xs">
                      {cancellation.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Refund Amount</span>
                    <span className="font-bold text-primary">{formatMoney(cancellation.refundAmount || 0, booking.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Refund Status</span>
                    <Badge variant={payment?.refundStatus === 'SUCCEEDED' ? 'green' : payment?.refundStatus === 'FAILED' ? 'red' : payment?.refundStatus ? 'yellow' : 'gray'} className="text-xs">
                      {payment?.refundStatus || 'N/A'}
                    </Badge>
                  </div>
                  {payment?.razorpayRefundId && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 print:border-gray-300 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-muted uppercase tracking-wider">Refund Reference</span>
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded text-primary break-all">
                        {payment.razorpayRefundId.includes('dev_mock') ? 'Development/Mock' : payment.razorpayRefundId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
            
            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
              <div className="mt-6 print:hidden">
                <Button fullWidth variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 transition-colors" disabled={cancelLoading} onClick={handleCancel}>
                  {cancelLoading ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
