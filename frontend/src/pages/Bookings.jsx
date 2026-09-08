import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { bookingService } from '../services/booking.service';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { FileText, Plane } from 'lucide-react';

export default function Bookings() {
 const { t, formatCurrency } = useSettings();
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

 return (
 <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
 <h1 className="text-3xl font-bold text-text-primary mb-2">{t('nav.bookings')}</h1>
 <p className="text-text-secondary mb-8">View all your reservation transactions and receipts.</p>

 {loading ? (
 <div className="text-center py-12 text-text-muted">{t('common.loading')}</div>
 ) : bookings.length === 0 ? (
 <div className="text-center py-12 bg-surface rounded-lg shadow-sm border border-border">
 <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
 <h3 className="text-lg font-medium text-text-primary">No Bookings Found</h3>
 <p className="text-text-muted">You haven't made any reservations yet.</p>
 </div>
 ) : (
 <div className="bg-surface rounded-lg border border-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-page border-b border-border">
 <th className="p-4 font-semibold text-sm text-text-secondary">Reference</th>
 <th className="p-4 font-semibold text-sm text-text-secondary">Type</th>
 <th className="p-4 font-semibold text-sm text-text-secondary">Details</th>
 <th className="p-4 font-semibold text-sm text-text-secondary">Amount</th>
 <th className="p-4 font-semibold text-sm text-text-secondary">Status</th>
 <th className="p-4 font-semibold text-sm text-text-secondary">Date Booked</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {bookings.map(booking => (
 <tr key={booking.id} className="hover:bg-page :bg-slate-700/50 transition-colors">
 <td className="p-4">
 <span className="font-mono text-sm font-medium text-text-primary">{booking.bookingReference}</span>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-2">
 {booking.type === 'FLIGHT' ? <Plane className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-text-muted" />}
 <span className="text-sm text-text-secondary">{booking.type}</span>
 </div>
 </td>
 <td className="p-4 text-sm text-text-secondary">
 {booking.flightBooking ? (
 `${booking.flightBooking.departureLocation} → ${booking.flightBooking.arrivalLocation}`
 ) : (
 'N/A'
 )}
 </td>
 <td className="p-4 font-medium text-text-primary">
 {formatCurrency(parseFloat(booking.totalAmount))}
 </td>
 <td className="p-4">
 <Badge variant={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'PENDING' ? 'warning' : 'default'}>
 {booking.status}
 </Badge>
 </td>
 <td className="p-4 text-sm text-text-muted">
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
