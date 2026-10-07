import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { MapPin, Star, Check, X, Clock, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { packageService } from '../services/package.service';

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatMoney } = useSettings();
  const [pkg, setPackage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    packageService.getPackage(id)
      .then((response) => setPackage(response.data?.package || null))
      .catch((err) => setError(err.response?.data?.message || 'Package not found.'));
  }, [id]);

  if (error) return <div className="text-center py-20 text-red-600 font-bold">{error}</div>;
  if (!pkg) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="bg-page min-h-screen pb-20">
      <div className="relative h-[400px] w-full"><img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40" /><div className="absolute bottom-0 left-0 right-0 p-8 text-white max-w-[1200px] mx-auto"><div className="flex items-center gap-2 mb-2 font-semibold text-sm uppercase tracking-widest"><MapPin className="w-4 h-4" />{pkg.destination}, {pkg.country}</div><h1 className="text-4xl md:text-5xl font-black mb-4">{pkg.name}</h1><div className="flex flex-wrap items-center gap-6"><span className="flex items-center gap-2"><Clock className="w-5 h-5 text-accent" />{pkg.durationDays} Days</span><span className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />{pkg.rating} ({pkg.reviewCount} Reviews)</span></div></div></div>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-[2] space-y-8"><section className="bg-surface p-6 rounded-lg border border-theme-border"><h2 className="text-2xl font-black text-primary mb-4">Overview</h2><p className="text-secondary leading-relaxed">{pkg.description}</p></section><section className="bg-surface p-6 rounded-lg border border-theme-border"><h2 className="text-xl font-black text-primary mb-4">Highlights</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{(pkg.highlights || []).map((item) => <div key={item} className="flex items-center gap-2 text-secondary font-medium"><div className="w-2 h-2 rounded-full bg-accent" />{item}</div>)}</div></section><section className="bg-surface p-6 rounded-lg border border-theme-border"><h2 className="text-xl font-black text-primary mb-6">Itinerary</h2><div className="space-y-6">{(pkg.itinerary || []).map((day) => <div key={day.id} className="flex gap-4"><div className="bg-blue-100 text-blue-700 font-black w-10 h-10 rounded-full flex items-center justify-center shrink-0">{day.dayNumber}</div><div><h3 className="text-lg font-bold text-primary mb-1">Day {day.dayNumber}: {day.title}</h3><p className="text-secondary">{day.description}</p></div></div>)}</div></section></div>
        <div className="flex-1"><div className="bg-surface p-6 rounded-lg shadow-lg border border-theme-border sticky top-24"><div className="text-3xl font-black text-primary mb-1">{formatMoney(pkg.priceINR, pkg.currency || 'INR')}</div><div className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Per Person</div><div className="space-y-2 mb-8">{(pkg.inclusions || []).map((item) => <div key={item} className="flex items-start gap-2 text-sm text-secondary"><Check className="w-4 h-4 text-green-500 shrink-0" />{item}</div>)}{(pkg.exclusions || []).map((item) => <div key={item} className="flex items-start gap-2 text-sm text-secondary"><X className="w-4 h-4 text-red-400 shrink-0" />{item}</div>)}</div><Button fullWidth onClick={() => navigate(`/packages/${pkg.id}/book`, { state: { package: pkg } })} className="mb-4 text-sm px-6 py-3">Book Package</Button><Button variant="outline" fullWidth onClick={() => navigate('/plan', { state: { destination: pkg.destination } })} className="text-sm px-6 py-3">Customize Similar Trip</Button></div></div>
      </div>
    </div>
  );
}
