import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 // Check if user is logged in on mount
 const loadUser = async () => {
 try {
 const response = await authService.getCurrentUser();
 setUser(response.data.user);
 } catch (error) {
 setUser(null);
 } finally {
 setLoading(false);
 }
 };
 loadUser();
 }, []);

 const login = async (credentials) => {
 const response = await authService.login(credentials);
 setUser(response.data.user);
 return response;
 };

 const loginWithGoogle = async (token) => {
 const response = await authService.googleLogin(token);
 setUser(response.data.user);
 return response;
 };

 const loginWithOtp = async (identifier, otp) => {
 const response = await authService.verifyOtp(identifier, otp);
 setUser(response.data.user);
 return response;
 };

 const logout = async () => {
 await authService.logout();
 setUser(null);
 };

 return (
 <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithOtp, logout }}>
 {children}
 </AuthContext.Provider>
 );
};

export const useAuth = () => useContext(AuthContext);
