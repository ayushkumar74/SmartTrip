import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, Loader2, AlertCircle, Eye, X, Hotel, MapPin, Star, Database, CheckCircle, HelpCircle, Users } from 'lucide-react';

export default function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);
  
  const [selectedHotel, setSelectedHotel] = useState(null);

  const fetchHotels = async (searchQuery = '', city = '', rating = '', pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, pageSize: 15 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (city.trim()) params.city = city.trim();
      if (rating) params.minRating = rating;
      
      const response = await adminService.getHotels(params);
      const data = response.data.data;
      setHotels(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalHotels(data.pagination.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchHotels(search, cityFilter, ratingFilter, 1);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, cityFilter, ratingFilter]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchHotels(search, cityFilter, ratingFilter, newPage);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3 h-3 ${i <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} 
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Hotel Inventory</h1>
          <p className="text-secondary font-medium mt-1">View available properties and rooms ({totalHotels} total).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search hotel name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
            />
          </div>
          
          <input 
            type="text"
            placeholder="City"
            value={cityFilter} 
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-32 px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
          />
          
          <select 
            value={ratingFilter} 
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all cursor-pointer"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold text-sm mb-1">Error Loading Hotels</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-theme-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading && hotels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-muted font-semibold">Loading hotels...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-secondary font-medium">No properties found matching criteria.</p>
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
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Inventory</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {hotels.map((h) => (
                  <tr key={h.id} className={`transition-colors ${!h.active ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100 overflow-hidden">
                          {h.imageUrl ? (
                            <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover" />
                          ) : (
                            <Hotel className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-primary">{h.name}</p>
                          <p className="text-[10px] uppercase font-bold text-muted tracking-wider mt-0.5 line-clamp-1">{h.tag || 'Standard'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-primary">{h.city}</p>
                          <p className="text-[10px] uppercase font-bold text-muted tracking-wider mt-0.5">{h.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-primary">{h.starRating.toFixed(1)}</span>
                        {renderStars(h.starRating)}
                      </div>
                      <p className="text-[10px] uppercase font-bold text-muted tracking-wider">
                        {h.reviewScore} Score • {h.reviewCount} Reviews
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {h.rooms?.length || 0} Room Types
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                        <Database className="w-3 h-3" />
                        INTERNAL DB
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedHotel(h)}
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

      {/* Hotel Details Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-xl border border-theme-border overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-elevated shrink-0">
              <h3 className="font-black text-lg text-primary flex items-center gap-2">
                <Hotel className="w-5 h-5 text-accent" />
                Property Details
              </h3>
              <button onClick={() => setSelectedHotel(null)} className="text-muted hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Status & Source Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-theme-border bg-page">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${selectedHotel.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedHotel.active ? 'ACTIVE INVENTORY' : 'INACTIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                  <Database className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Internal Mock DB Source</span>
                </div>
              </div>

              {/* Hotel Summary */}
              <div className="flex items-start gap-6 p-6 rounded-2xl border border-theme-border bg-surface">
                <div className="w-32 h-32 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-theme-border">
                  {selectedHotel.imageUrl ? (
                    <img src={selectedHotel.imageUrl} alt={selectedHotel.name} className="w-full h-full object-cover" />
                  ) : (
                    <Hotel className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-black text-primary">{selectedHotel.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(selectedHotel.starRating)}
                      </div>
                    </div>
                    {selectedHotel.tag && (
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-accent/10 text-accent">
                        {selectedHotel.tag}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 text-sm font-medium text-secondary">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {selectedHotel.address}, {selectedHotel.city}, {selectedHotel.country}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      Guest score: <span className="font-bold text-primary">{selectedHotel.reviewScore}</span> ({selectedHotel.reviewCount} reviews)
                    </p>
                  </div>
                  <p className="text-sm text-secondary pt-2 line-clamp-2">
                    {selectedHotel.description || 'No description available for this property.'}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHotel.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-page border border-theme-border rounded-lg text-xs font-bold text-secondary">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Inventory */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-muted mb-3">Available Room Types ({selectedHotel.rooms?.length || 0})</h4>
                {selectedHotel.rooms && selectedHotel.rooms.length > 0 ? (
                  <div className="space-y-3">
                    {selectedHotel.rooms.map((room) => (
                      <div key={room.id} className="border border-theme-border rounded-xl p-4 bg-page flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold text-primary">{room.name}</h5>
                            {!room.available && (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700">
                                Sold Out
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-secondary">
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Max {room.maxGuests}</span>
                            {room.cancellation && (
                              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /> {room.cancellation}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Price Per Night</p>
                          <p className="font-black text-lg text-accent">{room.pricePerNightINR} INR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-theme-border rounded-xl p-6 bg-page flex items-center justify-center text-center">
                    <div>
                      <HelpCircle className="w-8 h-8 text-muted mx-auto mb-2" />
                      <p className="text-secondary font-medium">No room types configured for this property.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-theme-border bg-elevated flex justify-between items-center shrink-0">
              <span className="text-xs font-semibold text-muted font-mono">System ID: {selectedHotel.id}</span>
              <button onClick={() => setSelectedHotel(null)} className="px-4 py-2 bg-surface border border-theme-border hover:bg-page rounded-xl text-sm font-bold text-primary transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
