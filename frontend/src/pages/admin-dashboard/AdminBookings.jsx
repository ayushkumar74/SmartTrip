import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, Loader2, AlertCircle, Eye, X, Filter, Plane, Hotel, Map as MapIcon, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async (searchQuery = '', type = '', status = '', pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, pageSize: 15 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (type) params.type = type;
      if (status) params.status = status;
      
      const response = await adminService.getBookings(params);
      const data = response.data.data;
      setBookings(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalBookings(data.pagination.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBookings(search, typeFilter, statusFilter, 1);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, typeFilter, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchBookings(search, typeFilter, statusFilter, newPage);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-700';
    const s = status.toUpperCase();
    if (s === 'CONFIRMED' || s === 'COMPLETED') return 'bg-emerald-100 text-emerald-700';
    if (s === 'CANCELLED' || s === 'FAILED') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Bookings Management</h1>
          <p className="text-secondary font-medium mt-1">View and monitor customer bookings ({totalBookings} total).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search reference or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
            />
          </div>
          
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="FLIGHT">Flights</option>
            <option value="HOTEL">Hotels</option>
            <option value="PACKAGE">Packages</option>
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold text-sm mb-1">Error Loading Bookings</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-theme-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading && bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-muted font-semibold">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-secondary font-medium">No bookings found matching criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm relative">
              {loading && (
                <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
              )}
              <thead className="bg-elevated text-xs uppercase font-black text-muted tracking-widest border-b border-theme-border">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{b.bookingReference}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary">{b.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-muted">{b.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        b.type === 'FLIGHT' ? 'bg-indigo-50 text-indigo-700' :
                        b.type === 'HOTEL' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {b.type === 'FLIGHT' && <Plane className="w-3 h-3" />}
                        {b.type === 'HOTEL' && <Hotel className="w-3 h-3" />}
                        {b.type === 'PACKAGE' && <MapIcon className="w-3 h-3" />}
                        {b.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-primary">
                      {b.totalAmount} {b.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary font-medium whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center justify-center p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-theme-border flex items-center justify-between bg-elevated">
            <span className="text-sm font-semibold text-secondary">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-surface border border-theme-border rounded-lg text-sm font-bold text-primary disabled:opacity-50 hover:bg-page transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-surface border border-theme-border rounded-lg text-sm font-bold text-primary disabled:opacity-50 hover:bg-page transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl border border-theme-border overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-elevated shrink-0">
              <h3 className="font-black text-lg text-primary flex items-center gap-2">
                Booking <span className="text-accent font-mono ml-1">{selectedBooking.bookingReference}</span>
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="text-muted hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-page p-3 rounded-xl border border-theme-border">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Status</p>
                  <p className={`font-black text-sm ${
                    selectedBooking.status === 'CONFIRMED' ? 'text-emerald-600' :
                    selectedBooking.status === 'CANCELLED' ? 'text-red-600' :
                    'text-amber-600'
                  }`}>
                    {selectedBooking.status}
                  </p>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Type</p>
                  <p className="font-black text-primary text-sm flex items-center gap-1.5">
                    {selectedBooking.type === 'FLIGHT' && <Plane className="w-3.5 h-3.5 text-indigo-500" />}
                    {selectedBooking.type === 'HOTEL' && <Hotel className="w-3.5 h-3.5 text-amber-500" />}
                    {selectedBooking.type === 'PACKAGE' && <MapIcon className="w-3.5 h-3.5 text-rose-500" />}
                    {selectedBooking.type}
                  </p>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Amount</p>
                  <p className="font-black text-primary text-sm">
                    {selectedBooking.totalAmount} {selectedBooking.currency}
                  </p>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Date</p>
                  <p className="font-semibold text-primary text-sm">
                    {new Date(selectedBooking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="border border-theme-border rounded-xl overflow-hidden">
                <div className="bg-elevated px-4 py-2 border-b border-theme-border">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted">Customer Information</h4>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-page">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Name</p>
                    <p className="font-bold text-primary text-sm">{selectedBooking.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Email</p>
                    <p className="font-semibold text-primary text-sm">{selectedBooking.user?.email || 'N/A'}</p>
                  </div>
                  {selectedBooking.contactEmail && (
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Contact Email</p>
                      <p className="font-semibold text-primary text-sm">{selectedBooking.contactEmail}</p>
                    </div>
                  )}
                  {selectedBooking.contactPhone && (
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Contact Phone</p>
                      <p className="font-semibold text-primary text-sm">{selectedBooking.contactPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Booking Info */}
              {(selectedBooking.flightBookings?.length > 0 || selectedBooking.hotelBookings?.length > 0 || selectedBooking.packageBookings?.length > 0) && (
                <div className="border border-theme-border rounded-xl overflow-hidden">
                  <div className="bg-elevated px-4 py-2 border-b border-theme-border">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted">Item Details</h4>
                  </div>
                  <div className="p-4 space-y-4 bg-page">
                    
                    {/* Flights */}
                    {selectedBooking.flightBookings?.map((fb) => (
                      <div key={fb.id} className="flex gap-4 p-4 bg-surface rounded-xl border border-theme-border">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Plane className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary mb-1">
                            Flight: {fb.flight?.flightNumber || 'Unknown Flight'}
                          </p>
                          <p className="text-xs font-semibold text-secondary">
                            {fb.flight?.departureAirport} → {fb.flight?.arrivalAirport}
                          </p>
                          <p className="text-xs text-muted mt-1">
                            Passengers: {fb.passengers}, Class: {fb.travelClass}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Hotels */}
                    {selectedBooking.hotelBookings?.map((hb) => (
                      <div key={hb.id} className="flex gap-4 p-4 bg-surface rounded-xl border border-theme-border">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Hotel className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary mb-1">
                            Hotel: {hb.hotel?.name || 'Unknown Hotel'}
                          </p>
                          <p className="text-xs font-semibold text-secondary">
                            Check-in: {new Date(hb.checkInDate).toLocaleDateString()} | Check-out: {new Date(hb.checkOutDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted mt-1">
                            Rooms: {hb.rooms}, Guests: {hb.guests}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Packages */}
                    {selectedBooking.packageBookings?.map((pb) => (
                      <div key={pb.id} className="flex gap-4 p-4 bg-surface rounded-xl border border-theme-border">
                        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <MapIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary mb-1">
                            Package: {pb.package?.title || 'Unknown Package'}
                          </p>
                          <p className="text-xs font-semibold text-secondary">
                            Travelers: {pb.travelers}
                          </p>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* Payments */}
              {selectedBooking.payments?.length > 0 && (
                <div className="border border-theme-border rounded-xl overflow-hidden">
                  <div className="bg-elevated px-4 py-2 border-b border-theme-border">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted">Payment History</h4>
                  </div>
                  <div className="divide-y divide-theme-border">
                    {selectedBooking.payments.map((p) => (
                      <div key={p.id} className="p-4 flex items-center justify-between bg-page">
                        <div>
                          <p className="text-sm font-bold text-primary">
                            {p.amount} {p.currency}
                          </p>
                          <p className="text-xs text-muted">
                            {new Date(p.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                          p.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {p.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {p.status === 'FAILED' && <XCircle className="w-3.5 h-3.5" />}
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
            
            <div className="px-6 py-4 border-t border-theme-border bg-elevated flex justify-end shrink-0">
              <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 bg-surface border border-theme-border hover:bg-page rounded-xl text-sm font-bold text-primary transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
