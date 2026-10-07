import React from 'react';
import { ArrowLeft, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function InfoPage({
  title,
  subtitle,
  eyebrow = 'SmartTrip',
  body = [],
  cta,
  route = '/dashboard'
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-surface border border-theme-border rounded-3xl shadow-sm overflow-hidden">
          <section className="border-b border-theme-border bg-elevated px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-secondary hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
            <Link to="/dashboard" className="text-sm font-black text-accent uppercase tracking-wide">
              SmartTrip
            </Link>
          </section>

          <section className="px-8 py-10 md:px-12">
            <div className="mb-8">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-3">{eyebrow}</div>
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-3">{title}</h1>
              {subtitle && <p className="text-secondary text-lg font-medium leading-relaxed">{subtitle}</p>}
            </div>

            <div className="space-y-5 text-secondary">
              {body.map((paragraph, index) => (
                <p key={index} className="text-sm md:text-base font-medium leading-7">{paragraph}</p>
              ))}
            </div>

            {(cta || route) && (
              <div className="mt-10 flex flex-wrap items-center gap-3">
                {cta && <Link to={route} className="bg-accent hover:bg-accent-hover text-white font-black px-6 py-3 rounded-full text-sm uppercase tracking-wide transition-colors">{cta}</Link>}
                <Link to="/dashboard" className="border border-theme-border bg-surface text-primary hover:bg-elevated font-black px-6 py-3 rounded-full text-sm uppercase tracking-wide transition-colors">Explore Trips</Link>
              </div>
            )}

            <div className="mt-10 border-t border-theme-border pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm font-bold text-secondary">
                  <Phone className="w-4 h-4 text-accent" />
                  <a className="hover:text-accent" href="tel:+911800SMART">+91 1800-SMART</a>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-secondary">
                  <Mail className="w-4 h-4 text-accent" />
                  <a className="hover:text-accent" href="mailto:support@smarttrip.com">support@smarttrip.com</a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
