import React from 'react';
import HeroSection from '../components/dashboard/HeroSection';
import RecommendedTrips from '../components/dashboard/RecommendedTrips';
import UpcomingTrips from '../components/dashboard/UpcomingTrips';
import TravelInspiration from '../components/dashboard/TravelInspiration'; // New component
import { useSettings } from '../context/SettingsContext';

export default function Dashboard() {
 const { t } = useSettings();
 
  return (
    <div className="w-full bg-page min-h-screen font-sans">
      {/* Integrated Hero + Booking Engine */}
      <HeroSection />

 {/* Main Content Area */}
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-8 space-y-16">
 
 {/* Horizontal Timeline Itinerary Component */}
 <UpcomingTrips />

 {/* Travel Inspiration Mosaics */}
 <TravelInspiration />

 {/* Dense Recommended Trips list */}
 <RecommendedTrips />
 
 </div>
 </div>
 );
}
