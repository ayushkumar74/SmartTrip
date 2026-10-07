import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, labelClassName = '', error, className = '', children, variant = 'default', ...props }, ref) => {
 return (
 <div className="w-full">
 {label && variant === 'default' && (
 <label className={`block text-sm font-medium mb-1 ${labelClassName || 'text-primary'}`}>
 {label}
 </label>
 )}
 {variant === 'travel' && label && (
 <label className={`block text-xs font-bold uppercase tracking-wider mb-1 px-1 ${labelClassName || 'text-muted'}`}>
 {label}
 </label>
 )}
 <div className="relative">
 <select
 ref={ref}
 className={
 variant === 'travel'
 ? `appearance-none block w-full px-1 py-1 pr-10 bg-transparent text-primary font-bold text-base md:text-lg focus:outline-none transition-colors truncate [&>option]:text-primary [&>option]:bg-elevated ${className}`
 : `appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm transition-colors sm:text-sm
 bg-surface-input text-primary border-theme-border placeholder:text-muted 
 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
 disabled:bg-page disabled:text-muted disabled:border-theme-border disabled:cursor-not-allowed
 [&>option]:text-primary [&>option]:bg-elevated
 ${
 error ? 'border-danger text-danger focus:ring-danger focus:border-danger' : ''
 } ${className}`
 }
 {...props}
 >
 {children}
 </select>
 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted">
 <ChevronDown className="h-4 w-4" aria-hidden="true" />
 </div>
 </div>
 {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
 </div>
 );
});

Select.displayName = 'Select';
export default Select;
