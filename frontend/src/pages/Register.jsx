import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Mail, KeyRound, Phone, ArrowLeft } from 'lucide-react';

export default function Register() {
 const { loginWithGoogle } = useAuth();
 const navigate = useNavigate();

 const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
 const [error, setError] = useState(null);
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 setError(null);
 await authService.register(formData);
 navigate('/login'); // We don't automatically log them in based on current controller logic
 } catch (err) {
 setError(err.response?.data?.message || 'Registration failed');
 } finally {
 setLoading(false);
 }
 };

 const handleGoogleSuccess = async (credentialResponse) => {
 try {
 setError(null);
 await loginWithGoogle(credentialResponse.credential);
 navigate('/dashboard');
 } catch (err) {
 setError(err.response?.data?.message || 'Google Registration failed');
 }
 };

 return (
 <AuthLayout 
 title="Start your journey."
 subtitle="Join SmartTrip today to unlock exclusive travel deals, personalized itineraries, and seamless booking."
 imageSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
 >
 <div className="mb-8">
 <h2 className="text-3xl font-bold text-text-primary font-heading">Create an account</h2>
 <p className="text-text-muted mt-2">Sign up in seconds to start planning your next adventure.</p>
 </div>

 {error && (
 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
 <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
 </svg>
 {error}
 </div>
 )}

 <div className="mt-4 flex justify-center p-1 rounded-lg border border-border hover:bg-page transition-colors mb-6">
 <GoogleLogin
 onSuccess={handleGoogleSuccess}
 onError={() => setError('Google login failed')}
 useOneTap={false}
 theme="outline"
 size="large"
 text="signup_with"
 shape="rectangular"
 width="100%"
 />
 </div>

 <div className="relative mb-6">
 <div className="absolute inset-0 flex items-center" aria-hidden="true">
 <div className="w-full border-t border-border" />
 </div>
 <div className="relative flex justify-center text-sm font-medium leading-6">
 <span className="bg-surface px-6 text-text-muted">Or sign up with email</span>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
 <User className="w-4 h-4 text-gray-400" /> Full Name
 </label>
 <Input 
 type="text" 
 required 
 value={formData.name} 
 onChange={e => setFormData({...formData, name: e.target.value})}
 placeholder="John Doe"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
 <Mail className="w-4 h-4 text-gray-400" /> Email Address
 </label>
 <Input 
 type="email" 
 required 
 value={formData.email} 
 onChange={e => setFormData({...formData, email: e.target.value})}
 placeholder="john@example.com"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
 <Phone className="w-4 h-4 text-gray-400" /> Phone Number (Optional)
 </label>
 <Input 
 type="tel" 
 value={formData.phone} 
 onChange={e => setFormData({...formData, phone: e.target.value})}
 placeholder="+1 (555) 000-0000"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
 <KeyRound className="w-4 h-4 text-gray-400" /> Password
 </label>
 <Input 
 type="password" 
 required 
 minLength={8}
 value={formData.password} 
 onChange={e => setFormData({...formData, password: e.target.value})}
 placeholder="Create a strong password"
 />
 </div>
 
 <div className="flex items-center mt-4">
 <input
 id="terms"
 name="terms"
 type="checkbox"
 required
 className="h-4 w-4 rounded border-border-strong text-blue-600 focus:ring-blue-600"
 />
 <label htmlFor="terms" className="ml-2 block text-sm text-text-primary">
 I agree to the{' '}
 <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Terms of Service</a>
 {' '}and{' '}
 <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Privacy Policy</a>
 </label>
 </div>

 <Button fullWidth type="submit" isLoading={loading} className="mt-6">
 Create Account
 </Button>
 </form>

 <p className="mt-8 text-center text-sm text-text-muted">
 Already have an account?{' '}
 <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1 inline-flex">
 <ArrowLeft className="w-4 h-4" /> Back to login
 </Link>
 </p>
 </AuthLayout>
 );
}
