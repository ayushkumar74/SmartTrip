import React, { useEffect, useRef, useState } from 'react';
import { Plane, Building2, Map, Navigation, Heart, User, Bell, Briefcase, Menu, LogOut, ChevronDown, Globe2, X, Palmtree, Settings, Search, Calendar, Hotel } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { notificationService } from '../../services/notification.service';

export default function TopHeader({ onMenuClick, isDashboard }) {
  const { user, logout } = useAuth();
  
  const [isSticky, setIsSticky] = useState(!isDashboard);

  useEffect(() => {
    if (!isDashboard) {
      setIsSticky(true);
      return;
    }
    const handleHeroSticky = (e) => setIsSticky(e.detail);
    window.addEventListener('hero-sticky', handleHeroSticky);
    return () => window.removeEventListener('hero-sticky', handleHeroSticky);
  }, [isDashboard]);

  const isHeroNav = isDashboard && !isSticky;
  const { t, language, setLanguage, currency, setCurrency, country, setCountry } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [locLanguage, setLocLanguage] = useState(language);
  const [locCurrency, setLocCurrency] = useState(currency);
  const [locCountry, setLocCountry] = useState(country);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    notificationService.getUnreadCount()
      .then((response) => setUnreadCount(response.data?.data?.unreadCount || 0))
      .catch(() => setUnreadCount(0));
  }, [user, location.pathname]);

  const getActiveTab = () => {
    if (location.pathname.startsWith('/flights')) return 'flights';
    if (location.pathname.startsWith('/hotels')) return 'hotels';
    if (location.pathname.startsWith('/packages')) return 'packages';
    if (location.pathname.startsWith('/explore')) return 'explore';
    if (location.pathname.startsWith('/plan')) return 'plan';
    
    if (isDashboard) {
      const hash = location.hash.replace('#booking-', '');
      if (['flights', 'hotels', 'packages', 'explore', 'plan'].includes(hash)) {
        return hash;
      }
      return 'flights';
    }
    return '';
  };
  
  const activeTab = getActiveTab();

  const handleSelect = (item) => {
    navigate(`/dashboard#booking-${item.id}`);
    if (!isHeroNav) window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'packages', label: 'Holiday Packages', icon: Globe2 },
    { id: 'explore', label: 'Explore', icon: Map },
    { id: 'plan', label: 'Plan a Trip', icon: Calendar },
  ];
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.smarttrip-user-dropdown')) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setLocaleOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const onLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setOpen(false);
    } catch {
      navigate('/login');
    }
  };

  const isActive = (path) => {
    if (path === '/flights') return location.pathname.startsWith('/flights');
    if (path === '/hotels') return location.pathname.startsWith('/hotels');
    if (path === '/packages') return location.pathname.startsWith('/packages');
    return false;
  };

  const HeaderContent = ({ isHero, onMenuToggle, isMenuOpen }) => (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
      {/* Logo */}
      <div className="justify-self-start flex items-center">
        <Link to="/dashboard" onClick={() => { if (!isHero) window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2 shrink-0 group">
          <div className={`p-1.5 rounded-lg transition-colors shadow-sm ${
            isHero ? 'bg-white/20 group-hover:bg-white/30 backdrop-blur-sm' : 'bg-brand-600 group-hover:bg-brand-700'
          }`}>
            <Plane className={`h-4 w-4 ${isHero ? 'text-white' : 'text-white'}`} />
          </div>
          <span className={`text-lg font-black tracking-tight font-heading transition-colors ${
            isHero ? 'text-white' : 'text-gray-900'
          }`}>
            Smart<span className={isHero ? 'text-white' : 'text-brand-600'}>Trip</span>
          </span>
        </Link>
      </div>

      {/* Global Sticky Nav Items */}
      <div className={`flex-1 flex justify-center overflow-x-auto no-scrollbar mx-4 transition-opacity duration-200 ${!isHero ? 'opacity-100 visible' : 'opacity-0 invisible hidden lg:block'}`}>
        {!isHero && (
          <div className="flex gap-4 sm:gap-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`relative py-5 text-[14px] font-bold tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
                  }`}
                >
                  <item.icon strokeWidth={2.5} className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 justify-self-end">
        {/* Wishlist link */}
        <Link
          to="/wishlists"
          className={`hidden md:flex items-center gap-1.5 px-2 py-1.5 text-[14px] font-medium transition-colors ${
            isHero ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-brand-600'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist</span>
        </Link>

        {/* My Trips link (desktop) */}
        <Link
          to="/my-trips"
          className={`hidden md:flex items-center gap-1.5 px-2 py-1.5 text-[14px] font-medium transition-colors ${
            isHero ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-brand-600'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Trips</span>
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className={`relative p-1.5 rounded-full transition-colors mx-1 ${
            isHero ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
          }`}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          )}
        </Link>

        <div className={`w-px h-5 mx-2 hidden md:block ${isHero ? 'bg-white/20' : 'bg-gray-200'}`} />

        {/* User dropdown */}
        {user ? (
          <div className="relative smarttrip-user-dropdown">
            <button
              onClick={() => setOpen(!open)}
              className={`flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full border transition-all ${
                isHero
                  ? 'border-transparent hover:bg-white/10'
                  : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                isHero ? 'bg-white text-brand-700' : 'bg-brand-600 text-white'
              }`}>
                {user?.name?.charAt(0)?.toUpperCase() || <User className="h-3 w-3" />}
              </div>
              <span className={`hidden sm:block text-[14px] font-medium max-w-[100px] truncate ${
                isHero ? 'text-white/90' : 'text-gray-700'
              }`}>
                {user?.name?.split(' ')[0] || 'Account'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''} ${
                isHero ? 'text-white/70' : 'text-gray-400'
              }`} />
            </button>

            {open && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white border border-gray-200 shadow-lg rounded-xl py-1.5 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-semibold text-gray-900 truncate text-sm">{user?.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>

                <div className="py-1 px-1.5">
                  <button onClick={() => { setOpen(false); navigate('/profile'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                    <User className="w-4 h-4 text-gray-400" /> My Profile
                  </button>
                  <button onClick={() => { setOpen(false); navigate('/my-trips'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                    <Briefcase className="w-4 h-4 text-gray-400" /> My Trips
                  </button>
                  <button onClick={() => { setOpen(false); navigate('/wishlist'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                    <Heart className="w-4 h-4 text-gray-400" /> Wishlist
                  </button>
                  <button onClick={() => { setOpen(false); navigate('/settings'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" /> Settings
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1 px-1.5 mt-0.5">
                  <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-medium">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm"
          >
            Sign In
          </Link>
        )}

        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className={`lg:hidden ml-1 p-2 rounded-md transition-colors ${
            isHero ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isDashboard && (
        <header className="absolute top-0 left-0 right-0 w-full z-[100] bg-transparent transition-opacity duration-300">
          <HeaderContent isHero={true} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} isMenuOpen={mobileMenuOpen} />
        </header>
      )}

      <header
        className="fixed top-0 left-0 right-0 w-full z-[100] bg-white shadow-md border-b border-gray-200"
        style={{
          transform: (!isDashboard || isSticky) ? 'translateY(0)' : 'translateY(-100%)',
          opacity: (!isDashboard || isSticky) ? 1 : 0,
          transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms',
          pointerEvents: (!isDashboard || isSticky) ? 'auto' : 'none'
        }}
      >
        <HeaderContent isHero={false} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} isMenuOpen={mobileMenuOpen} />
      </header>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(item.path) ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button onClick={() => { navigate('/my-trips'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">My Trips</button>
              <button onClick={() => { navigate('/wishlist'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Wishlist</button>
            </div>
          </div>
        )}

      {/* Locale Settings Modal */}
      {localeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" style={{ zIndex: 300 }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Regional Settings</h3>
              <button onClick={() => setLocaleOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Country</span>
                <select value={locCountry} onChange={(e) => setLocCountry(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Currency</span>
                <select value={locCurrency} onChange={(e) => setLocCurrency(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Language</span>
                <select value={locLanguage} onChange={(e) => setLocLanguage(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setLocaleOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button
                onClick={() => { setCountry(locCountry); setCurrency(locCurrency); setLanguage(locLanguage); setLocaleOpen(false); }}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
