import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Loader2, ArrowLeft, Plane, Users, Receipt } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function TripDetails() {
 const { formatCurrency } = useSettings();
 const { id } = useParams();
 const navigate = useNavigate();

 const [booking, setBooking] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 useEffect(() => {
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
 fetchBooking();
 }, [id]);

 if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
 if (error || !booking) return <div className="text-center py-12 text-red-600">{error}</div>;

 const flight = booking.flightBooking;
 const passengers = booking.passengers || [];

 return (
 <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
 <div className="mb-6 flex justify-between items-center">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate('/my-trips')} className="p-2 text-gray-400 hover:text-text-primary :text-white bg-page hover:bg-surface-elevated :bg-slate-700 rounded-full">
 <ArrowLeft className="h-5 w-5" />
 </button>
 <div>
 <h1 className="text-2xl font-bold font-heading text-text-primary">Trip Details</h1>
 <p className="text-text-muted text-sm font-mono mt-1">Ref: {booking.bookingReference}</p>
 </div>
 </div>
 <Badge variant={booking.status === 'CONFIRMED' ? 'green' : booking.status === 'PENDING' ? 'yellow' : 'red'}>
 {booking.status}
 </Badge>
 </div>

 <div className="space-y-6">
 {flight && (
 <Card className="">
 <CardHeader title="Flight Itinerary" className="mb-4 pb-4 border-b border-border " />
 <div className="flex flex-col md:flex-row gap-6 items-center">
 <div className="flex-1 text-center md:text-left">
 <p className="text-2xl font-bold text-text-primary">{flight.departureLocation}</p>
 <p className="text-text-muted">{new Date(flight.departureTime).toLocaleString()}</p>
 </div>
 <div className="flex flex-col items-center flex-1 px-4">
 <p className="text-sm font-bold text-blue-600 mb-1">{flight.flightNumber}</p>
 <div className="w-full relative flex items-center justify-center">
 <div className="h-px bg-gray-300 w-full absolute"></div>
 <Plane className="h-5 w-5 text-blue-500 relative bg-surface px-1" />
 </div>
 </div>
 <div className="flex-1 text-center md:text-right">
 <p className="text-2xl font-bold text-text-primary">{flight.arrivalLocation}</p>
 <p className="text-text-muted">{new Date(flight.arrivalTime).toLocaleString()}</p>
 </div>
 </div>
 </Card>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Card className="">
 <h3 className="font-bold text-text-primary flex items-center gap-2 mb-4 pb-3 border-b border-border">
 <Users className="h-5 w-5 text-blue-600 " /> Passengers
 </h3>
 <div className="space-y-4">
 {passengers.map((p, idx) => (
 <div key={p.id} className={idx !== passengers.length - 1 ? 'border-b border-border pb-4' : ''}>
 <p className="font-bold text-text-primary">{p.firstName} {p.lastName}</p>
 <div className="grid grid-cols-2 mt-2 text-sm text-text-muted gap-2">
 <div>DOB: {new Date(p.dateOfBirth).toLocaleDateString()}</div>
 <div>Gender: {p.gender}</div>
 {p.passportNumber && <div className="col-span-2 text-xs">Passport: {p.passportNumber}</div>}
 </div>
 </div>
 ))}
 </div>
 </Card>

 <Card className="">
 <h3 className="font-bold text-text-primary flex items-center gap-2 mb-4 pb-3 border-b border-border">
 <Receipt className="h-5 w-5 text-green-600 " /> Payment Summary
 </h3>
 <div className="space-y-3 text-sm text-text-secondary">
 <div className="flex justify-between">
 <span>Base Fare</span>
 <span>{formatCurrency(parseFloat(booking.totalAmount - 45))}</span>
 </div>
 <div className="flex justify-between">
 <span>Taxes & Fees</span>
 <span>{formatCurrency(45)}</span>
 </div>
 <div className="flex justify-between font-bold text-text-primary pt-3 border-t border-border text-lg">
 <span>Total Paid</span>
 <span>{formatCurrency(parseFloat(booking.totalAmount))}</span>
 </div>
 </div>
 {booking.status === 'PENDING' && (
 <div className="mt-6">
 <Button fullWidth variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Cancel Booking</Button>
 </div>
 )}
 </Card>
 </div>
 </div>
 </div>
 );
}
