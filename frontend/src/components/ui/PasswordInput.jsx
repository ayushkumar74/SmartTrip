import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';

export default function PasswordInput({
  autoComplete,
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? 'text' : 'password'}
        autoComplete={autoComplete}
        className={`pr-11 ${props.className || ''}`}
      />

      <button
        type="button"
        aria-label={
          isVisible
            ? 'Hide password'
            : 'Show password'
        }
        aria-pressed={isVisible}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          setIsVisible((visible) => !visible);
        }}
        className="absolute right-1.5 top-1/2 z-20 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-[color,background-color,box-shadow] duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
      >
        {isVisible ? (
          <EyeOff
            className="h-4 w-4"
            aria-hidden="true"
          />
        ) : (
          <Eye
            className="h-4 w-4"
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}