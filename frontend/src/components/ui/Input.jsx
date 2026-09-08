import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', variant = 'default', ...props }, ref) => {
 return (
 <div className="w-full">
 {label && variant === 'default' && (
 <label className="block text-sm font-medium text-text-primary mb-1">
 {label}
 </label>
 )}
 {variant === 'travel' && label && (
 <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 px-1">
 {label}
 </label>
 )}
 <input
 ref={ref}
 className={
 variant === 'travel'
 ? `appearance-none block w-full px-1 py-1 bg-transparent text-text-primary font-bold text-base md:text-lg placeholder:text-text-muted focus:outline-none transition-colors truncate ${className}`
 : `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm transition-colors sm:text-sm
 bg-surface-input text-text-primary border-border placeholder:text-text-muted 
 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
 disabled:bg-page disabled:text-text-muted disabled:border-border disabled:cursor-not-allowed
 ${
 error ? 'border-danger text-danger focus:ring-danger focus:border-danger ' : ''
 } ${className}`
 }
 {...props}
 />
 {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
 </div>
 );
});

Input.displayName = 'Input';
export default Input;
