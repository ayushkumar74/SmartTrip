import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { bookingService } from '../services/booking.service';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { FileText, Plane } from 'lucide-react';

export default function Bookings() {
 const { t, formatMoney } = useSettings();
 const [bookings, setBookings] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchBookings();
 }, []);

 const fetchBookings = async () => {
 try {
 const data = await bookingService.getUserBookings();
 if (data?.data?.bookings) {
 setBookings(data.data.bookings);
 }
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const getBookingDetails = (booking) => {
  if (booking.flightBooking) {
   const flight = booking.flightBooking;
   return `${flight.departureAirport || flight.departureLocation} → ${flight.arrivalAirport || flight.arrivalLocation} · ${flight.flightNumber}`;
  }
  if (booking.hotelBooking) {
   const hotel = booking.hotelBooking;
   const name = hotel.hotelName || hotel.hotel?.name;
   const city = hotel.hotelCity || hotel.hotel?.city;
   const room = hotel.roomType || hotel.room?.name || hotel.room?.type;
   const dates = hotel.checkIn && hotel.checkOut
	? `${new Date(hotel.checkIn).toLocaleDateString('en-GB')} → ${new Date(hotel.checkOut).toLocaleDateString('en-GB')}`
	: '';
   return [name, city, room, dates].filter(Boolean).join(' · ') || 'N/A';
  }
  return 'N/A';
 };

 return (
 <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
 <h1 className="text-3xl font-bold text-primary mb-2">{t('nav.bookings')}</h1>
 <p className="text-secondary mb-8">View all your reservation transactions and receipts.</p>

 {loading ? (
 <div className="text-center py-12 text-muted">{t('common.loading')}</div>
 ) : bookings.length === 0 ? (
 <div className="text-center py-12 bg-surface rounded-lg shadow-sm border border-theme-border">
 <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
 <h3 className="text-lg font-medium text-primary">No Bookings Found</h3>
 <p className="text-muted">You haven't made any reservations yet.</p>
 </div>
 ) : (
 <div className="bg-surface rounded-lg border border-theme-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-page border-b border-theme-border">
 <th className="p-4 font-semibold text-sm text-secondary">Reference</th>
 <th className="p-4 font-semibold text-sm text-secondary">Type</th>
 <th className="p-4 font-semibold text-sm text-secondary">Details</th>
 <th className="p-4 font-semibold text-sm text-secondary">Amount</th>
 <th className="p-4 font-semibold text-sm text-secondary">Status</th>
 <th className="p-4 font-semibold text-sm text-secondary">Date Booked</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {bookings.map(booking => (
 <tr key={booking.id} className="hover:bg-page :bg-slate-700/50 transition-colors">
 <td className="p-4">
 <span className="font-mono text-sm font-medium text-primary">{booking.bookingReference}</span>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-2">
 {booking.type === 'FLIGHT' ? <Plane className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-muted" />}
 <span className="text-sm text-secondary">{booking.type}</span>
 </div>
 </td>
 <td className="p-4 text-sm text-secondary">
 {getBookingDetails(booking)}
 </td>
 <td className="p-4 font-medium text-primary">
 {formatMoney(booking.totalAmount, booking.currency)}
 </td>
 <td className="p-4">
 <Badge variant={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'PENDING' ? 'warning' : 'default'}>
 {booking.status}
 </Badge>
 </td>
 <td className="p-4 text-sm text-muted">
 {new Date(booking.createdAt).toLocaleDateString()}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 );
}
