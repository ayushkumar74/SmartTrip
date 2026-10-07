import React from 'react';

export default function Badge({ children, variant = 'gray', className = '' }) {
 const variants = {
 gray: 'bg-elevated text-secondary border border-theme-border',
 blue: 'bg-blue-100 text-blue-800',
 green: 'bg-green-100 text-green-800',
 yellow: 'bg-yellow-100 text-yellow-800',
 red: 'bg-red-100 text-red-800',
 purple: 'bg-purple-100 text-purple-800',
 };

 return (
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
 {children}
 </span>
 );
}
