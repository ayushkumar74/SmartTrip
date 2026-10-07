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
  const variants = {
    primary:
      'bg-accent text-white hover:bg-accent-hover focus:ring-accent',

    auth:
      'bg-white text-slate-900 border border-slate-200 hover:border-brand-600 hover:text-white focus:ring-brand-500 hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(37,99,235,.20)]',

    secondary:
      'bg-elevated text-primary border border-subtle hover:bg-elevated/80 focus:ring-subtle',

    outline:
      'border border-strong bg-transparent text-primary hover:bg-elevated focus:ring-accent',

    ghost:
      'bg-transparent text-secondary hover:text-primary hover:bg-elevated focus:ring-subtle',

    danger:
      'bg-danger text-white hover:bg-danger/90 focus:ring-danger',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthStyle = fullWidth
    ? 'w-full'
    : '';

  const isPrimary = variant === 'primary';
  const isAuth = variant === 'auth';

  const baseStyles =
    'group relative isolate inline-flex items-center justify-center overflow-hidden rounded-xl font-semibold transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';

  return (
    <button
      className={`${baseStyles} ${
        variants[variant] ?? variants.primary
      } ${sizes[size]} ${widthStyle} ${
        isPrimary
          ? 'shadow-[0_8px_20px_rgba(37,99,235,.16)] hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(37,99,235,.30)] active:translate-y-0 active:shadow-[0_7px_16px_rgba(37,99,235,.20)]'
          : ''
      } ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Animated blue gradient */}
      {isPrimary && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(110deg,#2563eb_0%,#3b82f6_35%,#60a5fa_50%,#2563eb_70%,#1d4ed8_100%)] bg-[length:220%_100%] opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-safe:group-hover:animate-[buttonGradient_1.45s_linear_infinite]"
        />
      )}

      {/* Auth bottom-to-top blue fill with shine */}
      {isAuth && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-brand-600 translate-y-[100%] transition-transform duration-[350ms] ease-out group-hover:translate-y-0"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 -inset-x-full h-full z-0 bg-gradient-to-l from-transparent via-white/30 to-transparent hidden group-hover:block motion-safe:group-hover:animate-[buttonAuthShine_1.1s_ease-in-out_infinite]"
          />
        </>
      )}

      {/* Loading */}
      {isLoading && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />

          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      <span className="relative z-10">
        {children}
      </span>

      <style>{`
        @keyframes buttonGradient {
          from {
            background-position: 0% 50%;
          }

          to {
            background-position: 220% 50%;
          }
        }

        @keyframes buttonAuthShine {
          0% {
            transform: translateX(100%) skewX(-20deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100%) skewX(-20deg);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none !important;
          }
        }
      `}</style>
    </button>
  );
}