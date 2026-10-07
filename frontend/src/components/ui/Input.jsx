import React, { forwardRef, useState } from 'react';

const Input = forwardRef(({ label, error, className = '', variant = 'default', ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full relative group">
      {label && (variant === 'default' || variant === 'auth') && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-brand-600">
          {label}
        </label>
      )}
      {variant === 'travel' && label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1 transition-colors group-focus-within:text-brand-600">
          {label}
        </label>
      )}
      <div className={`relative ${variant === 'auth' ? 'smarttrip-auth-electric-wrapper rounded-xl' : ''}`}>
        {variant === 'auth' && (
          <div className="smarttrip-auth-electric-clip">
            <div className="smarttrip-auth-electric-border" />
          </div>
        )}
        <input
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          className={
            variant === 'travel'
              ? `appearance-none block w-full px-1 py-1 bg-transparent text-slate-900 font-bold text-base md:text-lg placeholder:text-slate-400 focus:outline-none transition-colors truncate ${className}`
              : `appearance-none block w-full px-4 py-3 rounded-xl shadow-sm transition-all duration-200 sm:text-sm
                 bg-white text-slate-900 border placeholder:text-slate-400 relative z-10
                 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500
                 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
                 ${
                   error
                     ? 'border-red-300 text-red-900 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30'
                     : 'border-slate-200 hover:border-slate-300'
                 } ${className}`
          }
          {...props}
        />
        {/* Subtle electric glow effect on focus for default variant */}
        {variant === 'default' && (
          <div 
            className={`absolute inset-0 -z-10 rounded-xl transition-opacity duration-300 pointer-events-none ${isFocused && !error ? 'opacity-100 bg-gradient-to-r from-brand-500/20 to-brand-400/20 blur-md' : 'opacity-0'}`} 
          />
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;