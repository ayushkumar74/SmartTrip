import React from 'react';
import { Plane, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
 const { t } = useSettings();

  return (
    <footer className="bg-elevated border-t border-theme-border pt-6 pb-4 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 mb-6">
          
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col gap-2">
            <Link to="/dashboard" className="flex items-center gap-1.5 group inline-flex mb-1">
              <div className="bg-accent p-1 rounded group-hover:bg-accent/90 transition-colors shadow-sm">
                <Plane className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-primary font-heading">
                Smart<span className="text-accent">Trip</span>
              </span>
            </Link>
            <p className="text-secondary text-[11px] leading-snug max-w-[180px] font-medium">
              Discover incredible destinations, plan your itinerary, and book your next adventure seamlessly.
            </p>
          </div>

          <div>
            <h4 className="font-black text-primary text-[11px] uppercase tracking-wider mb-2">Company</h4>
            <ul className="space-y-1">
              <li><Link to="/about" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Careers</Link></li>
              <li><Link to="/press" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Press</Link></li>
              <li><Link to="/investors" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Investor Relations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-primary text-[11px] uppercase tracking-wider mb-2">Travel</h4>
            <ul className="space-y-1">
              <li><Link to="/flights" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">{t('nav.flights') || 'Flights'}</Link></li>
              <li><Link to="/hotels" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">{t('nav.hotels') || 'Hotels'}</Link></li>
              <li><Link to="/packages" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Holiday Packages</Link></li>
              <li><Link to="/explore" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">{t('nav.explore') || 'Explore'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-primary text-[11px] uppercase tracking-wider mb-2">Support</h4>
            <ul className="space-y-1">
              <li><Link to="/my-trips" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Manage Bookings</Link></li>
              <li><Link to="/support" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Help Center</Link></li>
              <li><Link to="/support/cancellations" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-primary text-[11px] uppercase tracking-wider mb-2">Contact</h4>
            <ul className="space-y-1.5">
              <li><Link to="/privacy" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-secondary hover:text-accent text-[11px] font-bold transition-colors">Terms of Service</Link></li>
              <li className="flex items-center gap-1.5 text-secondary text-[11px] font-bold pt-0.5">
                <Phone className="h-3 w-3 shrink-0 text-muted" />
                <span>+91 1800-SMART</span>
              </li>
              <li className="flex items-center gap-1.5 text-secondary text-[11px] font-bold">
                <Mail className="h-3 w-3 shrink-0 text-muted" />
                <span>support@smarttrip.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-theme-border pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-muted text-[10px] font-bold uppercase tracking-wider">
            &copy; {new Date().getFullYear()} SmartTrip. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-muted text-[10px] font-bold uppercase tracking-wider">Made with ❤️ for Travelers</span>
          </div>
        </div>
      </div>
    </footer>
 );
}
