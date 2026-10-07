import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, Loader2, AlertCircle, Eye, X, Shield, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async (searchQuery = '', pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, pageSize: 15 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      
      const response = await adminService.getUsers(params);
      const data = response.data.data;
      setUsers(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalUsers(data.pagination.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(search, 1);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchUsers(search, newPage);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Users Management</h1>
          <p className="text-secondary font-medium mt-1">View and manage platform users ({totalUsers} total).</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold text-sm mb-1">Error Loading Users</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-theme-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-muted font-semibold">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-secondary font-medium">No users found matching your search.</p>
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
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary">{u.name || 'Unknown'}</div>
                      <div className="text-xs text-muted flex items-center gap-1">
                        {u.email}
                        {u.isEmailVerified && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" title="Email Verified"></span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary font-medium whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedUser(u)}
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl border border-theme-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-elevated">
              <h3 className="font-black text-lg text-primary flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                User Details
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-muted hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center font-black text-2xl uppercase">
                  {selectedUser.name ? selectedUser.name.charAt(0) : '?'}
                </div>
                <div>
                  <h4 className="text-xl font-black text-primary">{selectedUser.name || 'Unknown'}</h4>
                  <p className="text-sm font-semibold text-muted flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedUser.email}
                    {selectedUser.isEmailVerified ? <span className="text-emerald-600 text-[10px] uppercase font-black tracking-wider ml-1">(Verified)</span> : null}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-page p-3 rounded-xl border border-theme-border">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Role</p>
                  <p className="font-black text-primary">{selectedUser.role}</p>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Status</p>
                  <p className={`font-black ${selectedUser.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border col-span-2 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider">Phone</p>
                    <p className="font-semibold text-primary text-sm">
                      {selectedUser.phone || 'Not provided'}
                      {selectedUser.isPhoneVerified ? <span className="text-emerald-600 text-xs ml-2">✓</span> : null}
                    </p>
                  </div>
                </div>
                <div className="bg-page p-3 rounded-xl border border-theme-border col-span-2 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider">Joined Date</p>
                    <p className="font-semibold text-primary text-sm">
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics (if _count is returned by API) */}
              {selectedUser._count && (
                <div className="mt-6 pt-4 border-t border-theme-border">
                  <h5 className="text-xs font-black uppercase tracking-widest text-muted mb-3">Activity Stats</h5>
                  <div className="flex gap-4">
                    <div className="flex-1 text-center bg-elevated p-2 rounded-lg border border-theme-border">
                      <p className="text-xl font-black text-primary">{selectedUser._count.bookings || 0}</p>
                      <p className="text-[10px] font-bold text-secondary uppercase">Bookings</p>
                    </div>
                    <div className="flex-1 text-center bg-elevated p-2 rounded-lg border border-theme-border">
                      <p className="text-xl font-black text-primary">{selectedUser._count.trips || 0}</p>
                      <p className="text-[10px] font-bold text-secondary uppercase">Trips</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-theme-border bg-elevated flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-surface border border-theme-border hover:bg-page rounded-xl text-sm font-bold text-primary transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
