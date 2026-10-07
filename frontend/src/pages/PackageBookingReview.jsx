import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Loader2, AlertTriangle, CheckCircle, MapPin, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const isDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export default function PackageBookingReview() {
  const { formatMoney } = useSettings();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [travelDate, setTravelDate] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const isSubmitting = useRef(false);

  const [traveler, setTraveler] = useState({
    title: 'Mr',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    gender: '',
    nationality: 'Indian',
    email: user?.email || '',
    mobile: user?.phone || '',
  });

  useEffect(() => {
    if (!state?.package) {
      navigate('/packages');
      return;
    }
    setLoading(false);
  }, [state, navigate]);

  const handleConfirmBooking = async () => {
    if (isSubmitting.current) return;
    
    if (!agreed) {
      setBookingError('You must agree to the terms and conditions.');
      return;
    }

    if (!isDateOnly(travelDate)) {
      setBookingError('Select a valid travel date.');
      return;
    }

    if (!traveler.firstName || !traveler.lastName || !traveler.email || !traveler.mobile || !traveler.gender || !traveler.nationality) {
      setBookingError('Please fill all required traveler details.');
      return;
    }

    isSubmitting.current = true;
    setBookingLoading(true);
    setBookingError('');

    try {
      const pkg = state.package;
      const guestData = [traveler];

      const payload = {
        packageId: pkg.id,
        travelDate,
        guestData,
      };

      const response = await bookingService.createPackageBooking(payload);
      const bookingId = response.data.booking.id;
      await bookingService.payBooking(bookingId);
      const confirmed = await bookingService.getBookingDetails(bookingId);
      navigate(`/my-trips/${confirmed.data.booking.id}`, { state: { newBooking: true } });
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to create booking. Please try again.');
      isSubmitting.current = false;
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  if (error || !state?.package) return <div className="text-center py-12 text-red-600">{error}</div>;

  const pkg = state.package;
  const price = Number(pkg.priceINR);
  const currency = pkg.currency || 'INR';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-heading text-primary">Review Package Booking</h1>
          <p className="text-muted text-sm mt-1">Please enter your traveler details and review your package.</p>
        </div>
      </div>

      {bookingError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="font-medium">{bookingError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-theme-border">
            <CardHeader title="Package Summary" className="mb-4 pb-4 border-b border-theme-border" />
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {pkg.imageUrl ? (
                <img src={pkg.imageUrl} alt={pkg.name} className="w-full sm:w-48 h-32 object-cover rounded-lg shadow-sm" />
              ) : (
                <div className="w-full sm:w-48 h-32 bg-elevated rounded-lg flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted" />
                </div>
              )}
              <div className="flex-1 w-full">
                <h3 className="text-xl font-black text-primary mb-1">{pkg.name}</h3>
                <div className="flex items-center text-sm font-medium text-secondary mb-4">
                  <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                  {pkg.destination}, {pkg.country}
                </div>
                <div className="flex items-center text-sm font-medium text-secondary mb-4">
                  <Clock className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                  {pkg.durationDays} Days
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-surface rounded-lg border border-theme-border">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Travel Date</p>
                    <input 
                      type="date" 
                      min={new Date().toISOString().slice(0, 10)} 
                      value={travelDate} 
                      onChange={(e) => { setTravelDate(e.target.value); setBookingError(''); }} 
                      className="font-bold text-primary bg-transparent border border-theme-border rounded px-2 py-1 w-full text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm border-theme-border">
            <CardHeader title="Traveler Details" className="mb-4 pb-4 border-b border-theme-border" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">First Name</label>
                <Input value={traveler.firstName} onChange={(e) => setTraveler({...traveler, firstName: e.target.value})} placeholder="First Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Last Name</label>
                <Input value={traveler.lastName} onChange={(e) => setTraveler({...traveler, lastName: e.target.value})} placeholder="Last Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Gender</label>
                <select value={traveler.gender} onChange={(e) => setTraveler({...traveler, gender: e.target.value})} className="w-full rounded-md border border-theme-border bg-surface px-3 py-2 text-sm text-primary">
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Nationality</label>
                <Input value={traveler.nationality} onChange={(e) => setTraveler({...traveler, nationality: e.target.value})} placeholder="Nationality" />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Email</label>
                <Input value={traveler.email} onChange={(e) => setTraveler({...traveler, email: e.target.value})} type="email" placeholder="Email" />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Mobile</label>
                <Input value={traveler.mobile} onChange={(e) => setTraveler({...traveler, mobile: e.target.value})} placeholder="Mobile Number" />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-sm border-theme-border sticky top-6">
            <h3 className="font-black text-xl text-primary mb-5">Price Summary</h3>
            
            <div className="space-y-3 text-sm font-medium text-secondary mb-6">
              <div className="flex justify-between items-center">
                <span>Package (1x Traveler)</span>
                <span className="font-bold text-primary">{formatMoney(price, currency)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-theme-border">
                <span>Taxes & Fees</span>
                <span className="font-bold text-primary">{formatMoney(45, currency)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-lg text-primary">Total Amount</span>
                <span className="text-2xl font-black text-accent">
                  {formatMoney(price + 45, currency)}
                </span>
              </div>
            </div>

            <div className="mb-6 bg-elevated p-3 rounded flex items-start gap-3 border border-theme-border">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="terms" className="text-xs font-medium text-secondary leading-relaxed cursor-pointer">
                I agree to the package rules, cancellation policy, and Terms of Service. I understand this booking requires confirmation.
              </label>
            </div>
            
            <Button 
              fullWidth 
              size="lg" 
              className="text-base font-bold shadow-sm"
              onClick={handleConfirmBooking}
              isLoading={bookingLoading}
              disabled={!agreed}
            >
              Confirm Booking
            </Button>
            
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
              <CheckCircle className="h-4 w-4" /> Secure Transaction
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
