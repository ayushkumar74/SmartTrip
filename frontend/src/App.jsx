import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Bookings from './pages/Bookings';
import Wishlist from './pages/Wishlist';
import { SettingsProvider } from './context/SettingsContext';
import DashboardLayout from './components/layout/DashboardLayout';
import './index.css';

// A simple wrapper to protect routes
const ProtectedRoute = ({ children }) => {
 const { user, loading } = useAuth();
 
 if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
 if (!user) return <Navigate to="/login" />;
 
 return children;
};

function App() {
 const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

 return (
 <GoogleOAuthProvider clientId={googleClientId}>
 <SettingsProvider>
 <AuthProvider>
 <Router>
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
 <Route path="/hotels" element={<ProtectedRoute><DashboardLayout><Hotels /></DashboardLayout></ProtectedRoute>} />
 <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
 <Route path="/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />
 <Route path="/bookings" element={<ProtectedRoute><DashboardLayout><Bookings /></DashboardLayout></ProtectedRoute>} />
 <Route path="/wishlist" element={<ProtectedRoute><DashboardLayout><Wishlist /></DashboardLayout></ProtectedRoute>} />
 </Routes>
 </Router>
 </AuthProvider>
 </SettingsProvider>
 </GoogleOAuthProvider>
 )
}

export default App;
