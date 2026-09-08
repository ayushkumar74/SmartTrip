import React from 'react';
import TopHeader from './TopHeader';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }) {
 const location = useLocation();
 const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

 return (
  <div className="flex flex-col min-h-screen bg-page font-sans text-primary">
 <TopHeader onMenuClick={() => {}} />
 
 {/* Main Content Area */}
 <main className="flex-1 w-full relative">
 <div className={isDashboard ? "w-full" : "max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"}>
 {children}
 </div>
 </main>

 <Footer />
 </div>
 );
}
