import React from 'react';
import { Plane, Mail, Phone, Share2, Camera, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 group mb-3">
              <div className="bg-brand-600 p-1 rounded-md group-hover:bg-brand-700 transition-colors">
                <Plane className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-black tracking-tight text-gray-900">
                Smart<span className="text-brand-600">Trip</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">
              Plan, book and explore the world with confidence.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-brand-600 transition-colors" aria-label="Twitter">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-600 transition-colors" aria-label="Instagram">
                <Camera className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-600 transition-colors" aria-label="LinkedIn">
                <Link2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Travel */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Travel</h4>
            <ul className="space-y-2">
              {[
                { to: '/flights', label: 'Flights' },
                { to: '/hotels', label: 'Hotels' },
                { to: '/packages', label: 'Holiday Packages' },
                { to: '/explore', label: 'Explore' },
                { to: '/plan', label: 'Plan a Trip' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/careers', label: 'Careers' },
                { to: '/press', label: 'Press' },
                { to: '/investor-relations', label: 'Investors' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Support</h4>
            <ul className="space-y-2">
              {[
                { to: '/help-center', label: 'Help Center' },
                { to: '/manage-bookings', label: 'Manage Bookings' },
                { to: '/cancellation-policy', label: 'Cancellations' },
                { to: '/my-trips', label: 'My Trips' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href="tel:+911800SMART" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium">
                  <Phone className="w-3 h-3 shrink-0" /> +91 1800-SMART
                </a>
              </li>
              <li>
                <a href="mailto:support@smarttrip.com" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium">
                  <Mail className="w-3 h-3 shrink-0" /> support@smarttrip.com
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} SmartTrip. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-400">
            Made with ❤️ for travelers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
