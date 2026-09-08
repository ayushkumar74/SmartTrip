import React from 'react';
import { Plane, Building2, Map, Navigation, Heart, User, Briefcase, Menu, LogOut, ChevronDown, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export default function TopHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { t, theme, setTheme } = useSettings();
  const location = useLocation();

  const navItems = [
    { name: t('nav.flights') || 'Flights', icon: Plane, path: '/flights' },
    { name: t('nav.hotels') || 'Hotels', icon: Building2, path: '/hotels' },
    { name: 'Holiday Packages', icon: Map, path: '/packages' },
    { name: t('nav.explore') || 'Explore', icon: Navigation, path: '/explore' },
    { name: t('nav.plan') || 'Plan a Trip', icon: Map, path: '/plan' },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-surface shadow-sm border-b border-theme-border shrink-0">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Left: Branding & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-text-secondary hover:bg-elevated rounded-md transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-1.5 group">
            <div className="bg-accent p-1.5 rounded-lg group-hover:bg-accent/80 transition-colors shadow-sm">
              <Plane className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-text-primary font-heading">
              Smart<span className="text-accent">Trip</span>
            </span>
          </Link>
        </div>

        {/* Middle: Primary Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 h-full">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`flex items-center justify-center h-full relative group transition-colors ${
                  isActive ? 'text-accent font-bold' : 'text-text-secondary font-semibold hover:text-accent'
                }`}
              >
                <span className="text-[14px]">{item.name}</span>
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-t-md"></div>
                )}
                {!isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-accent rounded-t-md transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: User Actions */}
        <div className="flex items-center gap-6 h-full">
          <Link to="/my-trips" className="hidden sm:flex items-center justify-center h-full relative group transition-colors text-text-secondary font-semibold hover:text-accent">
            <span className="text-[14px]">My Trips</span>
          </Link>
          
          <Link to="/wishlist" className="hidden sm:flex items-center justify-center h-full relative group transition-colors text-text-secondary font-semibold hover:text-accent">
            <span className="text-[14px]">Wishlist</span>
          </Link>

          <div className="h-6 w-px bg-theme-border hidden sm:block mx-1"></div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-text-secondary hover:bg-elevated transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="h-6 w-px bg-theme-border hidden sm:block mx-1"></div>

          {user ? (
            <div className="flex items-center">
              <Link to="/profile" className="flex items-center gap-2 group py-1.5 pl-1.5 pr-2 rounded-lg hover:bg-elevated transition-colors">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm uppercase shrink-0">
                  {user?.firstName?.charAt(0) || <User className="h-4 w-4" />}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] text-text-muted font-medium">Logged in</span>
                  <span className="text-[13px] font-bold text-text-primary leading-none flex items-center gap-1">
                    {user?.firstName || 'Traveler'}
                    <ChevronDown className="w-3 h-3 text-text-muted" />
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 bg-accent text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-accent/90 transition-colors shadow-sm">
              <User className="h-4 w-4" /> Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

