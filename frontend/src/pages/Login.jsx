import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, KeyRound, Smartphone, ArrowRight } from 'lucide-react';

export default function Login() {
 const { login, loginWithGoogle, loginWithOtp } = useAuth();
 const navigate = useNavigate();

 const [mode, setMode] = useState('password'); // 'password' | 'otp_request' | 'otp_verify'
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [otpIdentifier, setOtpIdentifier] = useState('');
 const [otp, setOtp] = useState('');
 const [error, setError] = useState(null);
 const [loading, setLoading] = useState(false);

 const handlePasswordLogin = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 setError(null);
 await login({ email, password });
 navigate('/dashboard');
 } catch (err) {
 setError(err.response?.data?.message || 'Login failed');
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
 setError(err.response?.data?.message || 'Google Login failed');
 }
 };

 const handleOtpRequest = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 setError(null);
 await authService.requestOtp(otpIdentifier);
 setMode('otp_verify');
 } catch (err) {
 setError(err.response?.data?.message || 'Failed to request OTP');
 } finally {
 setLoading(false);
 }
 };

 const handleOtpVerify = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 setError(null);
 await loginWithOtp(otpIdentifier, otp);
 navigate('/dashboard');
 } catch (err) {
 setError(err.response?.data?.message || 'Invalid OTP');
 } finally {
 setLoading(false);
 }
 };

 return (
 <AuthLayout 
 title="Welcome back to SmartTrip"
 subtitle="Log in to access your upcoming trips, tailored recommendations, and seamless bookings."
 >
 <div className="mb-8">
 <h2 className="text-3xl font-bold text-text-primary font-heading">Sign In</h2>
 <p className="text-text-muted mt-2">Welcome back! Please enter your details.</p>
 </div>

 {error && (
 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
 <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
 </svg>
 {error}
 </div>
 )}

 {mode === 'password' && (
 <form onSubmit={handlePasswordLogin} className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
 <Mail className="w-4 h-4 text-gray-400" /> Email Address
 </label>
 <Input 
 id="email"
 name="email"
 type="email" 
 required 
 value={email} 
 onChange={e => setEmail(e.target.value)}
 placeholder="Enter your email"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <KeyRound className="w-4 h-4 text-gray-400" /> Password
 </div>
 <a href="#" className="text-blue-600 hover:text-blue-700 text-xs font-semibold">Forgot password?</a>
 </label>
 <Input 
 id="password"
 name="password"
 type="password" 
 required 
 value={password} 
 onChange={e => setPassword(e.target.value)}
 placeholder="••••••••"
 />
 </div>
 <Button fullWidth type="submit" isLoading={loading}>
 Sign In
 </Button>
 </form>
 )}

 {mode === 'otp_request' && (
 <form onSubmit={handleOtpRequest} className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
 <Smartphone className="w-4 h-4 text-gray-400" /> Mobile Number or Email
 </label>
 <Input 
 type="text" 
 required 
 value={otpIdentifier} 
 onChange={e => setOtpIdentifier(e.target.value)}
 placeholder="Enter phone or email"
 />
 </div>
 <Button fullWidth type="submit" isLoading={loading}>
 Send One-Time Password
 </Button>
 </form>
 )}

 {mode === 'otp_verify' && (
 <form onSubmit={handleOtpVerify} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 text-sm text-blue-800">
 We've sent a 6-digit code to <strong>{otpIdentifier}</strong>.
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-2">Enter verification code</label>
 <input 
 type="text" 
 required 
 maxLength={6} 
 value={otp} 
 onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
 placeholder="000000"
 className="tracking-[1em] text-center text-2xl appearance-none block w-full px-3 py-4 border border-border-strong rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 <Button fullWidth type="submit" isLoading={loading}>
 Verify & Sign In
 </Button>
 <div className="text-center mt-4">
 <button 
 type="button" 
 onClick={() => setMode('otp_request')}
 className="text-sm text-text-muted hover:text-text-secondary font-medium"
 >
 Didn't receive the code? Back to request.
 </button>
 </div>
 </form>
 )}

 <div className="mt-8 relative">
 <div className="absolute inset-0 flex items-center" aria-hidden="true">
 <div className="w-full border-t border-border" />
 </div>
 <div className="relative flex justify-center text-sm font-medium leading-6">
 <span className="bg-surface px-6 text-text-muted">Or continue with</span>
 </div>
 </div>

 <div className="mt-6 flex flex-col gap-3">
 <div className="w-full flex justify-center p-1 rounded-lg border border-border hover:bg-page transition-colors">
 <GoogleLogin
 onSuccess={handleGoogleSuccess}
 onError={() => setError('Google login failed')}
 useOneTap={false}
 theme="outline"
 size="large"
 text="continue_with"
 shape="rectangular"
 width="100%"
 />
 </div>
 
 {mode !== 'password' && (
 <Button variant="outline" fullWidth onClick={() => { setMode('password'); setError(null); }}>
 Use Password Instead
 </Button>
 )}
 {mode !== 'otp_request' && mode !== 'otp_verify' && (
 <Button variant="outline" fullWidth onClick={() => { setMode('otp_request'); setError(null); }}>
 Use One-Time Password
 </Button>
 )}
 </div>

 <p className="mt-10 text-center text-sm text-text-muted">
 Don't have an account?{' '}
 <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1 inline-flex">
 Create an account <ArrowRight className="w-4 h-4" />
 </Link>
 </p>
 </AuthLayout>
 );
}
