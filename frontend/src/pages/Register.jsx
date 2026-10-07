import React, {
  useState,
} from 'react';

import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

import { GoogleLogin } from '@react-oauth/google';

import {
  useNavigate,
  Link,
} from 'react-router-dom';

import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordInput from '../components/ui/PasswordInput';

import {
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';

export default function Register() {
  const {
    loginWithGoogle,
  } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: '',
      email: '',
      password: '',
      phone: '',
    });

  const [error, setError] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [passwordFocused, setPasswordFocused] =
    useState(false);

  /*
   * Password requirements
   */
  const reqLength =
    formData.password.length >= 8;

  const reqUpper =
    /[A-Z]/.test(
      formData.password
    );

  const reqLower =
    /[a-z]/.test(
      formData.password
    );

  const reqNumber =
    /[0-9]/.test(
      formData.password
    );

  const score = [
    reqLength,
    reqUpper,
    reqLower,
    reqNumber,
  ].filter(Boolean).length;

  let strengthLabel = '';
  let strengthColor =
    'bg-transparent';

  if (score === 4) {
    strengthLabel = 'Strong';
    strengthColor =
      'bg-emerald-500';
  } else if (score >= 2) {
    strengthLabel = 'Medium';
    strengthColor =
      'bg-amber-400';
  } else if (score === 1) {
    strengthLabel = 'Weak';
    strengthColor =
      'bg-rose-500';
  }

  /*
   * Common error parser
   */
  const getErrorMessage = (
    err,
    fallback
  ) => {
    return typeof err?.response?.data === 'string'
      ? err.response.data
      : err?.response?.data?.message ||
          fallback;
  };

  /*
   * Register
   */
  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (score < 4) {
      setError(
        'Please meet all password requirements'
      );
      return;
    }

    setLoading(true);

    try {
      setError(null);

      await authService.register(
        formData
      );

      navigate('/login');
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Registration failed'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Google registration
   */
  const handleGoogleSuccess =
    async (
      credentialResponse
    ) => {
      try {
        setError(null);

        await loginWithGoogle(
          credentialResponse.credential
        );

        navigate('/dashboard');
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            'Google Registration failed'
          )
        );
      }
    };

  /*
   * Password requirement component
   */
  const RequirementItem = ({
    met,
    text,
  }) => (
    <div
      className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wide transition-all duration-200 ${
        met
          ? 'text-emerald-600'
          : 'text-slate-400'
      }`}
    >
      {met ? (
        <CheckCircle2
          className="h-3.5 w-3.5"
          strokeWidth={2.5}
        />
      ) : (
        <Circle
          className="h-3.5 w-3.5"
          strokeWidth={2}
        />
      )}

      {text}
    </div>
  );

  return (
    <AuthLayout>

      <style>{`
        @keyframes strengthReveal {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .smarttrip-strength {
            animation: none !important;
          }
        }
      `}</style>

      <div className="text-center">

        {/* Heading */}
        <div className="mb-2">
          <h1 className="text-[23px] font-black tracking-tight text-slate-900">
            Create an account
          </h1>

          <p className="mt-1 text-[12px] font-medium text-slate-500">
            Start planning your next trip with SmartTrip.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-left text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />

            <span className="font-semibold">
              {error}
            </span>
          </div>
        )}

        {/* Google signup */}
        <div className="mb-3 flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,.03)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_18px_rgba(15,23,42,.07)]">
          <GoogleLogin
            onSuccess={
              handleGoogleSuccess
            }
            onError={() =>
              setError(
                'Google login failed'
              )
            }
            useOneTap={false}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        {/* Divider */}
        <div className="my-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
            Or sign up with email
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-2 text-left"
        >

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
            >
              Full Name
            </label>

            <Input
              id="name"
              name="name"
              type="text"
              required
              variant="auth"
              value={
                formData.name
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name:
                    e.target.value,
                })
              }
              autoComplete="name"
              placeholder="Your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="register-email"
              className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
            >
              Email Address
            </label>

            <Input
              id="register-email"
              name="email"
              type="email"
              required
              variant="auth"
              value={
                formData.email
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email:
                    e.target.value,
                })
              }
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
            >
              Phone Number{' '}
              <span className="normal-case text-slate-400">
                (Optional)
              </span>
            </label>

            <Input
              id="phone"
              name="phone"
              type="tel"
              variant="auth"
              value={
                formData.phone
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone:
                    e.target.value,
                })
              }
              autoComplete="tel"
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Password */}
          <div
            onFocus={() =>
              setPasswordFocused(
                true
              )
            }
            onBlur={(e) => {
              if (
                !e.currentTarget.contains(
                  e.relatedTarget
                )
              ) {
                setPasswordFocused(
                  false
                );
              }
            }}
          >
            <label
              htmlFor="register-password"
              className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
            >
              Password
            </label>

            <PasswordInput
              id="register-password"
              name="password"
              required
              variant="auth"
              value={
                formData.password
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password:
                    e.target.value,
                })
              }
              autoComplete="new-password"
              placeholder="Create a strong password"
            />

            {/* Password strength */}
            {(passwordFocused ||
              formData.password.length >
                0) && (
              <div
                className="smarttrip-strength mt-1.5"
                style={{
                  animation:
                    'strengthReveal 220ms ease-out both',
                }}
              >
                <div className="mb-1 flex items-center justify-between">

                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Password strength
                  </span>

                  <span
                    className={`text-[9px] font-black uppercase tracking-[0.14em] ${
                      strengthLabel ===
                      'Strong'
                        ? 'text-emerald-600'
                        : strengthLabel ===
                            'Medium'
                          ? 'text-amber-500'
                          : 'text-rose-500'
                    }`}
                  >
                    {strengthLabel}
                  </span>
                </div>

                {/* Strength bar */}
                <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-[width,background-color] duration-300 ease-out ${strengthColor}`}
                    style={{
                      width: `${
                        (score / 4) *
                        100
                      }%`,
                    }}
                  />
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-1">
                  <RequirementItem
                    met={reqLength}
                    text="8+ characters"
                  />

                  <RequirementItem
                    met={reqUpper}
                    text="1 uppercase"
                  />

                  <RequirementItem
                    met={reqLower}
                    text="1 lowercase"
                  />

                  <RequirementItem
                    met={reqNumber}
                    text="1 number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start pt-0.5">

            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-600/20"
            />

            <label
              htmlFor="terms"
              className="ml-2.5 text-[10px] font-medium leading-4 text-slate-500"
            >
              I agree to the{' '}

              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault()
                }
                className="font-bold text-brand-600 hover:text-brand-700"
              >
                Terms of Service
              </a>{' '}

              and{' '}

              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault()
                }
                className="font-bold text-brand-600 hover:text-brand-700"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-0.5">
            <Button
              fullWidth
              type="submit"
              isLoading={loading}
              size="md"
              variant="auth"
            >
              Create Account
            </Button>
          </div>
        </form>

        {/* Login link */}
        <div className="mt-4 border-t border-slate-100 pt-3.5 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}

            <Link
              to="/login"
              className="font-bold text-brand-600 transition-colors hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </AuthLayout>
  );
}