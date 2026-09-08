import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightService } from '../services/flight.service';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';
import { Plane, Clock, MapPin, Briefcase, Info, Loader2 } from 'lucide-react';

export default function FlightDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { formatCurrency } = useSettings();
 
 const [flight, setFlight] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 useEffect(() => {
 const fetchFlight = async () => {
 try {
 setLoading(true);
 const data = await flightService.getFlightDetails(id);
 setFlight(data.data.flight);
 } catch (err) {
 setError(err.response?.data?.message || 'Failed to load flight details');
 } finally {
 setLoading(false);
 }
 };
 fetchFlight();
 }, [id]);

 if (loading) {
 return (
 <div className="flex justify-center items-center min-h-[60vh]">
 <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
 </div>
 );
 }

 if (error || !flight) {
 return (
 <div className="max-w-3xl mx-auto py-12">
 <Card className="bg-red-50 border-red-200">
 <p className="text-red-700 text-center py-8">{error || 'Flight not found'}</p>
 <div className="flex justify-center pb-8">
 <Button onClick={() => navigate('/flights')}>Back to Search</Button>
 </div>
 </Card>
 </div>
 );
 }

 const formatDateTime = (isoString) => {
 return new Date(isoString).toLocaleString([], { 
 weekday: 'short', month: 'short', day: 'numeric', 
 hour: '2-digit', minute: '2-digit' 
 });
 };

 return (
 <div className="max-w-4xl mx-auto py-8 space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-2xl font-bold font-heading text-text-primary">Review your flight</h1>
 <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 <Card>
 <CardHeader title="Flight Itinerary" subtitle={`${flight.departureCity} to ${flight.arrivalCity}`} className="mb-6 border-b border-border pb-4" />
 
 <div className="relative pl-8 border-l-2 border-border ml-4 space-y-8">
 {/* Departure */}
 <div className="relative">
 <div className="absolute -left-[41px] bg-surface p-1 rounded-full border-2 border-blue-600">
 <MapPin className="h-4 w-4 text-blue-600" />
 </div>
 <div className="font-bold text-lg text-text-primary">{formatDateTime(flight.departureTime)}</div>
 <div className="text-text-primary font-medium">{flight.departureAirport} - {flight.departureCity}</div>
 </div>

 {/* Flight Info */}
 <div className="relative">
 <div className="absolute -left-[41px] bg-surface p-1 rounded-full border-2 border-border-strong">
 <Plane className="h-4 w-4 text-text-muted" />
 </div>
 <div className="bg-page p-4 rounded-lg border border-border flex flex-col sm:flex-row gap-4 justify-between">
 <div>
 <div className="font-semibold text-text-primary">{flight.airline}</div>
 <div className="text-sm text-text-muted">Flight {flight.flightNumber} • {flight.cabinClass.replace('_', ' ')}</div>
 </div>
 <div className="flex items-center gap-2 text-sm text-text-secondary">
 <Clock className="h-4 w-4" /> {flight.duration}
 </div>
 </div>
 </div>

 {/* Arrival */}
 <div className="relative">
 <div className="absolute -left-[41px] bg-surface p-1 rounded-full border-2 border-blue-600">
 <MapPin className="h-4 w-4 text-blue-600" />
 </div>
 <div className="font-bold text-lg text-text-primary">{formatDateTime(flight.arrivalTime)}</div>
 <div className="text-text-primary font-medium">{flight.arrivalAirport} - {flight.arrivalCity}</div>
 </div>
 </div>
 </Card>

 <Card>
 <CardHeader title="Baggage & Amenities" className="mb-4" />
 <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg text-blue-900">
 <Briefcase className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
 <div>
 <div className="font-medium">Included Baggage</div>
 <div className="text-sm text-blue-800 mt-1">{flight.baggage}</div>
 </div>
 </div>
 </Card>
 </div>

 <div className="lg:col-span-1">
 <Card className="sticky top-6">
 <h3 className="font-bold text-lg text-text-primary mb-4">Price Summary</h3>
 <div className="space-y-3 text-sm text-text-secondary border-b border-border pb-4 mb-4">
 <div className="flex justify-between items-center text-text-secondary mb-2">
 <span>Base Fare</span>
 <span>{formatCurrency(flight.price)}</span>
 </div>
 <div className="flex justify-between items-center text-text-secondary mb-4 pb-4 border-b border-border">
 <span>Taxes & Fees</span>
 <span>{formatCurrency(45)}</span>
 </div>
 <div className="flex justify-between items-center mb-6">
 <span className="font-bold text-text-primary">Total</span>
 <span className="text-2xl font-bold text-text-primary">{formatCurrency(flight.price + 45)}</span>
 </div>
 </div>
 
 <Button 
 fullWidth 
 size="lg" 
 onClick={() => navigate(`/flights/${flight.id}/passenger`)}
 >
 Continue to Passenger Details
 </Button>
 
 <div className="mt-4 flex items-start gap-2 text-xs text-text-muted">
 <Info className="h-4 w-4 shrink-0" />
 <p>Prices are in USD and include all taxes and fees. Final price may vary based on payment method.</p>
 </div>
 </Card>
 </div>
 </div>
 </div>
 );
}
