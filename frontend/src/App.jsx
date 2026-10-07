import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import FlightResults from './pages/FlightResults';
import FlightDetails from './pages/FlightDetails';
import PassengerDetails from './pages/PassengerDetails';
import BookingReview from './pages/BookingReview';
import MyTrips from './pages/MyTrips';
import TripDetails from './pages/TripDetails';
import Explore from './pages/Explore';
import PlanTrip from './pages/PlanTrip';
import Hotels from './pages/Hotels';
import HotelBookingReview from './pages/HotelBookingReview';
import FlightAddons from './pages/FlightAddons';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import PackageBookingReview from './pages/PackageBookingReview';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Bookings from './pages/Bookings';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import AdminUsers from './pages/admin-dashboard/AdminUsers';
import AdminBookings from './pages/admin-dashboard/AdminBookings';
import AdminPayments from './pages/admin-dashboard/AdminPayments';
import AdminFlights from './pages/admin-dashboard/AdminFlights';
import AdminHotels from './pages/admin-dashboard/AdminHotels';
import AdminPackages from './pages/admin-dashboard/AdminPackages';
import { SettingsProvider } from './context/SettingsContext';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import InfoPage from './components/layout/InfoPage';
import './index.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const ProtectedRoute = ({ children }) => {
 const { user, loading } = useAuth();
 
 if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
 if (!user) return <Navigate to="/login" />;
 
 return children;
};

// Admin route guard: frontend UX check only
const AdminProtectedRoute = ({ children }) => {
 const { user, loading } = useAuth();
 
 if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
 if (!user) return <Navigate to="/login" />;
 if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
 
 return children;
};

