import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightService } from '../services/flight.service';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { User, Loader2 } from 'lucide-react';

export default function PassengerDetails() {
 const { id } = useParams();
 const navigate = useNavigate();

 const [flight, setFlight] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 const [passenger, setPassenger] = useState({
 firstName: '',
 lastName: '',
 dateOfBirth: '',
 gender: 'MALE',
 passportNumber: ''
 });

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

 const handleSubmit = (e) => {
 e.preventDefault();
 // Navigate to Review step and pass the passenger data via state
 navigate(`/flights/${id}/review`, { 
 state: { passenger } 
 });
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center min-h-[60vh]">
 <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
 </div>
 );
 }

 if (error || !flight) return <div className="text-center py-12 text-red-600">{error}</div>;

 return (
 <div className="max-w-3xl mx-auto py-8">
 <div className="mb-6">
 <h1 className="text-2xl font-bold font-heading text-text-primary">Passenger Details</h1>
 <p className="text-text-muted text-sm">Please ensure the name matches your government-issued ID.</p>
 </div>

 <form onSubmit={handleSubmit}>
 <Card className="mb-6">
 <CardHeader title="Primary Passenger (Adult)" className="mb-4 pb-4 border-b border-border" />
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Input 
 label="First Name" 
 required 
 value={passenger.firstName}
 onChange={e => setPassenger({...passenger, firstName: e.target.value})}
 placeholder="e.g. John"
 />
 <Input 
 label="Last Name" 
 required 
 value={passenger.lastName}
 onChange={e => setPassenger({...passenger, lastName: e.target.value})}
 placeholder="e.g. Doe"
 />
 
 <Input 
 label="Date of Birth" 
 type="date"
 required 
 value={passenger.dateOfBirth}
 onChange={e => setPassenger({...passenger, dateOfBirth: e.target.value})}
 />
 
 <div className="w-full">
 <Select 
 label="Gender"
 value={passenger.gender}
 onChange={e => setPassenger({...passenger, gender: e.target.value})}
 >
 <option value="MALE">Male</option>
 <option value="FEMALE">Female</option>
 <option value="OTHER">Other</option>
 </Select>
 </div>

 <div className="md:col-span-2">
 <Input 
 label="Passport Number (Optional)" 
 value={passenger.passportNumber}
 onChange={e => setPassenger({...passenger, passportNumber: e.target.value})}
 placeholder="Required for international flights"
 />
 </div>
 </div>
 </Card>

 <div className="flex justify-between items-center">
 <Button variant="outline" type="button" onClick={() => navigate(-1)}>Back</Button>
 <Button type="submit">Continue to Review</Button>
 </div>
 </form>
 </div>
 );
}
