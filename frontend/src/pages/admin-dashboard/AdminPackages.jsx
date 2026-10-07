import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, Loader2, AlertCircle, Eye, X, Map, MapPin, Calendar, Database, CheckCircle, HelpCircle, Star, Sun } from 'lucide-react';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPackages, setTotalPackages] = useState(0);
  
  const [selectedPackage, setSelectedPackage] = useState(null);

  const fetchPackages = async (searchQuery = '', destination = '', pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, pageSize: 15 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (destination.trim()) params.destination = destination.trim();
      
      const response = await adminService.getPackages(params);
      const data = response.data.data;
      setPackages(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalPackages(data.pagination.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPackages(search, destinationFilter, 1);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, destinationFilter]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchPackages(search, destinationFilter, newPage);
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
          <h1 className="text-3xl font-black text-primary tracking-tight">Holiday Packages</h1>
          <p className="text-secondary font-medium mt-1">View available packaged tours and itineraries ({totalPackages} total).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search package name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
            />
          </div>
          
          <input 
            type="text"
            placeholder="Destination"
            value={destinationFilter} 
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="w-32 px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold text-sm mb-1">Error Loading Packages</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-theme-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading && packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-muted font-semibold">Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-secondary font-medium">No holiday packages found matching criteria.</p>
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
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className={`transition-colors ${!pkg.active ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100 overflow-hidden">
                          {pkg.imageUrl ? (
                            <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                          ) : (
                            <Map className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-primary truncate max-w-xs">{pkg.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {renderStars(pkg.rating)}
                            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">({pkg.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-primary">{pkg.destination}</p>
                          <p className="text-[10px] uppercase font-bold text-muted tracking-wider mt-0.5">{pkg.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-secondary" />
                        <span className="font-black text-primary">{pkg.durationDays} Days</span>
                      </div>
                      <p className="text-[10px] uppercase font-bold text-muted tracking-wider mt-0.5">
                        {pkg.durationDays - 1} Nights
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-primary">{pkg.priceINR} INR</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                        <Database className="w-3 h-3" />
                        INTERNAL DB
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedPackage(pkg)}
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

      {/* Package Details Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-4xl rounded-2xl shadow-xl border border-theme-border overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-elevated shrink-0">
              <h3 className="font-black text-lg text-primary flex items-center gap-2">
                <Map className="w-5 h-5 text-accent" />
                Package Details
              </h3>
              <button onClick={() => setSelectedPackage(null)} className="text-muted hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Status & Source Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-theme-border bg-page">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${selectedPackage.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedPackage.active ? 'ACTIVE INVENTORY' : 'INACTIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                  <Database className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Internal Mock DB Source</span>
                </div>
              </div>

              {/* Package Summary */}
              <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl border border-theme-border bg-surface">
                <div className="w-full md:w-48 h-48 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-theme-border">
                  {selectedPackage.imageUrl ? (
                    <img src={selectedPackage.imageUrl} alt={selectedPackage.name} className="w-full h-full object-cover" />
                  ) : (
                    <Map className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <h4 className="text-2xl font-black text-primary leading-tight">{selectedPackage.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(selectedPackage.rating)}
                        <span className="text-xs font-bold text-secondary">({selectedPackage.reviewCount} reviews)</span>
                      </div>
                    </div>
                    {selectedPackage.tag && (
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-accent/10 text-accent shrink-0">
                        {selectedPackage.tag}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-1">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-primary bg-page px-3 py-1.5 rounded-lg border border-theme-border">
                      <MapPin className="w-4 h-4 text-muted" />
                      {selectedPackage.destination}, {selectedPackage.country}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-primary bg-page px-3 py-1.5 rounded-lg border border-theme-border">
                      <Sun className="w-4 h-4 text-amber-500" />
                      {selectedPackage.durationDays} Days / {selectedPackage.durationDays - 1} Nights
                    </p>
                  </div>

                  <p className="text-sm text-secondary pt-2 line-clamp-3">
                    {selectedPackage.description || 'No description available for this package.'}
                  </p>
                </div>
                <div className="w-full md:w-auto text-left md:text-right bg-page p-4 rounded-xl border border-theme-border">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Pricing per person</p>
                  <p className="text-3xl font-black text-accent">{selectedPackage.priceINR}</p>
                  <p className="text-sm font-bold text-secondary">INR</p>
                </div>
              </div>

              {/* Highlights & Inclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-theme-border rounded-xl overflow-hidden">
                  <div className="bg-elevated px-4 py-2 border-b border-theme-border">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted">Inclusions</h4>
                  </div>
                  <div className="p-4 bg-page">
                    {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPackage.inclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm font-medium text-secondary">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted italic">No inclusions listed.</p>
                    )}
                  </div>
                </div>

                <div className="border border-theme-border rounded-xl overflow-hidden">
                  <div className="bg-elevated px-4 py-2 border-b border-theme-border">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted">Exclusions</h4>
                  </div>
                  <div className="p-4 bg-page">
                    {selectedPackage.exclusions && selectedPackage.exclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPackage.exclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm font-medium text-secondary">
                            <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted italic">No exclusions listed.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-muted mb-4">Day-wise Itinerary</h4>
                {selectedPackage.itinerary && selectedPackage.itinerary.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPackage.itinerary.map((day) => (
                      <div key={day.id} className="border border-theme-border rounded-xl overflow-hidden bg-surface flex">
                        <div className="bg-indigo-50 w-16 md:w-20 shrink-0 flex flex-col items-center justify-center border-r border-theme-border">
                          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Day</span>
                          <span className="text-2xl font-black text-indigo-700">{day.dayNumber}</span>
                        </div>
                        <div className="p-4 flex-1">
                          <h5 className="font-bold text-primary mb-1">{day.title}</h5>
                          {day.description && (
                            <p className="text-sm text-secondary mb-3 leading-relaxed">{day.description}</p>
                          )}
                          {day.activities && day.activities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {day.activities.map((activity, idx) => (
                                <span key={idx} className="px-2 py-1 bg-page border border-theme-border rounded-md text-[11px] font-bold text-secondary flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-muted" />
                                  {activity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-theme-border rounded-xl p-6 bg-page flex items-center justify-center text-center">
                    <div>
                      <HelpCircle className="w-8 h-8 text-muted mx-auto mb-2" />
                      <p className="text-secondary font-medium">No itinerary configured for this package.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-theme-border bg-elevated flex justify-between items-center shrink-0">
              <span className="text-xs font-semibold text-muted font-mono">System ID: {selectedPackage.id}</span>
              <button onClick={() => setSelectedPackage(null)} className="px-4 py-2 bg-surface border border-theme-border hover:bg-page rounded-xl text-sm font-bold text-primary transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
