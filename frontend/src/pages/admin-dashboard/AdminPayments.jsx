import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, Loader2, AlertCircle, Eye, X, CreditCard, Banknote, Calendar, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refundFilter, setRefundFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async (searchQuery = '', status = '', refundStatus = '', pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, pageSize: 15 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (status) params.status = status;
      if (refundStatus) params.refundStatus = refundStatus;
      
      const response = await adminService.getPayments(params);
      const data = response.data.data;
      setPayments(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalPayments(data.pagination.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPayments(search, statusFilter, refundFilter, 1);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, refundFilter]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchPayments(search, statusFilter, refundFilter, newPage);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-700';
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'SUCCESS') return 'bg-emerald-100 text-emerald-700';
    if (s === 'FAILED') return 'bg-red-100 text-red-700';
    if (s === 'REFUNDED') return 'bg-purple-100 text-purple-700';
    return 'bg-amber-100 text-amber-700';
  };

  const getRefundColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-700';
    const s = status.toUpperCase();
    if (s === 'PROCESSED' || s === 'COMPLETED') return 'bg-emerald-100 text-emerald-700';
    if (s === 'FAILED') return 'bg-red-100 text-red-700';
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Payments Monitoring</h1>
          <p className="text-secondary font-medium mt-1">View transactions and refunds ({totalPayments} total).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search ID or booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          
          <select 
            value={refundFilter} 
            onChange={(e) => setRefundFilter(e.target.value)}
            className="px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all cursor-pointer"
          >
            <option value="">All Refunds</option>
            <option value="NONE">No Refund</option>
            <option value="PENDING">Refund Pending</option>
            <option value="PROCESSED">Refund Processed</option>
            <option value="FAILED">Refund Failed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold text-sm mb-1">Error Loading Payments</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-theme-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading && payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-muted font-semibold">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-secondary font-medium">No payments found matching criteria.</p>
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
                  <th className="px-6 py-4">Payment Ref</th>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary text-xs max-w-[150px] truncate" title={p.transactionId || p.id}>
                      {p.transactionId || p.id}
                    </td>
                    <td className="px-6 py-4">
                      {p.booking ? (
                        <div className="font-mono font-bold text-accent text-xs">
                          {p.booking.bookingReference}
                        </div>
                      ) : (
                        <span className="text-muted italic text-xs">Unlinked</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary truncate max-w-[120px]">{p.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-muted truncate max-w-[120px]" title={p.user?.email}>{p.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-primary">
                      {p.amount} {p.currency}
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider block w-fit ${getStatusColor(p.status)}`}>
                        {p.status}
                      </div>
                      {p.refundStatus && p.refundStatus !== 'NONE' && (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider block w-fit ${getRefundColor(p.refundStatus)}`}>
                          <RotateCcw className="w-3 h-3" />
                          {p.refundStatus}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-secondary font-medium whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedPayment(p)}
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

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl border border-theme-border overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-elevated shrink-0">
              <h3 className="font-black text-lg text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                Payment Record
              </h3>
              <button onClick={() => setSelectedPayment(null)} className="text-muted hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-page p-3 rounded-xl border border-theme-border col-span-2 md:col-span-1">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Status</p>
                  <p className={`font-black text-sm ${getStatusColor(selectedPayment.status).split(' ')[1]}`}>
                    {selectedPayment.status}
                  </p>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border col-span-2 md:col-span-1">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Method</p>
                  <p className="font-black text-primary text-sm uppercase">
                    {selectedPayment.paymentMethod || 'Unknown'}
                  </p>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border col-span-2 md:col-span-1">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Amount</p>
                  <p className="font-black text-primary text-sm">
                    {selectedPayment.amount} {selectedPayment.currency}
                  </p>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border col-span-2 md:col-span-1">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Date</p>
                  <p className="font-semibold text-primary text-sm">
                    {new Date(selectedPayment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Transaction details */}
              <div className="border border-theme-border rounded-xl overflow-hidden">
                <div className="bg-elevated px-4 py-2 border-b border-theme-border">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted">Transaction Information</h4>
                </div>
                <div className="p-4 grid grid-cols-1 gap-4 bg-page">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">System ID</p>
                    <p className="font-mono text-primary text-xs">{selectedPayment.id}</p>
                  </div>
                  {selectedPayment.transactionId && (
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Gateway Transaction ID / Receipt</p>
                      <p className="font-mono font-bold text-primary text-xs">{selectedPayment.transactionId}</p>
                    </div>
                  )}
                  {selectedPayment.razorpayOrderId && (
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Razorpay Order ID</p>
                      <p className="font-mono text-primary text-xs">{selectedPayment.razorpayOrderId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Booking */}
              {selectedPayment.booking && (
                <div className="border border-theme-border rounded-xl overflow-hidden">
                  <div className="bg-elevated px-4 py-2 border-b border-theme-border flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted">Linked Booking</h4>
                    <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                      {selectedPayment.booking.type}
                    </span>
                  </div>
                  <div className="p-4 bg-page">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Booking Reference</p>
                    <p className="font-mono font-bold text-accent text-sm mb-2">{selectedPayment.booking.bookingReference}</p>
                    
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Customer</p>
                    <p className="font-semibold text-primary text-sm">{selectedPayment.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted">{selectedPayment.user?.email}</p>
                  </div>
                </div>
              )}

              {/* Refund Info */}
              {selectedPayment.refundStatus && selectedPayment.refundStatus !== 'NONE' && (
                <div className={`border rounded-xl overflow-hidden ${selectedPayment.refundStatus === 'PROCESSED' ? 'border-emerald-200' : 'border-amber-200'}`}>
                  <div className={`px-4 py-2 border-b flex items-center justify-between ${selectedPayment.refundStatus === 'PROCESSED' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${selectedPayment.refundStatus === 'PROCESSED' ? 'text-emerald-800' : 'text-amber-800'}`}>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Refund Information
                    </h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getRefundColor(selectedPayment.refundStatus)}`}>
                      {selectedPayment.refundStatus}
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4 bg-surface">
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Refunded Amount</p>
                      <p className="font-black text-primary text-sm">
                        {selectedPayment.refundAmount || 0} {selectedPayment.currency}
                      </p>
                    </div>
                    {selectedPayment.refundId && (
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Gateway Refund ID</p>
                        <p className="font-mono text-primary text-xs">
                          {selectedPayment.refundId.includes('MOCK') ? (
                            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mr-1 font-bold">MOCK</span>
                          ) : null}
                          {selectedPayment.refundId}
                        </p>
                      </div>
                    )}
                    {selectedPayment.refundReason && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Reason</p>
                        <p className="font-medium text-primary text-sm">{selectedPayment.refundReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
            
            <div className="px-6 py-4 border-t border-theme-border bg-elevated flex justify-end shrink-0">
              <button onClick={() => setSelectedPayment(null)} className="px-4 py-2 bg-surface border border-theme-border hover:bg-page rounded-xl text-sm font-bold text-primary transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
