import React from 'react';

export default function Button({ 
 children, 
 variant = 'primary', 
 size = 'md', 
 className = '', 
 fullWidth = false,
 isLoading = false,
 ...props 
}) {
 const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
 
  const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
  secondary: 'bg-surface-elevated text-text-primary border border-border hover:bg-surface-elevated/80 focus:ring-border-strong',
  outline: 'border border-border-strong bg-transparent text-text-primary hover:bg-surface-elevated focus:ring-primary',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated focus:ring-border-strong',
  };
 
 const sizes = {
 sm: 'px-3 py-1.5 text-sm',
 md: 'px-4 py-2 text-sm',
 lg: 'px-6 py-3 text-base',
 };

 const widthStyle = fullWidth ? 'w-full' : '';

 return (
 <button 
 className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
 disabled={isLoading || props.disabled}
 {...props}
 >
 {isLoading ? (
 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 ) : null}
 {children}
 </button>
 );
}
