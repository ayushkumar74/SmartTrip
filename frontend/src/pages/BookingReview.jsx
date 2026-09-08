import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { flightService } from '../services/flight.service';
import { bookingService } from '../services/booking.service';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function BookingReview() {
 const { t, formatCurrency } = useSettings();
 const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const passenger = location.state?.passenger;

 const [flight, setFlight] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 
 const [bookingLoading, setBookingLoading] = useState(false);
 const [bookingError, setBookingError] = useState('');
 const [agreed, setAgreed] = useState(false);
 const isSubmitting = useRef(false);

 useEffect(() => {
 if (!passenger) {
 // If accessed directly without passenger state, kick back
 navigate(`/flights/${id}/passenger`);
 return;
 }

 const fetchFlight = async () => {
 try {
 const data = await flightService.getFlightDetails(id);
 setFlight(data.data.flight);
 } catch (err) {
 setError('Failed to load flight details');
 } finally {
 setLoading(false);
 }
 };
 fetchFlight();
 }, [id, passenger, navigate]);

 const handleConfirmBooking = async () => {
 if (isSubmitting.current) return;
 
 if (!agreed) {
 setBookingError('You must agree to the terms and conditions.');
 return;
 }

 isSubmitting.current = true;
 setBookingLoading(true);
 setBookingError('');

 try {
 // Setup payload for our backend API
 const payload = {
 flightData: {
 flightNumber: flight.flightNumber,
 departureAirport: flight.departureAirport,
 arrivalAirport: flight.arrivalAirport,
 departureTime: flight.departureTime,
 arrivalTime: flight.arrivalTime
 },
 passengerData: [passenger], // Array of passengers
 fareData: {
 totalAmount: flight.price + 45, // Including fixed $45 tax/fee from Details step
 currency: 'USD'
 }
 };

 const response = await bookingService.createBooking(payload);
 // Redirect to trips page after success
 navigate('/my-trips', { state: { newBooking: true } });
 } catch (err) {
 setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
 isSubmitting.current = false;
 } finally {
 setBookingLoading(false);
 }
 };

 if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
 if (error || !flight) return <div className="text-center py-12 text-red-600">{error}</div>;

 return (
 <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
 <div className="mb-6 flex justify-between items-end">
 <div>
 <h1 className="text-2xl font-bold font-heading text-text-primary">{t('booking.review.title')}</h1>
 <p className="text-text-muted text-sm">Please review your itinerary and passenger details before confirming.</p>
 </div>
 </div>

 {bookingError && (
 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
 <AlertTriangle className="h-5 w-5 shrink-0" />
 <span>{bookingError}</span>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 <Card className="">
 <CardHeader title="Selected Flight" className="mb-4 pb-4 border-b border-border " />
 <div className="flex justify-between items-center">
 <div>
 <p className="font-bold text-text-primary">{flight.airline} {flight.flightNumber}</p>
 <p className="text-sm text-text-muted">{flight.departureCity} to {flight.arrivalCity}</p>
 </div>
 <div className="text-right">
 <p className="font-medium text-text-primary">{new Date(flight.departureTime).toLocaleDateString('en-GB')}</p>
 <p className="text-sm text-text-muted">{flight.cabinClass.replace('_', ' ')}</p>
 </div>
 </div>
 </Card>

 <Card className="">
 <CardHeader title="Passenger Details" className="mb-4 pb-4 border-b border-border " />
 <div className="grid grid-cols-2 gap-y-4 text-sm">
 <div>
 <p className="text-text-muted mb-1">Full Name</p>
 <p className="font-medium text-text-primary">{passenger.firstName} {passenger.lastName}</p>
 </div>
 <div>
 <p className="text-text-muted mb-1">Date of Birth</p>
 <p className="font-medium text-text-primary">{new Date(passenger.dateOfBirth).toLocaleDateString('en-GB')}</p>
 </div>
 <div>
 <p className="text-text-muted mb-1">Gender</p>
 <p className="font-medium text-text-primary">{passenger.gender}</p>
 </div>
 <div>
 <p className="text-text-muted mb-1">Passport Number</p>
 <p className="font-medium text-text-primary">{passenger.passportNumber || 'Not provided'}</p>
 </div>
 </div>
 </Card>
 </div>

 <div className="lg:col-span-1">
 <Card className="sticky top-6">
 <h3 className="font-bold text-lg text-text-primary mb-4">{t('booking.review.fare')}</h3>
 
 <div className="space-y-3 text-sm text-text-secondary border-b border-border pb-4 mb-4">
 <div className="flex justify-between items-center text-text-secondary mb-2">
 <span>Base Fare (1x Adult)</span>
 <span>{formatCurrency(flight.price)}</span>
 </div>
 <div className="flex justify-between items-center text-text-secondary mb-4 pb-4 border-b border-border">
 <span>Taxes & Fees</span>
 <span>{formatCurrency(45)}</span>
 </div>
 <div className="flex justify-between items-center mb-6">
 <span className="font-bold text-text-primary">Total Amount</span>
 <span className="text-2xl font-bold text-text-primary">{formatCurrency(flight.price + 45)}</span>
 </div>
 </div>

 <div className="mb-6 flex items-start gap-2">
 <input 
 type="checkbox" 
 id="terms" 
 className="mt-1"
 checked={agreed}
 onChange={(e) => setAgreed(e.target.checked)}
 />
 <label htmlFor="terms" className="text-xs text-text-muted leading-tight">
 {t('booking.review.terms')}
 </label>
 </div>
 
 <Button 
 fullWidth 
 size="lg" 
 onClick={handleConfirmBooking}
 isLoading={bookingLoading}
 >
 {t('common.confirm')}
 </Button>
 
 <div className="mt-4 flex items-center justify-center gap-1 text-xs font-medium text-green-600">
 <CheckCircle className="h-4 w-4" /> Secure Transaction
 </div>
 </Card>
 </div>
 </div>
 </div>
 );
}
