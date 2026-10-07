import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { flightService } from '../services/flight.service';
import { Card, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { User, Loader2 } from 'lucide-react';

export default function PassengerDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const queryParams = new URLSearchParams(location.search);
 const fareId = queryParams.get('fare') || location.state?.selectedFare?.id || 'saver';

 const [flight, setFlight] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [mobileError, setMobileError] = useState('');

 const [passenger, setPassenger] = useState(location.state?.passenger || {
  title: 'MR',
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'MALE',
  nationality: 'Indian',
  email: '',
  mobile: '',
  passportNumber: '',
  passportExpiry: '',
  passportIssuingCountry: '',
  frequentFlyerNumber: ''
 });

 const isInternational = Boolean(
  flight?.departureCountryCode &&
  flight?.arrivalCountryCode &&
  flight.departureCountryCode !== flight.arrivalCountryCode
 );

 useEffect(() => {
  const fetchFlight = async () => {
   try {
    const data = await flightService.getFlightDetails(id);
    setFlight(data.data.flight);
   } catch (err) {
    setError('Failed to load flight details');
   } finally {
    setLoading(false);
   }
  };
  fetchFlight();
 }, [id]);

 const normalizeIndianMobile = (value) => {
  const compact = String(value || '').trim().replace(/[\s()-]/g, '');
  const local = compact.startsWith('+91') ? compact.slice(3) : compact.startsWith('91') && compact.length === 12 ? compact.slice(2) : compact;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  const normalizedMobile = normalizeIndianMobile(passenger.mobile);
  setMobileError(normalizedMobile ? '' : 'Enter a valid 10-digit Indian mobile number, with optional +91.');
  if (!passenger.title || !passenger.firstName.trim() || !passenger.lastName.trim() || !passenger.dateOfBirth || !passenger.nationality.trim() || !passenger.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || !normalizedMobile || (isInternational && (!passenger.passportNumber.trim() || !passenger.passportExpiry || !passenger.passportIssuingCountry.trim()))) {
   setError(`Enter valid passenger and contact details.${isInternational ? ' Passport details are required for international flights.' : ''}`);
   return;
  }
  navigate(`/flights/${id}/addons`, {
   state: { passenger: { ...passenger, mobile: normalizedMobile }, flight, selectedFare: { id: fareId } }
  });
 };

 if (loading) {
  return (
   <div className="flex justify-center items-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
   </div>
  );
 }

 if (!flight) return <div className="text-center py-12 text-red-600 font-bold">Failed to load flight details</div>;

 return (
  <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
   <div className="mb-8">
    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Passenger Details</h1>
    <p className="text-sm text-slate-500 font-medium mt-1.5">Please ensure the name matches your government-issued ID.</p>
   </div>

   {error && (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3 shadow-sm">
      <div className="font-medium">{error}</div>
    </div>
   )}

   <form onSubmit={handleSubmit}>
    <Card className="mb-8 overflow-hidden border-slate-200 shadow-sm">
     <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center gap-3">
       <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
         <User className="w-5 h-5" />
       </div>
       <div>
         <h2 className="text-lg font-bold text-slate-900">Primary Passenger (Adult)</h2>
         <p className="text-xs text-slate-500 font-medium mt-0.5">Contact information will be used for booking updates</p>
       </div>
     </div>
     
     <div className="p-6 bg-slate-50/30">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-5">
         <div className="lg:col-span-1">
           <Select 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Title</span>}
             value={passenger.title} 
             onChange={e => setPassenger({...passenger, title: e.target.value})}
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           >
             <option value="MR">Mr</option><option value="MS">Ms</option><option value="MRS">Mrs</option><option value="MX">Mx</option>
           </Select>
         </div>
         <div className="lg:col-span-1">
           <Input 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">First Name</span>}
             required 
             value={passenger.firstName}
             onChange={e => { setError(''); setPassenger({...passenger, firstName: e.target.value}); }}
             placeholder="e.g. John"
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           />
         </div>
         <div className="lg:col-span-1">
           <Input 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Middle Name</span>}
             value={passenger.middleName}
             onChange={e => setPassenger({...passenger, middleName: e.target.value})}
             placeholder="Optional"
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           />
         </div>
         <div className="lg:col-span-1">
           <Input 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Last Name</span>}
             required 
             value={passenger.lastName}
             onChange={e => { setError(''); setPassenger({...passenger, lastName: e.target.value}); }}
             placeholder="e.g. Doe"
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           />
         </div>
         
         <div className="lg:col-span-1">
           <Input 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Date of Birth</span>}
             type="date"
             required 
             value={passenger.dateOfBirth}
             onChange={e => { setError(''); setPassenger({...passenger, dateOfBirth: e.target.value}); }}
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           />
         </div>
         
         <div className="lg:col-span-1">
           <Select 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Gender</span>}
             value={passenger.gender}
             onChange={e => setPassenger({...passenger, gender: e.target.value})}
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           >
             <option value="MALE">Male</option>
             <option value="FEMALE">Female</option>
             <option value="OTHER">Other</option>
           </Select>
         </div>

         <div className="lg:col-span-1">
           <Input 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Nationality</span>}
             required 
             value={passenger.nationality} 
             onChange={e => { setError(''); setPassenger({...passenger, nationality: e.target.value}); }} 
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           />
         </div>
         <div className="hidden lg:block lg:col-span-1" />

         <div className="lg:col-span-2">
           <Input 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email Address</span>}
             type="email" 
             required 
             value={passenger.email} 
             onChange={e => { setError(''); setPassenger({...passenger, email: e.target.value}); }} 
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           />
         </div>
         <div className="lg:col-span-2">
           <Input 
             label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Mobile Number</span>}
             error={mobileError} 
             required 
             value={passenger.mobile} 
             onChange={e => { setMobileError(''); setError(''); setPassenger({...passenger, mobile: e.target.value}); }} 
             placeholder="+91" 
             className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
           />
         </div>

         {isInternational && (
           <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-4 pt-6 border-t border-slate-200">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-5">
               <div className="lg:col-span-1">
                 <Input 
                   label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Passport Number</span>}
                   required={isInternational}
                   value={passenger.passportNumber}
                   onChange={e => { setError(''); setPassenger({...passenger, passportNumber: e.target.value}); }}
                   className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                 />
               </div>
               <div className="lg:col-span-1">
                 <Input 
                   label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Passport Expiry</span>}
                   required={isInternational} 
                   type="date" 
                   value={passenger.passportExpiry} 
                   onChange={e => { setError(''); setPassenger({...passenger, passportExpiry: e.target.value}); }} 
                   className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                 />
               </div>
               <div className="lg:col-span-1">
                 <Input 
                   label={<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Issuing Country</span>}
                   required={isInternational} 
                   value={passenger.passportIssuingCountry} 
                   onChange={e => { setError(''); setPassenger({...passenger, passportIssuingCountry: e.target.value}); }} 
                   className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                 />
               </div>
               <div className="lg:col-span-1">
                 <Input 
                   label={<span className="flex flex-col leading-tight"><span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Frequent Flyer</span><span className="text-[9px] font-semibold text-slate-400">Optional</span></span>}
                   value={passenger.frequentFlyerNumber} 
                   onChange={e => setPassenger({...passenger, frequentFlyerNumber: e.target.value})} 
                   className="h-11 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                 />
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
    </Card>

    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
     <button 
       type="button" 
       onClick={() => navigate(-1)} 
       className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
     >
       Back to flight results
     </button>
     <button 
       type="submit" 
       className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-lg rounded-xl transition-all"
     >
       Continue to Add-ons
     </button>
    </div>
   </form>
  </div>
 );
}
