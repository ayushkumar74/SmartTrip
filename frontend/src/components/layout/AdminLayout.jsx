import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Plane, 
  Hotel, 
  Map,
  LogOut
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Users', path: '/admin/users', icon: Users, exact: false },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck, exact: false },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard, exact: false },
    { name: 'Flights', path: '/admin/flights', icon: Plane, exact: false },
    { name: 'Hotels', path: '/admin/hotels', icon: Hotel, exact: false },
    { name: 'Packages', path: '/admin/packages', icon: Map, exact: false },
  ];

  return (
    <div className="flex h-screen bg-page font-sans text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-theme-border flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-theme-border shrink-0">
          <span className="text-xl font-black text-primary tracking-tight">SmartTrip <span className="text-accent">Admin</span></span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
            
            if (item.disabled) {
              return (
                <div key={item.name} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-muted bg-transparent cursor-not-allowed rounded-xl opacity-60">
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-elevated px-2 py-0.5 rounded-md">Soon</span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  isActive 
                    ? 'bg-accent text-white shadow-md shadow-accent/20' 
                    : 'text-secondary hover:bg-elevated hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-theme-border shrink-0 space-y-4">
          <div className="px-4 py-2">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Logged in as</p>
            <p className="text-sm font-semibold truncate text-primary">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-surface border-b border-theme-border flex items-center justify-between px-4 shrink-0">
          <span className="text-lg font-black text-primary">SmartTrip Admin</span>
          <button onClick={handleLogout} className="text-red-600 p-2"><LogOut className="w-5 h-5" /></button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-page p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
