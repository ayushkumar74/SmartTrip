import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, Loader2, AlertCircle, Eye, X, Plane, Clock, MapPin, Tag, Database, Globe } from 'lucide-react';

export default function AdminFlights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('');
  const [cabinFilter, setCabinFilter] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFlights, setTotalFlights] = useState(0);
  
  const [selectedFlight, setSelectedFlight] = useState(null);

  const fetchFlights = async (searchQuery = '', airline = '', cabinClass = '', pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, pageSize: 15 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (airline) params.airline = airline;
      if (cabinClass) params.cabinClass = cabinClass;
      
      const response = await adminService.getFlights(params);
      const data = response.data.data;
      setFlights(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalFlights(data.pagination.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFlights(search, airlineFilter, cabinFilter, 1);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, airlineFilter, cabinFilter]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchFlights(search, airlineFilter, cabinFilter, newPage);
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Flight Inventory</h1>
          <p className="text-secondary font-medium mt-1">View available flight schedules and offers ({totalFlights} total).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search flight number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
            />
          </div>
          
          <input 
            type="text"
            placeholder="Airline (e.g. AI)"
            value={airlineFilter} 
            onChange={(e) => setAirlineFilter(e.target.value)}
            className="w-32 px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
          />
          
          <select 
            value={cabinFilter} 
            onChange={(e) => setCabinFilter(e.target.value)}
            className="px-4 py-2 bg-surface border border-theme-border rounded-xl text-sm font-semibold text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all cursor-pointer"
          >
            <option value="">All Cabins</option>
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold text-sm mb-1">Error Loading Flights</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-theme-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading && flights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-muted font-semibold">Loading flights...</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-secondary font-medium">No flight offers found matching criteria.</p>
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
                  <th className="px-6 py-4">Flight</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Cabin</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {flights.map((f) => (
                  <tr key={f.id} className={`transition-colors ${!f.active ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100 overflow-hidden">
                          {f.airline?.logoUrl ? (
                            <img src={f.airline.logoUrl} alt={f.airline.name} className="w-full h-full object-cover" />
                          ) : (
                            <Plane className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-primary">{f.flightNumber}</p>
                          <p className="text-[10px] uppercase font-bold text-muted tracking-wider">{f.airline?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{f.departureIata}</span>
                        <Plane className="w-3 h-3 text-muted" />
                        <span className="font-bold text-primary">{f.arrivalIata}</span>
                      </div>
                      <p className="text-[10px] uppercase font-bold text-muted tracking-wider mt-0.5">
                        {f.stops === 0 ? 'Non-stop' : `${f.stops} Stop${f.stops > 1 ? 's' : ''}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-primary">{new Date(f.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(f.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-[10px] font-bold text-muted tracking-wider mt-0.5">{formatDuration(f.durationMinutes)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {f.cabinClass.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-primary">
                      {f.priceINR} INR
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                        <Database className="w-3 h-3" />
                        INTERNAL DB
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedFlight(f)}
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

      {/* Flight Details Modal */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl border border-theme-border overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-elevated shrink-0">
              <h3 className="font-black text-lg text-primary flex items-center gap-2">
                <Plane className="w-5 h-5 text-accent" />
                Flight Details
              </h3>
              <button onClick={() => setSelectedFlight(null)} className="text-muted hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Status & Source Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-theme-border bg-page">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${selectedFlight.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedFlight.active ? 'ACTIVE INVENTORY' : 'INACTIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                  <Database className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Internal Mock DB Source</span>
                </div>
              </div>

              {/* Flight Summary */}
              <div className="flex items-center gap-6 p-6 rounded-2xl border border-theme-border bg-surface">
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedFlight.airline?.logoUrl ? (
                    <img src={selectedFlight.airline.logoUrl} alt={selectedFlight.airline.name} className="w-full h-full object-cover" />
                  ) : (
                    <Plane className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-primary">{selectedFlight.flightNumber}</h4>
                  <p className="font-medium text-secondary">{selectedFlight.airline?.name || 'Unknown Airline'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Pricing</p>
                  <p className="text-3xl font-black text-accent">{selectedFlight.priceINR} <span className="text-lg">INR</span></p>
                </div>
              </div>

              {/* Route & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-theme-border rounded-xl p-5 bg-page relative">
                  <div className="absolute left-[39px] top-[48px] bottom-[48px] w-0.5 bg-indigo-100"></div>
                  
                  <div className="flex gap-4 relative z-10 mb-8">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-4 border-page shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-muted uppercase tracking-wider mb-1">Departure</p>
                      <p className="text-2xl font-black text-primary">{selectedFlight.departureIata}</p>
                      <p className="font-semibold text-secondary mt-1">
                        {new Date(selectedFlight.departureTime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-page shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-muted uppercase tracking-wider mb-1">Arrival</p>
                      <p className="text-2xl font-black text-primary">{selectedFlight.arrivalIata}</p>
                      <p className="font-semibold text-secondary mt-1">
                        {new Date(selectedFlight.arrivalTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-theme-border rounded-xl p-4 bg-page flex items-center gap-4">
                    <Clock className="w-6 h-6 text-muted shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Duration</p>
                      <p className="font-bold text-primary">{formatDuration(selectedFlight.durationMinutes)}</p>
                      <p className="text-xs font-semibold text-secondary mt-0.5">{selectedFlight.stops === 0 ? 'Non-stop' : `${selectedFlight.stops} Stops`}</p>
                    </div>
                  </div>
                  <div className="border border-theme-border rounded-xl p-4 bg-page flex items-center gap-4">
                    <Tag className="w-6 h-6 text-muted shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Cabin & Availability</p>
                      <p className="font-bold text-primary">{selectedFlight.cabinClass.replace('_', ' ')}</p>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">{selectedFlight.availableSeats} Seats Available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Baggage */}
              <div className="border border-theme-border rounded-xl overflow-hidden">
                <div className="bg-elevated px-4 py-2 border-b border-theme-border">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted">Baggage Allowance</h4>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 bg-page">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Cabin Baggage</p>
                    <p className="font-bold text-primary text-sm">{selectedFlight.cabinBaggageKg} kg ({selectedFlight.cabinBaggagePieces} piece{selectedFlight.cabinBaggagePieces > 1 ? 's' : ''})</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Check-in Baggage</p>
                    <p className="font-bold text-primary text-sm">{selectedFlight.checkInBaggageKg} kg ({selectedFlight.checkInBaggagePieces} piece{selectedFlight.checkInBaggagePieces > 1 ? 's' : ''})</p>
                  </div>
                  {selectedFlight.baggageAllowance && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Additional Rules</p>
                      <p className="font-medium text-secondary text-sm">{selectedFlight.baggageAllowance}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-theme-border bg-elevated flex justify-between items-center shrink-0">
              <span className="text-xs font-semibold text-muted font-mono">System ID: {selectedFlight.id}</span>
              <button onClick={() => setSelectedFlight(null)} className="px-4 py-2 bg-surface border border-theme-border hover:bg-page rounded-xl text-sm font-bold text-primary transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