function App() {
 const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

 const appShell = (
 <SettingsProvider>
 <AuthProvider>
 <Router>
 <ScrollToTop />
 <Routes>
 <Route path="/" element={<Navigate to="/dashboard" />} />
 <Route path="/login" element={<Login />} />
 <Route path="/register" element={<Register />} />
 <Route 
 path="/dashboard" 
 element={
 <ProtectedRoute>
 <DashboardLayout>
 <Dashboard />
 </DashboardLayout>
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/profile" 
 element={
 <ProtectedRoute>
 <DashboardLayout>
 <Profile />
 </DashboardLayout>
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/flights" 
 element={
 <ProtectedRoute>
 <DashboardLayout>
 <FlightResults />
 </DashboardLayout>
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/flights/:id" 
 element={
 <ProtectedRoute>
 <DashboardLayout>
 <FlightDetails />
 </DashboardLayout>
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/flights/:id/passenger" 
 element={
 <ProtectedRoute>
 <DashboardLayout>
 <PassengerDetails />
 </DashboardLayout>
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/flights/:id/review" 
 element={
 <ProtectedRoute>
 <DashboardLayout>
 <BookingReview />
 </DashboardLayout>
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/my-trips" 
 element={
 <ProtectedRoute>
 <DashboardLayout>
 <MyTrips />
 </DashboardLayout>
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/my-trips/:id" 
 element={
 <ProtectedRoute>
 <DashboardLayout>
 <TripDetails />
 </DashboardLayout>
 </ProtectedRoute>
 } 
 />
 <Route path="/explore" element={<ProtectedRoute><DashboardLayout><Explore /></DashboardLayout></ProtectedRoute>} />
 <Route path="/plan" element={<ProtectedRoute><DashboardLayout><PlanTrip /></DashboardLayout></ProtectedRoute>} />
 <Route path="/plan-a-trip" element={<Navigate to="/plan" replace />} />
 <Route path="/hotels" element={<ProtectedRoute><DashboardLayout><Hotels /></DashboardLayout></ProtectedRoute>} />
 <Route path="/hotels/:id/review" element={<ProtectedRoute><DashboardLayout><HotelBookingReview /></DashboardLayout></ProtectedRoute>} />
  <Route path="/flights/:id/addons" element={<ProtectedRoute><DashboardLayout><FlightAddons /></DashboardLayout></ProtectedRoute>} />
  <Route path="/packages" element={<ProtectedRoute><DashboardLayout><Packages /></DashboardLayout></ProtectedRoute>} />
  <Route path="/packages/:id" element={<ProtectedRoute><DashboardLayout><PackageDetails /></DashboardLayout></ProtectedRoute>} />
  <Route path="/packages/:id/book" element={<ProtectedRoute><DashboardLayout><PackageBookingReview /></DashboardLayout></ProtectedRoute>} />
  <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
 <Route path="/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />
 <Route path="/bookings" element={<ProtectedRoute><DashboardLayout><Bookings /></DashboardLayout></ProtectedRoute>} />
 <Route path="/wishlist" element={<ProtectedRoute><DashboardLayout><Wishlist /></DashboardLayout></ProtectedRoute>} />

 {/* Admin Routes */}
 <Route 
   path="/admin/*" 
   element={
     <AdminProtectedRoute>
       <AdminLayout>
         <Routes>
           <Route path="/" element={<AdminDashboard />} />
           <Route path="/users" element={<AdminUsers />} />
           <Route path="/bookings" element={<AdminBookings />} />
           <Route path="/payments" element={<AdminPayments />} />
           <Route path="/flights" element={<AdminFlights />} />
           <Route path="/hotels" element={<AdminHotels />} />
           <Route path="/packages" element={<AdminPackages />} />
           {/* Future routes will go here */}
           <Route path="*" element={<Navigate to="/admin" replace />} />
         </Routes>
       </AdminLayout>
     </AdminProtectedRoute>
   } 
 />

 <Route path="/about" element={<ProtectedRoute><DashboardLayout><InfoPage title="About Us" eyebrow="Company" subtitle="SmartTrip brings together flights, stays, experiences, and planning for better global journeys." body={['SmartTrip is a modern travel marketplace designed to help travelers compare, plan, and book journeys with confidence.', 'We connect curated destinations, flexible itineraries, and customer-friendly trip planning across flights, stays, experiences, and holiday packages.', 'Our team focuses on simpler planning, transparent information, and professional end-to-end booking support.']} cta="Explore Trips" route="/dashboard" /></DashboardLayout></ProtectedRoute>} />
 <Route path="/careers" element={<ProtectedRoute><DashboardLayout><InfoPage title="Careers" eyebrow="Company" subtitle="Join the SmartTrip team shaping smarter, simpler journeys." body={['We are building a practical travel platform for customers who want clarity, confidence, and convenience across every trip.', 'From destination discovery to itinerary planning and booking experience, our product team works across customer experience, marketplace operations, and technology.', 'Explore opportunities in product, engineering, design, supply operations, and traveler support.']} cta="Start Exploring" route="/explore" /></DashboardLayout></ProtectedRoute>} />
 <Route path="/press" element={<ProtectedRoute><DashboardLayout><InfoPage title="Press" eyebrow="Company" subtitle="SmartTrip updates and travel publishing from the marketplace newsroom." body={['SmartTrip helps travelers discover, reserve, and compare flexible journey options from trusted travel content and destination intelligence.', 'Our editorial and product teams publish destination inspiration, itinerary updates, and marketplace storylines for planning journeys with confidence.', 'For press requests, media interviews, and partnership opportunities, contact our team at support@smarttrip.com.']} cta="Explore Destinations" route="/explore" /></DashboardLayout></ProtectedRoute>} />
 <Route path="/investor-relations" element={<ProtectedRoute><DashboardLayout><InfoPage title="Investor Relations" eyebrow="Company" subtitle="SmartTrip is building a transparent digital travel platform focused on better trip planning." body={['SmartTrip is developing an integrated marketplace for flights, hotels, holiday packages, and destination experiences.', 'Our operating strategy prioritizes reliable travel search, practical itinerary planning, and a smoother booking journey for travelers worldwide.', 'For investor or partnership information, please contact our team through the SmartTrip support mailbox.']} cta="Plan a Trip" route="/plan" /></DashboardLayout></ProtectedRoute>} />
 <Route path="/investors" element={<Navigate to="/investor-relations" replace />} />

 <Route path="/help-center" element={<ProtectedRoute><DashboardLayout><InfoPage title="Help Center" eyebrow="Support" subtitle="Need help planning or managing your travel booking?" body={['Our Help Center gives travelers practical answers for booking, itinerary changes, trip planning, destination inspiration, and privacy-related questions.', 'Use the support knowledge base and booking management tools to review your upcoming route, reservation details, or cancellation information.', 'For detailed travel assistance, connect with our support desk at support@smarttrip.com or +91 1800-SMART.']} cta="Manage Bookings" route="/my-trips" /></DashboardLayout></ProtectedRoute>} />
 <Route path="/support" element={<Navigate to="/help-center" replace />} />
 <Route path="/manage-bookings" element={<ProtectedRoute><DashboardLayout><MyTrips /></DashboardLayout></ProtectedRoute>} />
 <Route path="/my-trips" element={<ProtectedRoute><DashboardLayout><MyTrips /></DashboardLayout></ProtectedRoute>} />
 <Route path="/cancellation-policy" element={<ProtectedRoute><DashboardLayout><InfoPage title="Cancellation Policy" eyebrow="Support" subtitle="Travel flexibility is important. SmartTrip supports transparent cancellation guidance." body={['Cancellations are managed according to the fare, hotel room, or package policy selected at the time of booking.', 'Customers should review fare rules and room privileges before confirming a reservation, including applicable refund windows and eligibility.', 'If you need assistance with a cancellation or refund, visit your bookings and contact SmartTrip support for help.']} cta="Manage Bookings" route="/my-trips" /></DashboardLayout></ProtectedRoute>} />
 <Route path="/support/cancellations" element={<Navigate to="/cancellation-policy" replace />} />

 <Route path="/privacy" element={<ProtectedRoute><DashboardLayout><InfoPage title="Privacy Policy" eyebrow="Contact" subtitle="SmartTrip respects customer information and travel data privacy." body={['SmartTrip collects necessary account, booking, search, and travel preference information to provide a secure booking experience.', 'We use account and session data to personalize trip planning, support bookings, and maintain service reliability.', 'Customers may review their saved settings, trip history, and booking communications through their account and support channels.']} cta="Back to Dashboard" route="/dashboard" /></DashboardLayout></ProtectedRoute>} />
 <Route path="/terms" element={<ProtectedRoute><DashboardLayout><InfoPage title="Terms of Service" eyebrow="Contact" subtitle="SmartTrip booking and travel services are governed by clear platform usage and reservation rules." body={['SmartTrip provides services that connect customers with travel products, destination search, and booking workflows.', 'Customers should confirm destination information, checking dates, room selection, fare terms, and cancellation conditions before completing a booking.', 'Booking services are subject to provider availability, schedule changes, and applicable travel policies.']} cta="Search Flights" route="/flights" /></DashboardLayout></ProtectedRoute>} />
 </Routes>
 </Router>
 </AuthProvider>
 </SettingsProvider>
 );

 if (!googleClientId) {
   return appShell;
 }

 return (
   <GoogleOAuthProvider clientId={googleClientId}>
     {appShell}
   </GoogleOAuthProvider>
 );
}

export default App;
