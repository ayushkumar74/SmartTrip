import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Beach', value: 'Beach' },
  { label: 'Mountains', value: 'Mountains' },
  { label: 'Cultural', value: 'Cultural' },
  { label: 'City', value: 'City' },
];

const inspirationDestinations = [
  {
    name: 'Maldives',
    country: 'Maldives',
    category: 'Beach',
    img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
    desc: 'Crystal lagoons & overwater villas',
  },
  {
    name: 'Ladakh',
    country: 'India',
    category: 'Mountains',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    desc: 'High-altitude valleys & monasteries',
  },
  {
    name: 'Rajasthan',
    country: 'India',
    category: 'Cultural',
    img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    desc: 'Palaces, forts & desert safaris',
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    category: 'City',
    img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    desc: 'Futuristic skyline & gardens',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    category: 'Beach',
    img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    desc: 'Rice terraces & temple sunsets',
  },
  {
    name: 'Paris',
    country: 'France',
    category: 'City',
    img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    desc: 'Romance, art & fine cuisine',
  },
  {
    name: 'Spiti Valley',
    country: 'India',
    category: 'Mountains',
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    desc: 'Remote landscapes & clear skies',
  },
  {
    name: 'Agra',
    country: 'India',
    category: 'Cultural',
    img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    desc: 'Home of the Taj Mahal',
  },
];

function ImgWithFallback({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <MapPin className="w-8 h-8 text-gray-300" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export default function TravelInspiration() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? inspirationDestinations
    : inspirationDestinations.filter(d => d.category === activeCategory);

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Travel Inspiration</p>
          <h2 className="text-2xl font-bold text-gray-900">Explore the World</h2>
        </div>
        <button
          onClick={() => navigate('/explore')}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group shrink-0"
        >
          See all destinations
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              activeCategory === cat.value
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.slice(0, 8).map(dest => (
          <div
            key={dest.name}
            onClick={() => navigate(`/explore?search=${encodeURIComponent(dest.name)}`)}
            className="group cursor-pointer rounded-xl overflow-hidden bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            {/* Image */}
            <div className="relative overflow-hidden aspect-[4/3]">
              <ImgWithFallback
                src={dest.img}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Category chip */}
              <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/50">
                {dest.category}
              </span>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">
                {dest.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{dest.desc}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3 shrink-0" />
                {dest.country}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
