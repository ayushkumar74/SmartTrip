import React from 'react';
import HeroSection from '../components/dashboard/HeroSection';
import RecommendedTrips from '../components/dashboard/RecommendedTrips';
import UpcomingTrips from '../components/dashboard/UpcomingTrips';
import TravelInspiration from '../components/dashboard/TravelInspiration';

export default function Dashboard() {
  return (
    <div className="w-full">
      {/* Hero + Booking Search */}
      <HeroSection />

      {/* Main content with top margin to clear hero overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* Upcoming Trips — shown only when user has bookings */}
        <UpcomingTrips />

        {/* Travel Inspiration Grid */}
        <TravelInspiration />

        {/* Trending Destinations */}
        <RecommendedTrips />

      </div>
    </div>
  );
}
