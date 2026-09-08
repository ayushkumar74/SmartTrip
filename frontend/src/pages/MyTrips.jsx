import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Loader2, Plane, Calendar, MapPin, Search } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function MyTrips() {
 const { t, formatCurrency } = useSettings();
 const navigate = useNavigate();
 const location = useLocation();
 const showSuccess = location.state?.newBooking;

 const [bookings, setBookings] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 useEffect(() => {
 const fetchBookings = async () => {
 try {
 const data = await bookingService.getUserBookings();
 setBookings(data.data.bookings || []);
 } catch (err) {
 setError('Failed to load your trips. Please try again.');
 } finally {
 setLoading(false);
 }
 };
 fetchBookings();
 }, []);

 const getStatusBadge = (status) => {
 switch (status) {
 case 'CONFIRMED': return <Badge variant="green">Confirmed</Badge>;
 case 'PENDING': return <Badge variant="yellow">Pending</Badge>;
 case 'CANCELLED': return <Badge variant="red">Cancelled</Badge>;
 default: return <Badge variant="gray">{status}</Badge>;
 }
 };

 if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 sm:px-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-primary">{t('nav.myTrips')}</h1>
          <p className="text-secondary mt-1">Manage your upcoming and past reservations.</p>
        </div>
        <Button onClick={() => navigate('/flights')}>
 <Search className="w-4 h-4 mr-2" /> Find New Trip
 </Button>
 </div>

 {showSuccess && (
 <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center">
 Booking created successfully! It may take a few moments to confirm.
 </div>
 )}

 {error ? (
 <Card className="bg-red-50 border-red-200 text-red-700 text-center py-8">{error}</Card>
 ) : bookings.length === 0 ? (
        <div className="bg-surface border-2 border-dashed border-theme-border rounded-3xl text-center py-20 px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-page mb-6">
            <Plane className="h-10 w-10 text-muted " />
          </div>
          <h3 className="text-2xl font-bold font-heading text-primary mb-2">No trips planned yet</h3>
          <p className="text-secondary mt-2 mb-8 max-w-sm mx-auto">Time to dust off your passport and start planning your next great adventure.</p>
          <Button onClick={() => navigate('/explore')} variant="primary" className="font-bold shadow-md px-8 py-3 rounded-full">
 Explore Destinations
 </Button>
 </div>
 ) : (
 <div className="space-y-4">
 {bookings.map(booking => {
 const flight = booking.flightBooking;
 return (
 <Card key={booking.id} className="hover:shadow-md transition-shadow cursor-pointer " onClick={() => navigate(`/my-trips/${booking.id}`)} noPadding>
 <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-3">
                    <div className="bg-accent/10 p-2 rounded-lg text-accent">
                      <Plane className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">Flight Booking</span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="text-xs text-secondary font-mono mt-0.5">Ref: {booking.bookingReference}</div>
                    </div>
                  </div>
                  
                  {flight && (
                    <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-primary">{flight.departureLocation} → {flight.arrivalLocation}</p>
                          <p className="text-xs text-secondary">Flight {flight.flightNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-primary">{new Date(flight.departureTime).toLocaleDateString('en-GB')}</p>
                          <p className="text-xs text-secondary">{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    </div>
                  )}
 </div>
 
                <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-theme-border pt-4 md:pt-0 md:pl-5">
                  <div className="text-right mb-4">
                    <p className="text-xs text-secondary">Total Amount</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(parseFloat(booking.totalAmount))}</p>
                  </div>
 <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/my-trips/${booking.id}`); }}>
 View Details
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 );
}
