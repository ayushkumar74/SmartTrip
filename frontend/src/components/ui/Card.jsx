import React from 'react';

export function Card({ children, className = '', noPadding = false, overflowVisible = false }) {
  return (
    <div className={`bg-surface rounded-xl border border-theme-border shadow-sm ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'} ${className}`}>
      {!noPadding && <div className="p-6">{children}</div>}
      {noPadding && children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '', children }) {
  if (children) {
    return <div className={`px-6 py-4 border-b border-theme-border ${className}`}>{children}</div>;
  }
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-primary ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
 return (
 <div className={`p-6 ${className}`}>
 {children}
 </div>
 );
}
