import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Star, Wifi, Utensils, ShieldCheck } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';

const nightsBetween = (checkIn, checkOut) => Math.max(1, Math.ceil((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000));

export default function HotelRoomSelection() {
  const { formatMoney } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const hotel = state?.hotel;
  const nights = state?.checkIn && state?.checkOut ? nightsBetween(state.checkIn, state.checkOut) : 0;

  if (!hotel || !state?.checkIn || !state?.checkOut) return <div className="max-w-3xl mx-auto py-16 text-center text-red-600">Select a hotel with valid stay dates first.</div>;

  const rooms = hotel.rooms || [];
  const selectRoom = (room) => navigate(`/hotels/${hotel.id}/guest-details`, { state: { ...state, roomId: room.id, room } });

  return (
    <div className="bg-page min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary"><ArrowLeft className="w-4 h-4" /> Back to hotels</button>
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[280px_1fr]">
            <img src={hotel.images?.[0] || hotel.imageUrl} alt={hotel.name} className="w-full h-56 md:h-full object-cover" />
            <div className="p-5">
              <div className="flex items-center gap-1 mb-2">{Array.from({ length: Math.floor(hotel.rating || 0) }, (_, index) => <Star key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
              <h1 className="text-2xl font-black text-primary">{hotel.name}</h1>
              <p className="mt-2 flex items-center gap-1 text-sm text-secondary"><MapPin className="w-4 h-4" /> {hotel.address || hotel.city || hotel.location}</p>
              <p className="mt-2 text-sm text-secondary">{hotel.reviewScore ? `${hotel.reviewScore}/10` : 'Highly rated'} {hotel.reviewCount ? `· ${hotel.reviewCount} reviews` : ''}</p>
              <div className="flex flex-wrap gap-2 mt-4">{(hotel.amenities || []).map((amenity) => <span key={amenity} className="inline-flex items-center gap-1 rounded border border-theme-border bg-elevated px-2 py-1 text-xs font-semibold text-secondary"><Check className="w-3 h-3 text-green-600" />{amenity}</span>)}</div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between"><div><h2 className="text-xl font-black text-primary">Choose your room</h2><p className="text-sm text-secondary">{state.checkIn} to {state.checkOut} · {nights} night{nights === 1 ? '' : 's'} · {state.guests || 'Selected guests'}</p></div></div>
        <div className="space-y-4">
          {rooms.map((room) => {
            const nightly = Number(room.price || 0);
            const total = nightly * nights;
            return <Card key={room.id} className="p-5"><div className="grid lg:grid-cols-[1fr_auto] gap-5 items-center"><div><h3 className="text-lg font-black text-primary">{room.name}</h3><div className="flex flex-wrap gap-3 mt-2 text-sm text-secondary"><span className="inline-flex items-center gap-1"><Wifi className="w-4 h-4" /> {room.capacity || 2} guests</span>{room.mealPlan && <span className="inline-flex items-center gap-1"><Utensils className="w-4 h-4" /> {room.mealPlan}</span>}{room.cancellation && <span className="inline-flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-600" /> {room.cancellation}</span>}</div><div className="flex flex-wrap gap-2 mt-3">{(room.amenities || []).map((amenity) => <span key={amenity} className="text-xs font-semibold text-secondary">{amenity}</span>)}</div></div><div className="lg:text-right lg:min-w-48"><div className="text-xs font-bold uppercase tracking-widest text-muted">Per night</div><div className="text-2xl font-black text-primary">{formatMoney(nightly, room.currency || 'INR')}</div><div className="text-sm text-secondary">{nights} nights · {formatMoney(total, room.currency || 'INR')}</div><div className="text-xs text-muted mt-1">Taxes and fees calculated at review</div><Button className="mt-3 w-full lg:w-auto bg-blue-600 text-white" onClick={() => selectRoom(room)}>Select room</Button></div></div></Card>;
          })}
        </div>
      </div>
    </div>
  );
}
