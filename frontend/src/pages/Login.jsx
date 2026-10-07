import React, {
  useEffect,
  useRef,
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
  Check,
  LoaderCircle,
} from 'lucide-react';

export default function Login() {
  const {
    login,
    loginWithGoogle,
    loginWithOtp,
  } = useAuth();

  const navigate = useNavigate();

  const [mode, setMode] = useState('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otpIdentifier, setOtpIdentifier] =
    useState('');

  const [otpValues, setOtpValues] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [error, setError] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [countdown, setCountdown] =
    useState(0);

  const [otpVisualState, setOtpVisualState] =
    useState('idle');

  const successTimerRef = useRef(null);

  /*
   * Countdown timer
   */
  useEffect(() => {
    let interval;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown]);

  /*
   * Cleanup success navigation timer
   */
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(
          successTimerRef.current
        );
      }
    };
  }, []);

  /*
   * Common API error parser
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
   * Normal password login
   */
  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      setError(null);

      await login({
        email,
        password,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Login failed'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Google login
   */
  const handleGoogleSuccess = async (
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
          'Google Login failed'
        )
      );
    }
  };

  /*
   * Request OTP
   */
  const handleOtpRequest = async (e) => {
    if (e) {
      e.preventDefault();
    }

    setLoading(true);
    setOtpVisualState('idle');

    try {
      setError(null);

      await authService.requestOtp(
        otpIdentifier
      );

      setMode('otp_verify');

      setCountdown(60);

      setOtpValues([
        '',
        '',
        '',
        '',
        '',
        '',
      ]);

      requestAnimationFrame(() => {
        setTimeout(() => {
          document
            .getElementById('otp-0')
            ?.focus();
        }, 40);
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Failed to request OTP'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Verify OTP
   */
  const handleOtpVerify = async (e) => {
    e.preventDefault();

    const otp = otpValues.join('');

    if (otp.length !== 6) {
      setError(
        'Please enter a valid 6-digit code'
      );

      setOtpVisualState('error');

      window.setTimeout(() => {
        setOtpVisualState('idle');
      }, 550);

      return;
    }

    setLoading(true);
    setError(null);
    setOtpVisualState('verifying');

    try {
      await loginWithOtp(
        otpIdentifier,
        otp
      );

      setOtpVisualState('success');

      successTimerRef.current =
        window.setTimeout(() => {
          navigate('/dashboard');
        }, 420);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Invalid OTP'
        )
      );

      setOtpValues([
        '',
        '',
        '',
        '',
        '',
        '',
      ]);

      setOtpVisualState('error');

      window.setTimeout(() => {
        document
          .getElementById('otp-0')
          ?.focus();

        setOtpVisualState('idle');
      }, 560);
    } finally {
      setLoading(false);
    }
  };

  /*
   * OTP digit change
   */
  const handleOtpChange = (
    index,
    value
  ) => {
    if (
      otpVisualState === 'verifying' ||
      otpVisualState === 'success'
    ) {
      return;
    }

    if (
      value &&
      !/^\d+$/.test(value)
    ) {
      return;
    }

    const newOtp = [
      ...otpValues,
    ];

    newOtp[index] = value.slice(-1);

    setOtpValues(newOtp);

    if (error) {
      setError(null);
    }

    if (otpVisualState === 'error') {
      setOtpVisualState('idle');
    }

    if (
      value &&
      index < 5
    ) {
      document
        .getElementById(
          `otp-${index + 1}`
        )
        ?.focus();
    }
  };

  /*
   * OTP keyboard navigation
   */
  const handleOtpKeyDown = (
    index,
    e
  ) => {
    if (
      otpVisualState === 'verifying' ||
      otpVisualState === 'success'
    ) {
      return;
    }

    if (
      e.key === 'Backspace' &&
      !otpValues[index] &&
      index > 0
    ) {
      document
        .getElementById(
          `otp-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === 'ArrowLeft' &&
      index > 0
    ) {
      e.preventDefault();

      document
        .getElementById(
          `otp-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === 'ArrowRight' &&
      index < 5
    ) {
      e.preventDefault();

      document
        .getElementById(
          `otp-${index + 1}`
        )
        ?.focus();
    }
  };

  /*
   * OTP paste
   */
  const handleOtpPaste = (e) => {
    if (
      otpVisualState === 'verifying' ||
      otpVisualState === 'success'
    ) {
      return;
    }

    e.preventDefault();

    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pastedData) {
      return;
    }

    const newOtp = [
      '',
      '',
      '',
      '',
      '',
      '',
    ];

    for (
      let i = 0;
      i < pastedData.length;
      i += 1
    ) {
      newOtp[i] =
        pastedData[i];
    }

    setOtpValues(newOtp);
    setError(null);
    setOtpVisualState('idle');

    const nextIndex = Math.min(
      pastedData.length,
      5
    );

    document
      .getElementById(
        `otp-${nextIndex}`
      )
      ?.focus();
  };

  /*
   * Switch auth mode
   */
  const switchMode = (
    nextMode
  ) => {
    setMode(nextMode);
    setError(null);
    setOtpVisualState('idle');
  };

  const isOtpVerifying =
    otpVisualState === 'verifying';

  const isOtpSuccess =
    otpVisualState === 'success';

  const isOtpError =
    otpVisualState === 'error';

  return (
    <AuthLayout>

      <style>{`
        @keyframes otpShake {
          0%, 100% {
            transform: translateX(0);
          }

          20% {
            transform: translateX(-6px);
          }

          40% {
            transform: translateX(5px);
          }

          60% {
            transform: translateX(-4px);
          }

          80% {
            transform: translateX(3px);
          }
        }

        @keyframes otpOrbitOne {
          0% {
            transform: translate3d(0,0,0) scale(1);
            opacity: 1;
          }

          50% {
            transform: translate3d(-10px,-7px,0) scale(.94);
            opacity: .8;
          }

          100% {
            transform: translate3d(0,0,0) scale(1);
            opacity: 1;
          }
        }

        @keyframes otpOrbitTwo {
          0% {
            transform: translate3d(0,0,0) scale(1);
            opacity: 1;
          }

          50% {
            transform: translate3d(10px,-7px,0) scale(.94);
            opacity: .8;
          }

          100% {
            transform: translate3d(0,0,0) scale(1);
            opacity: 1;
          }
        }

        @keyframes verifyRing {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes verifyPulse {
          0% {
            transform: scale(.78);
            opacity: .65;
          }

          70%, 100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }

        @keyframes successRing {
          0% {
            transform: scale(.7);
            opacity: 0;
          }

          45% {
            transform: scale(1);
            opacity: 1;
          }

          100% {
            transform: scale(1.18);
            opacity: 0;
          }
        }

        @keyframes successCheck {
          from {
            stroke-dashoffset: 42;
          }

          to {
            stroke-dashoffset: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .smarttrip-animated {
            animation: none !important;
          }
        }
      `}</style>

      <div className="text-center">

        {/* Heading */}
        <div className="mb-3">
          <h1 className="text-[25px] font-black tracking-tight text-slate-900">
            {mode === 'otp_verify'
              ? 'Verify your email'
              : 'Welcome back'}
          </h1>

          <p className="mt-1 text-[13px] font-medium leading-5 text-slate-500">
            {mode === 'otp_verify'
              ? 'Enter the 6-digit code we sent you.'
              : 'Continue your journey with SmartTrip.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className={`mb-4 flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-left text-xs text-red-700 ${
              mode === 'otp_verify' &&
              isOtpError
                ? 'smarttrip-animated'
                : ''
            }`}
            style={
              mode === 'otp_verify' &&
              isOtpError
                ? {
                    animation:
                      'otpShake 520ms cubic-bezier(.36,.07,.19,.97)',
                  }
                : undefined
            }
          >
            <AlertCircle className="h-4 w-4 shrink-0" />

            <span className="font-semibold">
              {error}
            </span>
          </div>
        )}

        {/* PASSWORD LOGIN */}
        {mode === 'password' && (
          <form
            onSubmit={
              handlePasswordLogin
            }
            className="space-y-3 text-left"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
              >
                Email Address
              </label>

              <Input
                id="email"
                name="email"
                type="email"
                required
                variant="auth"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 ml-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={(e) =>
                    e.preventDefault()
                  }
                  className="text-[11px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
                >
                  Forgot?
                </button>
              </div>

              <PasswordInput
                id="password"
                name="password"
                required
                variant="auth"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit */}
            <div className="pt-1">
              <Button
                fullWidth
                type="submit"
                isLoading={loading}
                size="md"
                variant="auth"
              >
                Sign In
              </Button>
            </div>
          </form>
        )}

        {/* OTP REQUEST */}
        {mode === 'otp_request' && (
          <form
            onSubmit={
              handleOtpRequest
            }
            className="space-y-3 text-left"
          >
            <div>
              <label
                htmlFor="otp-identifier"
                className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
              >
                Email Address
              </label>

              <Input
                id="otp-identifier"
                name="otpIdentifier"
                type="email"
                required
                variant="auth"
                value={otpIdentifier}
                onChange={(e) =>
                  setOtpIdentifier(
                    e.target.value
                  )
                }
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="pt-1">
              <Button
                fullWidth
                type="submit"
                isLoading={loading}
                size="md"
                variant="auth"
              >
                Send One-Time Password
              </Button>
            </div>
          </form>
        )}

        {/* OTP VERIFY */}
        {mode === 'otp_verify' && (
          <form
            onSubmit={
              handleOtpVerify
            }
            onPaste={handleOtpPaste}
            className="text-left"
          >
            <div className="mb-4 text-center text-xs font-medium text-slate-500">
              Code sent to{' '}

              <span className="font-bold text-brand-600">
                {otpIdentifier}
              </span>
            </div>

            {/* OTP BOXES */}
            <div
              className={`relative mx-auto mb-5 flex max-w-[310px] justify-center gap-1.5 sm:gap-2 ${
                isOtpError
                  ? 'smarttrip-animated'
                  : ''
              }`}
              style={
                isOtpError
                  ? {
                      animation:
                        'otpShake 520ms cubic-bezier(.36,.07,.19,.97)',
                    }
                  : undefined
              }
            >
              {otpValues.map(
                (
                  value,
                  index
                ) => {
                  const filled =
                    Boolean(value);

                  return (
                    <div
                      key={index}
                      className={`relative h-12 w-10 sm:h-13 sm:w-11 ${
                        isOtpVerifying
                          ? 'smarttrip-animated'
                          : ''
                      }`}
                      style={
                        isOtpVerifying
                          ? {
                              animation:
                                `${index % 2 === 0 ? 'otpOrbitOne' : 'otpOrbitTwo'} 900ms ease-in-out infinite`,
                              animationDelay:
                                `${index * 55}ms`,
                            }
                          : undefined
                      }
                    >
                      <input
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={value}
                        onChange={(e) =>
                          handleOtpChange(
                            index,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) =>
                          handleOtpKeyDown(
                            index,
                            e
                          )
                        }
                        disabled={
                          isOtpVerifying ||
                          isOtpSuccess
                        }
                        aria-label={`OTP digit ${
                          index + 1
                        }`}
                        autoComplete={
                          index === 0
                            ? 'one-time-code'
                            : 'off'
                        }
                        className={`h-full w-full rounded-[11px] border bg-slate-50 text-center text-lg font-black text-slate-900 outline-none transition-[background-color,border-color,box-shadow,transform] duration-200 ${
                          isOtpError
                            ? 'border-red-400 bg-red-50 text-red-700 shadow-[0_0_0_3px_rgba(239,68,68,.10),0_0_14px_rgba(239,68,68,.16)]'
                            : isOtpSuccess
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : filled
                                ? 'border-brand-500 bg-brand-50/70 text-brand-700 shadow-[0_4px_14px_rgba(37,99,235,.12)]'
                                : 'border-slate-200 shadow-[inset_0_1px_2px_rgba(15,23,42,.03)] focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,.10),0_0_16px_rgba(37,99,235,.14)]'
                        }`}
                      />
                    </div>
                  );
                }
              )}
            </div>

            {/* Verifying */}
            {isOtpVerifying && (
              <div className="mb-5 flex flex-col items-center justify-center">
                <div className="relative flex h-16 w-16 items-center justify-center">

                  <span
                    className="absolute inset-0 rounded-full border-2 border-brand-200"
                    style={{
                      animation:
                        'verifyPulse 1.35s ease-out infinite',
                    }}
                  />

                  <span
                    className="absolute inset-1 rounded-full border-[3px] border-transparent border-t-brand-600 border-r-brand-400"
                    style={{
                      animation:
                        'verifyRing 1.05s linear infinite',
                    }}
                  />

                  <LoaderCircle className="relative z-10 h-5 w-5 animate-spin text-brand-600" />
                </div>

                <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Verifying
                </span>
              </div>
            )}

            {/* Success */}
            {isOtpSuccess && (
              <div className="mb-5 flex flex-col items-center justify-center">
                <div className="relative flex h-16 w-16 items-center justify-center">

                  <span
                    className="absolute inset-0 rounded-full border border-emerald-300"
                    style={{
                      animation:
                        'successRing 650ms ease-out both',
                    }}
                  />

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-[0_8px_24px_rgba(16,185,129,.18)]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12.5 9.2 17 19 7"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength="42"
                        strokeDasharray="42"
                        strokeDashoffset="42"
                        style={{
                          animation:
                            'successCheck 380ms 90ms ease-out forwards',
                        }}
                      />
                    </svg>
                  </div>
                </div>

                <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-600">
                  Verified
                </span>
              </div>
            )}

            {/* Verify button */}
            {!isOtpVerifying &&
              !isOtpSuccess && (
                <Button
                  fullWidth
                  type="submit"
                  isLoading={loading}
                  size="md"
                >
                  Verify & Sign In
                </Button>
              )}

            {/* Resend */}
            <div className="mt-4 text-center text-xs">
              {countdown > 0 ? (
                <span className="font-medium text-slate-400">
                  Resend code in 00:
                  {countdown
                    .toString()
                    .padStart(
                      2,
                      '0'
                    )}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleOtpRequest
                  }
                  disabled={loading}
                  className="font-bold text-brand-600 transition-colors hover:text-brand-700 disabled:opacity-50"
                >
                  Resend code
                </button>
              )}

              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      'otp_request'
                    )
                  }
                  className="font-medium text-slate-400 transition-colors hover:text-slate-600"
                >
                  Change email address
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Social login */}
        {mode !== 'otp_verify' && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Or continue with
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex flex-col gap-2.5">

              {/* Google */}
              <div className="flex min-h-11 w-full justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,.03)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_18px_rgba(15,23,42,.07)]">
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
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              {/* OTP / Password switch */}
              {mode === 'password' ? (
                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      'otp_request'
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,.03)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_7px_18px_rgba(15,23,42,.07)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/10"
                >
                  Use One-Time Password
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      'password'
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,.03)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_7px_18px_rgba(15,23,42,.07)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/10"
                >
                  Use Password Instead
                </button>
              )}
            </div>
          </>
        )}

        {/* Register link */}
        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}

            <Link
              to="/register"
              className="font-bold text-brand-600 transition-colors hover:text-brand-700"
            >
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </AuthLayout>
  );
}