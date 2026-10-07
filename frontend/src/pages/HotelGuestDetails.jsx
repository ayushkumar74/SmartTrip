import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, CalendarDays, Users, Bed, Info } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const initialGuest = {
  title: 'MR',
  firstName: '',
  lastName: '',
  gender: 'PREFER_NOT_TO_SAY',
  email: '',
  mobile: '',
  nationality: 'Indian',
  specialRequest: '',
};

export default function HotelGuestDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const [guest, setGuest] = useState(state?.guestData?.[0] || initialGuest);
  const [error, setError] = useState('');

  if (!state?.hotel || !state?.checkIn || !state?.checkOut) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Missing Booking Information</h2>
        <p className="text-slate-600 mb-6">Please select a hotel and valid stay dates to proceed.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const { hotel, checkIn, checkOut, adults, children, rooms } = state;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
  const totalGuests = (parseInt(adults) || 1) + (parseInt(children) || 0);

  const update = (field, value) => setGuest((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email);
    const validMobile = /^\+?[1-9]\d{7,14}$/.test(guest.mobile.replace(/[\s()-]/g, ''));
    
    if (!guest.title || !guest.firstName.trim() || !guest.lastName.trim()) {
      setError('Please provide the lead guest\'s full name.');
      return;
    }
    if (!guest.nationality.trim()) {
      setError('Please provide the lead guest\'s nationality.');
      return;
    }
    if (!validEmail) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!validMobile) {
      setError('Please provide a valid mobile number (min 10 digits).');
      return;
    }

    setError('');
    navigate(`/hotels/${state.hotel.id}/review`, {
      state: { ...state, guestData: [guest] },
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-heading text-primary mb-2 uppercase tracking-tight">Guest Details</h1>
        <p className="text-secondary text-sm font-medium">Please enter the details of the primary guest for this booking.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Booking Context / Hotel Summary */}
      <Card className="mb-8 shadow-sm border-theme-border bg-slate-50 dark:bg-slate-900/50">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-primary mb-1">{hotel.hotelName}</h3>
            <div className="flex items-center text-sm font-medium text-secondary">
              <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
              {hotel.hotelCity || hotel.city || 'Location unavailable'}
            </div>
            {hotel.roomType && (
              <div className="inline-flex items-center mt-3 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                <Bed className="w-3.5 h-3.5 mr-1" />
                {hotel.roomType}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:flex md:flex-row gap-6 md:gap-8 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-8">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> Stay Dates</p>
              <p className="font-bold text-primary text-sm whitespace-nowrap">
                {checkInDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {checkOutDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs font-semibold text-secondary mt-0.5">{nights} Night{nights !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Occupancy</p>
              <p className="font-bold text-primary text-sm">{totalGuests} Guest{totalGuests !== 1 ? 's' : ''}</p>
              <p className="text-xs font-semibold text-secondary mt-0.5">{rooms} Room{rooms !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm border-theme-border overflow-hidden">
        <CardHeader title="Primary Guest Details" className="border-b border-theme-border pb-4 mb-2 bg-slate-50/50 dark:bg-slate-900/20" />
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          {/* Row 1: Name */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
            <div className="md:col-span-3">
              <Select label="Title" required value={guest.title} onChange={(event) => update('title', event.target.value)}>
                <option value="MR">Mr</option>
                <option value="MRS">Mrs</option>
                <option value="MS">Ms</option>
                <option value="DR">Dr</option>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Input label="First Name" required value={guest.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="As per ID" />
            </div>
            <div className="md:col-span-5">
              <Input label="Last Name" required value={guest.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="As per ID" />
            </div>
          </div>

          {/* Row 2: Gender & Nationality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <Select label="Gender" required value={guest.gender} onChange={(event) => update('gender', event.target.value)}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </Select>
            </div>
            <div>
              <Input label="Nationality" required value={guest.nationality} onChange={(event) => update('nationality', event.target.value)} placeholder="e.g. Indian" />
            </div>
          </div>

          <div className="my-8 border-t border-slate-100 dark:border-slate-800"></div>

          {/* Row 3: Contact */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Email Address" type="email" required value={guest.email} onChange={(event) => update('email', event.target.value)} placeholder="booking@example.com" />
              <Input label="Mobile Number" required value={guest.mobile} onChange={(event) => update('mobile', event.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="my-8 border-t border-slate-100 dark:border-slate-800"></div>

          {/* Row 4: Special Request */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">Additional Details</h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3 flex items-start gap-2 border border-blue-100 dark:border-blue-800/30">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Special requests cannot be guaranteed – but the hotel will do its best to meet your needs.</p>
            </div>
            <Input label="Special Request (Optional)" value={guest.specialRequest} onChange={(event) => update('specialRequest', event.target.value)} placeholder="e.g. Early check-in, Twin beds, Quiet room..." />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 mt-4 border-t border-theme-border">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button type="submit" className="w-full sm:w-auto px-8 shadow-md">
              Continue to Review
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
