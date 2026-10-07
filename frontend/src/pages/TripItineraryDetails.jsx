import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2, MapPin, Trash2 } from 'lucide-react';
import { tripService } from '../services/trip.service';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function TripItineraryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    tripService.getTripById(id)
      .then((response) => setTrip(response.data.trip))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load this trip.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this planned trip?')) return;
    setDeleting(true);
    try {
      await tripService.deleteTrip(id);
      navigate('/my-trips');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete this trip.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  if (error || !trip) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/my-trips')} className="p-2 text-muted hover:text-primary" aria-label="Back to My Trips">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">{trip.title}</h1>
            {trip.destination && <p className="text-sm text-secondary flex items-center gap-1"><MapPin className="h-4 w-4" />{trip.destination.name}, {trip.destination.country}</p>}
          </div>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => navigate('/plan', { state: { trip } })}>Edit Trip</Button><Button variant="outline" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-4 w-4 mr-2" />{deleting ? 'Deleting...' : 'Delete Trip'}
        </Button></div>
      </div>

      <div className="flex items-center gap-2 text-sm text-secondary mb-6">
        <Calendar className="h-4 w-4" />
        {trip.startDate && new Date(trip.startDate).toLocaleDateString('en-GB')} to {trip.endDate && new Date(trip.endDate).toLocaleDateString('en-GB')}
      </div>

      <div className="space-y-4">
        {trip.days?.map((day) => (
          <Card key={day.id}>
            <CardHeader title={`Day ${day.dayNumber}`} subtitle={day.date ? new Date(day.date).toLocaleDateString('en-GB') : undefined} />
            <div className="space-y-3">
              {day.activities?.length ? day.activities.map((activity) => (
                <div key={activity.id} className="border-b border-theme-border last:border-0 pb-3 last:pb-0">
                  <p className="font-bold text-primary">{activity.title}</p>
                  <p className="text-xs text-accent uppercase tracking-wider">{activity.activityType}</p>
                  {activity.description && <p className="text-sm text-secondary mt-1">{activity.description}</p>}
                </div>
              )) : <p className="text-sm text-muted">No activities saved for this day.</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
