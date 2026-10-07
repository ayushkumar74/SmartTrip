import React from 'react';
import TopHeader from './TopHeader';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const isFullWidthPage = isDashboard || location.pathname.startsWith('/flights') || location.pathname.startsWith('/hotels') || location.pathname.startsWith('/packages');

  return (
    <div className="flex flex-col bg-[#f7f8fa] font-sans">
      {/* Sticky navbar — z-index 100 keeps it above ALL page content */}
      <TopHeader onMenuClick={() => {}} isDashboard={isDashboard} />

      {/* Main content */}
      <main className={`w-full ${isDashboard ? '' : 'pt-16'}`}>
        {isFullWidthPage ? (
          /* Full-width for hero and search result pages */
          <div className="w-full">{children}</div>
        ) : (
          /* All other pages: constrained with top padding */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
