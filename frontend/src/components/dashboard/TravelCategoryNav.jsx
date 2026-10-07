import React, { useState, useEffect, useRef } from 'react';
import { Plane, Hotel, Globe2, Map, Calendar, Heart, Briefcase, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notification.service';

export default function TravelCategoryNav({ isSticky, activeTab, onTabSelect }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    notificationService.getUnreadCount()
      .then((response) => setUnreadCount(response.data?.data?.unreadCount || 0))
      .catch(() => setUnreadCount(0));
  }, [user, location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
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

  const handleSelect = (item) => {
    onTabSelect(item.id);
    window.history.replaceState(null, '', `#booking-${item.id}`);
    if (isSticky) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ONE canonical navigation configuration
  const navItems = [
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'packages', label: 'Holiday Packages', icon: Globe2 },
    { id: 'explore', label: 'Explore', icon: Map },
    { id: 'plan', label: 'Plan a Trip', icon: Calendar },
  ];

  // Right Side Utilities component to keep things DRY between both states
  // Actually, we only render utilities in the sticky state to avoid duplication with TopHeader,
  // but if needed we can render it anywhere.
  const RightUtilities = () => (
    <div className="flex items-center gap-2">
      <Link to="/wishlists" className="hidden md:flex items-center gap-1.5 px-2 py-1.5 text-[14px] font-medium text-gray-700 hover:text-brand-600 transition-colors">
        <Heart className="w-4 h-4" />
        <span>Wishlist</span>
      </Link>
      <Link to="/my-trips" className="hidden md:flex items-center gap-1.5 px-2 py-1.5 text-[14px] font-medium text-gray-700 hover:text-brand-600 transition-colors">
        <Briefcase className="w-4 h-4" />
        <span>My Trips</span>
      </Link>
      <Link to="/notifications" className="relative p-1.5 rounded-full mx-1 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors" aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        )}
      </Link>
      
      <div className="w-px h-5 mx-2 hidden md:block bg-gray-200" />
      
      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full border border-transparent hover:bg-gray-50 hover:border-gray-200 transition-all"
          >
            <div className="h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || <User className="h-3 w-3" />}
            </div>
            <span className="hidden sm:block text-[14px] font-medium max-w-[100px] truncate text-gray-700">
              {user?.name?.split(' ')[0] || 'Account'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white border border-gray-200 shadow-lg rounded-xl py-1.5 z-[150]">
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
                <button onClick={() => { setOpen(false); navigate('/wishlists'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                  <Heart className="w-4 h-4 text-gray-400" /> Wishlist
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
        <Link to="/login" className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm">
          Sign In
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* 
        STATE A: HERO NAVIGATION (Always in document flow)
        Fades out smoothly when sticky to prevent jumping.
      */}
      <div 
        className="relative bg-slate-50 dark:bg-slate-900/50 rounded-t-xl border-b border-theme-border w-full z-10 transition-opacity duration-[240ms]"
        style={{ opacity: isSticky ? 0 : 1, pointerEvents: isSticky ? 'none' : 'auto' }}
      >
        <div className="flex overflow-x-auto no-scrollbar w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`flex-1 px-4 py-3.5 flex flex-col min-w-[100px] items-center justify-center gap-2 font-bold uppercase tracking-widest text-[11px] transition-all ${
                  isActive
                    ? 'bg-surface text-brand-600 shadow-sm border-b-2 border-b-brand-600 shadow-[0_-4px_0_0_inset_rgba(37,99,235,0)]' 
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 border-b-2 border-b-transparent'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors ${isActive ? 'bg-brand-50 shadow-sm' : 'group-hover:bg-slate-200/50'}`}>
                  <item.icon strokeWidth={2.5} className={`w-7 h-7 ${isActive ? 'text-brand-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                </div>
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

    </>
  );
}
