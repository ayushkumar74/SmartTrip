import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Users, CalendarCheck, Plane, Hotel, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getDashboard();
      setData(response.data.data); // The backend wraps with sendSuccess -> { data: ... }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 text-accent animate-spin mb-4" />
        <p className="text-muted font-semibold">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-red-800 font-bold text-lg mb-1">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { counts, recentBookings } = data || {};

  const statCards = [
    { title: 'Total Users', value: counts?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Bookings', value: counts?.totalBookings || 0, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Flight Bookings', value: counts?.flightBookings || 0, icon: Plane, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Hotel Bookings', value: counts?.hotelBookings || 0, icon: Hotel, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Pending Payments', value: counts?.pendingPayments || 0, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Completed Payments', value: counts?.completedPayments || 0, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Dashboard Overview</h1>
          <p className="text-secondary font-medium mt-1">Platform statistics and recent activity.</p>
        </div>
        <button onClick={fetchDashboard} className="p-2.5 text-muted hover:text-primary hover:bg-elevated rounded-xl transition-colors border border-theme-border" title="Refresh">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-surface p-6 rounded-2xl border border-theme-border shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted uppercase tracking-wider mb-1">{stat.title}</p>
                <p className="text-3xl font-black text-primary">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface rounded-2xl border border-theme-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-theme-border flex items-center justify-between">
          <h2 className="text-lg font-black text-primary tracking-tight">Recent Bookings</h2>
          <span className="text-xs font-bold px-2.5 py-1 bg-elevated text-secondary rounded-lg border border-theme-border">Last 10</span>
        </div>
        
        {recentBookings?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-elevated text-xs uppercase font-black text-muted tracking-widest border-b border-theme-border">
                <tr>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{booking.bookingReference}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary">{booking.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-muted">{booking.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        booking.type === 'FLIGHT' ? 'bg-indigo-50 text-indigo-700' :
                        booking.type === 'HOTEL' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.type === 'FLIGHT' && <Plane className="w-3.5 h-3.5" />}
                        {booking.type === 'HOTEL' && <Hotel className="w-3.5 h-3.5" />}
                        {booking.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-primary">
                      {booking.totalAmount} {booking.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary font-medium whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-secondary font-medium">No recent bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
