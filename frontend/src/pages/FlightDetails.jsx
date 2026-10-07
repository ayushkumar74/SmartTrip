import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightService } from '../services/flight.service';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';
import { Plane, Clock, MapPin, Briefcase, Info, Loader2, CheckCircle2 } from 'lucide-react';

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatMoney } = useSettings();
  
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFareId, setSelectedFareId] = useState('standard');

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
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Card className="bg-danger/10 border-danger/20">
          <p className="text-danger text-center py-8">{error || 'Flight not found'}</p>
          <div className="flex justify-center pb-8">
            <Button onClick={() => navigate('/flights')}>Back to Search</Button>
          </div>
        </Card>
      </div>
    );
  }

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleString([], { 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString([], { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Turn existing single flight into a fare option array for standard selection logic
  const fares = [
    {
      id: 'standard',
      name: 'Standard Fare',
      price: flight.price,
      currency: flight.currency,
      cabin: flight.cabinClass,
      baggage: flight.baggage,
      cancellation: flight.cancellation, // Using if available
      change: flight.change, // Using if available
      meal: flight.meal // Using if available
    }
  ];

  const selectedFare = fares.find(f => f.id === selectedFareId) || fares[0];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading text-primary">Flight Details</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. FLIGHT HEADER */}
          <Card className="p-0 overflow-hidden border border-theme-border shadow-sm bg-surface">
            <div className="bg-elevated px-6 py-4 border-b border-theme-border flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-secondary">{formatDate(flight.departureTime)}</div>
                <div className="text-sm text-muted">{flight.departureCity} to {flight.arrivalCity}</div>
              </div>
              <div className="text-sm font-semibold px-3 py-1 bg-surface rounded-full border border-theme-border text-primary shadow-sm">
                {flight.cabinClass?.replace('_', ' ')}
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                {flight.airlineLogoUrl ? (
                  <img src={flight.airlineLogoUrl} alt={flight.airline} className="h-10 w-10 object-contain bg-white rounded p-1 border border-theme-border shadow-sm" />
                ) : (
                  <div className="h-10 w-10 rounded bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                    {flight.airlineCode || flight.airline?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-primary">{flight.airline}</h3>
                  <div className="text-sm text-secondary">Flight {flight.flightNumber}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
                {/* Departure */}
                <div className="flex-1 text-center sm:text-left z-10 bg-surface pr-4">
                  <div className="text-3xl font-bold text-primary mb-1">{formatTime(flight.departureTime)}</div>
                  <div className="text-sm font-semibold text-primary">{flight.departureAirport}</div>
                  <div className="text-xs text-secondary">{flight.departureCity}</div>
                </div>

                {/* Duration / Line */}
                <div className="flex-1 flex flex-col items-center justify-center min-w-[120px] w-full">
                  <div className="text-xs text-secondary mb-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {flight.duration}
                  </div>
                  <div className="w-full flex items-center">
                    <div className="h-px bg-theme-border flex-1"></div>
                    <Plane className="w-4 h-4 text-muted mx-2" />
                    <div className="h-px bg-theme-border flex-1"></div>
                  </div>
                  <div className="text-[10px] uppercase text-muted mt-1 font-semibold tracking-wider">
                    {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                  </div>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-center sm:text-right z-10 bg-surface pl-4">
                  <div className="text-3xl font-bold text-primary mb-1">{formatTime(flight.arrivalTime)}</div>
                  <div className="text-sm font-semibold text-primary">{flight.arrivalAirport}</div>
                  <div className="text-xs text-secondary">{flight.arrivalCity}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. FARE OPTIONS */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Select Fare Option</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fares.map((fare) => (
                <div 
                  key={fare.id}
                  onClick={() => setSelectedFareId(fare.id)}
                  className={`
                    relative cursor-pointer rounded-xl border p-5 transition-all
                    ${selectedFareId === fare.id 
                      ? 'border-accent bg-accent/5 shadow-[0_0_0_1px_var(--st-accent)]' 
                      : 'border-theme-border bg-surface hover:border-accent/50 hover:shadow-sm'
                    }
                  `}
                >
                  {selectedFareId === fare.id && (
                    <div className="absolute top-4 right-4 text-accent">
                      <CheckCircle2 className="w-5 h-5 fill-accent/20" />
                    </div>
                  )}
                  <h4 className="font-bold text-primary text-lg mb-1">{fare.name}</h4>
                  <div className="text-2xl font-bold text-primary mb-4">
                    {formatMoney(fare.price, fare.currency)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-secondary">
                    {fare.cabin && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        <span>Cabin: <span className="font-medium text-primary">{fare.cabin.replace('_', ' ')}</span></span>
                      </div>
                    )}
                    {fare.baggage && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        <span>Baggage: <span className="font-medium text-primary">{fare.baggage}</span></span>
                      </div>
                    )}
                    {fare.cancellation && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        <span>Cancellation: <span className="font-medium text-primary">{fare.cancellation}</span></span>
                      </div>
                    )}
                    {fare.change && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        <span>Change: <span className="font-medium text-primary">{fare.change}</span></span>
                      </div>
                    )}
                    {fare.meal && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        <span>Meal: <span className="font-medium text-primary">{fare.meal}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. CTA / PRICE SUMMARY */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border border-theme-border bg-surface shadow-sm p-6 rounded-xl">
            <h3 className="font-bold text-lg text-primary mb-4">Price Summary</h3>
            <div className="space-y-3 text-sm text-secondary border-b border-theme-border pb-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span>Base Fare (1 Adult)</span>
                <span>{formatMoney(selectedFare.price, selectedFare.currency)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-theme-border">
                <span>Taxes & Fees</span>
                <span>{formatMoney(45, selectedFare.currency)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-primary">Total Price</span>
                <span className="text-2xl font-bold text-primary">
                  {formatMoney(selectedFare.price + 45, selectedFare.currency)}
                </span>
              </div>
            </div>
            
            <Button 
              fullWidth 
              size="lg" 
              className="bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-lg mt-2"
              onClick={() => navigate(`/flights/${flight.id}/passenger`)}
            >
              Continue to Passenger Details
            </Button>
            
            <div className="mt-4 flex items-start gap-2 text-xs text-muted">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Prices are shown in the provider currency and include all taxes and fees. Final price may vary based on payment method.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
