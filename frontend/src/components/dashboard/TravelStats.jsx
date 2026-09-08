import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { TRAVEL_STATS } from '../../mock/travelData';
import { bookingService } from '../../services/booking.service';
import { PlaneTakeoff, Map, Heart, CreditCard, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function TravelStats() {
 const { t } = useSettings();
 const [totalBookings, setTotalBookings] = useState(0);
 const [upcoming, setUpcoming] = useState(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 let mounted = true;
 const fetchStats = async () => {
 try {
 const data = await bookingService.getUserBookings();
 if (mounted && data?.data?.bookings) {
 const bookings = data.data.bookings;
 setTotalBookings(bookings.length);
 setUpcoming(bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length);
 }
 } catch (err) {
 // Fail gracefully, keep 0
 } finally {
 if (mounted) setLoading(false);
 }
 };
 fetchStats();
 return () => { mounted = false; };
 }, []);

 const stats = [
 { label: t('dashboard.stats.totalBookings') || 'Total Bookings', value: loading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalBookings, icon: PlaneTakeoff, color: 'text-blue-500', bg: 'bg-blue-50 ' },
 { label: t('dashboard.stats.upcoming') || 'Upcoming', value: loading ? <Loader2 className="h-5 w-5 animate-spin" /> : upcoming, icon: Map, color: 'text-green-500', bg: 'bg-green-50 ' },
 { label: t('dashboard.stats.saved') || 'Saved', value: 0, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 ' },
 { label: t('dashboard.stats.miles') || 'Miles', value: 0, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50 ' },
 ];

 return (
 <div className="mt-12 py-8 px-6 bg-surface rounded-3xl border border-border">
 <div className="flex flex-col md:flex-row justify-around items-center gap-8">
 {stats.map((stat, idx) => (
 <div key={idx} className="flex flex-col items-center text-center group cursor-default">
 <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} mb-3 transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
 <stat.icon className="h-6 w-6" />
 </div>
 <div className="flex items-baseline gap-1">
 <span className="text-4xl font-extrabold font-heading text-text-primary tracking-tight">{stat.value}</span>
 </div>
 <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">{stat.label}</p>
 </div>
 ))}
 </div>
 </div>
 );
}
