import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RECOMMENDED_TRIPS } from '../../mock/travelData';
import { MapPin, ArrowRight, Calendar } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

function ImgWithFallback({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className={`${className} bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center`}>
      <MapPin className="w-8 h-8 text-blue-300" />
    </div>;
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export default function RecommendedTrips() {
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();

  return (
    <section>
      {/* Section header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Top Picks</p>
          <h2 className="text-2xl font-bold text-gray-900">Trending Destinations</h2>
        </div>
        <button
          onClick={() => navigate('/explore')}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group shrink-0"
        >
          View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Horizontal scroll — hidden scrollbar */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
        {RECOMMENDED_TRIPS.map(trip => (
          <div
            key={trip.id}
            onClick={() => navigate(`/explore?search=${encodeURIComponent(trip.destination)}`)}
            className="min-w-[220px] w-[220px] shrink-0 cursor-pointer group rounded-xl overflow-hidden bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            {/* Image */}
            <div className="relative overflow-hidden h-36">
              <ImgWithFallback
                src={trip.imageUrl}
                alt={trip.destination}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Country badge */}
              <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border border-white/50">
                {trip.country}
              </span>
            </div>

            {/* Card body */}
            <div className="p-3">
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">
                {trip.destination}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{trip.description}</p>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 font-medium">From</div>
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(parseInt(String(trip.budget).replace(/[^0-9]/g, ''), 10) || 25000, 'INR')}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-gray-400 font-medium">
                  <Calendar className="w-3 h-3" />
                  {trip.bestTime || 'Year round'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-2 mt-4">
        {['Mountains', 'Beach', 'Adventure', 'Cultural', 'Luxury', 'Romantic', 'Nature'].map(tag => (
          <button
            key={tag}
            onClick={() => navigate(`/explore?category=${tag}`)}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
