import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { flightService } from '../services/flight.service';
import { bookingService } from '../services/booking.service';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function BookingReview() {
  const { t, formatMoney } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passenger = location.state?.passenger;
  const selectedFare = location.state?.selectedFare;

  const addOns = location.state?.addOns || {
    seat: '',
    extraBaggageKg: 0,
    meal: 'NONE',
    addOnsTotal: 0,
  };

  const mealLabels = {
    NONE: 'No meal',
    VEG_SANDWICH: 'Veg Sandwich',
    VEG_BIRYANI: 'Veg Biryani',
    VEG_MEAL: 'Veg Meal',
    CHICKEN_MEAL: 'Chicken Meal',
    NON_VEG_SANDWICH: 'Non-Veg Sandwich',
    JAIN_MEAL: 'Jain Meal',
    GLUTEN_FREE: 'Gluten-Free',
    WATER: 'Water',
    TEA_COFFEE: 'Tea/Coffee',
  };

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [agreed, setAgreed] = useState(false);

  /*
   * Prevent duplicate booking/payment requests while
   * the current operation is running.
   */
  const isSubmitting = useRef(false);

  /*
   * Keep the created booking ID in case payment fails.
   *
   * This prevents creating multiple bookings if the user
   * retries payment after a failed/cancelled checkout.
   */
  const pendingBookingId = useRef(null);

  const isInternational = Boolean(
    flight?.departureCountryCode &&
      flight?.arrivalCountryCode &&
      flight.departureCountryCode !== flight.arrivalCountryCode
  );

  useEffect(() => {
    if (!passenger) {
      navigate(`/flights/${id}/passenger`);
      return;
    }

    const fetchFlight = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await flightService.getFlightDetails(id);

        if (!data?.data?.flight) {
          throw new Error('Flight details not found');
        }

        setFlight(data.data.flight);
      } catch (err) {
        console.error('[Booking Review] Flight details error:', err);

        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load flight details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [id, passenger, navigate]);

  const handleConfirmBooking = async () => {
    if (isSubmitting.current) return;

    if (!agreed) {
      setBookingError(
        'You must agree to the terms and conditions.'
      );
      return;
    }

    isSubmitting.current = true;
    setBookingLoading(true);
    setBookingError('');

    try {
      /*
       * -------------------------------------------------------
       * STEP 1 — CREATE BOOKING
       * -------------------------------------------------------
       *
       * Only create a booking if we do not already have a
       * pending booking from a previous payment attempt.
       */
      let bookingId = pendingBookingId.current;

      if (!bookingId) {
        const payload = {
          flightId: id,
          fareId: selectedFare?.id || 'saver',

          /*
           * Backend expects an array of passengers.
           */
          passengerData: [passenger],

          /*
           * Frontend sends selections only.
           *
           * Backend recalculates the authoritative amount.
           */
          addOns: {
            seat: addOns.seat || '',
            extraBaggageKg: Number(
              addOns.extraBaggageKg || 0
            ),
            meal: addOns.meal || 'NONE',
          },
        };

        const response =
          await bookingService.createBooking(payload);

        bookingId = response?.data?.booking?.id;

        if (!bookingId) {
          throw new Error(
            'Booking was created but no booking ID was returned.'
          );
        }

        /*
         * Remember this booking so payment retry uses
         * the same booking instead of creating another one.
         */
        pendingBookingId.current = bookingId;
      }

      /*
       * -------------------------------------------------------
       * STEP 2 — PAYMENT
       * -------------------------------------------------------
       *
       * bookingService.payBooking() handles:
       *
       * MOCK:
       * initiate → dev verification
       *
       * RAZORPAY:
       * initiate → checkout → verify
       */
      await bookingService.payBooking(bookingId);

      /*
       * -------------------------------------------------------
       * STEP 3 — FETCH AUTHORITATIVE BOOKING
       * -------------------------------------------------------
       *
       * Do not trust the frontend state after payment.
       * Fetch the booking again from the backend.
       */
      const confirmed =
        await bookingService.getBookingDetails(
          bookingId
        );

      const confirmedBooking =
        confirmed?.data?.booking;

      if (!confirmedBooking) {
        throw new Error(
          'Payment completed but booking confirmation could not be loaded.'
        );
      }

      /*
       * Payment should move the booking to CONFIRMED.
       */
      if (
        confirmedBooking.status &&
        confirmedBooking.status !== 'CONFIRMED'
      ) {
        throw new Error(
          `Payment was processed but booking status is ${confirmedBooking.status}. Please check My Trips before retrying.`
        );
      }

      /*
       * Payment + booking succeeded.
       * Clear pending booking reference.
       */
      pendingBookingId.current = null;

      /*
       * Redirect using the backend-confirmed booking ID.
       */
      navigate(
        `/my-trips/${confirmedBooking.id}`,
        {
          state: {
            newBooking: true,
          },
        }
      );
    } catch (err) {
      console.error(
        '[Confirm Flight Booking Error]:',
        err
      );

      /*
       * Keep the existing pending booking ID so that
       * retrying payment does not create another booking.
       */
      setBookingError(
        err.response?.data?.message ||
          err.message ||
          'Failed to complete booking. Please try again.'
      );
    } finally {
      isSubmitting.current = false;
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="text-center py-12 text-red-600">
        {error || 'Flight details are unavailable.'}
      </div>
    );
  }

  const baseFare =
    Number(selectedFare?.price ?? flight.price ?? 0);

  const taxes = 45;

  const addOnsTotal =
    Number(addOns.addOnsTotal || 0);

  /*
   * This total is for display only.
   *
   * The backend independently calculates the actual
   * booking amount before creating the Payment record.
   */
  const displayedTotal =
    baseFare +
    taxes +
    addOnsTotal;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">

      {/* PAGE HEADER */}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">

        <div>

          <h1 className="text-2xl font-bold font-heading text-primary">
            {t('booking.review.title')}
          </h1>

          <p className="text-muted text-sm mt-1">
            Please review your itinerary and passenger details before confirming.
          </p>

        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate(
              `/flights/${id}/passenger`,
              {
                state: {
                  passenger,
                  flight,
                  addOns,
                  selectedFare,
                },
              }
            )
          }
        >
          Back to Passenger Details
        </Button>

      </div>

      {/* BOOKING ERROR */}

      {bookingError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3 shadow-sm">

          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />

          <div className="font-medium text-sm leading-relaxed">
            {bookingError}

            {pendingBookingId.current && (
              <p className="mt-1 text-xs text-red-600">
                Your booking is still saved as pending.
                You can retry the payment without creating
                another booking.
              </p>
            )}
          </div>

        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* =====================================================
            LEFT CONTENT
        ====================================================== */}

        <div className="lg:col-span-2 space-y-6">

          {/* SELECTED FLIGHT */}

          <Card className="shadow-sm border-theme-border">

            <CardHeader
              title="Selected Flight"
              className="mb-4 pb-4 border-b border-theme-border"
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

              <div className="flex items-start gap-4">

                {flight.airlineLogoUrl ? (
                  <img
                    src={flight.airlineLogoUrl}
                    alt={flight.airline}
                    className="h-10 w-10 object-contain bg-white rounded p-1 border border-slate-100"
                  />
                ) : (
                  <span className="h-10 w-10 rounded bg-brand-50 text-brand-700 flex items-center justify-center text-sm font-black border border-brand-100">
                    {flight.airlineCode ||
                      flight.airline
                        ?.slice(0, 2)
                        .toUpperCase()}
                  </span>
                )}

                <div>

                  <p className="font-bold text-primary text-base">
                    {flight.airline}
                  </p>

                  <p className="text-sm font-medium text-secondary">
                    {flight.flightNumber}
                  </p>

                </div>

              </div>

              <div className="text-left sm:text-right">

                <p className="font-bold text-primary">
                  {new Date(
                    flight.departureTime
                  ).toLocaleDateString(
                    'en-GB',
                    {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }
                  )}
                </p>

                <p className="text-sm font-medium text-secondary">
                  {String(
                    flight.cabinClass || ''
                  ).replace('_', ' ')}
                </p>

              </div>

            </div>

            <div className="mt-6 flex items-center justify-between bg-surface rounded-lg p-4 border border-slate-100 dark:border-slate-800">

              <div className="flex-1">

                <p className="text-2xl font-black text-primary">
                  {new Date(
                    flight.departureTime
                  ).toLocaleTimeString(
                    'en-GB',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>

                <p className="font-bold text-primary mt-1">
                  {flight.departureAirport}
                </p>

                <p className="text-sm text-secondary">
                  {flight.departureCity}
                </p>

              </div>

              <div className="flex-[2] px-4 flex flex-col items-center">

                <p className="text-xs font-semibold text-muted mb-2">
                  {flight.duration ||
                    'Duration unavailable'}
                </p>

                <div className="w-full relative flex items-center justify-center">

                  <div className="h-[2px] bg-slate-200 dark:bg-slate-700 w-full absolute rounded-full" />

                  <div className="relative bg-surface px-2 text-brand-500">

                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.8 19.2 16 11l-3.5 3.5C10 17 8 17 5.5 17c-.7 0-1.4-.1-2.1-.2L5 15l2.5-7.5C8 6 10 5 12 5h4l2 6 3 1.5c1.3.7 2 2 2 3.5s-.7 2.8-2 3.5l-3.2 1.2c-.3 0-.6-.1-.7-.3z" />
                    </svg>

                  </div>

                </div>

                <p className="text-xs font-bold text-brand-600 mt-2">
                  {flight.stops === 0
                    ? 'Non-stop'
                    : `${flight.stops} stop${
                        flight.stops === 1
                          ? ''
                          : 's'
                      }`}
                </p>

              </div>

              <div className="flex-1 text-right">

                <p className="text-2xl font-black text-primary">
                  {new Date(
                    flight.arrivalTime
                  ).toLocaleTimeString(
                    'en-GB',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>

                <p className="font-bold text-primary mt-1">
                  {flight.arrivalAirport}
                </p>

                <p className="text-sm text-secondary">
                  {flight.arrivalCity}
                </p>

              </div>

            </div>

          </Card>

          {/* PASSENGER DETAILS */}

          <Card className="shadow-sm border-theme-border">

            <CardHeader
              title="Passenger Details"
              className="mb-4 pb-4 border-b border-theme-border"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4 text-sm">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Full Name
                </p>

                <p className="font-bold text-primary">
                  {[
                    passenger.title,
                    passenger.firstName,
                    passenger.middleName,
                    passenger.lastName,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </p>

              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Date of Birth
                </p>

                <p className="font-bold text-primary">
                  {new Date(
                    passenger.dateOfBirth
                  ).toLocaleDateString('en-GB')}
                </p>

              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Gender
                </p>

                <p className="font-bold text-primary">
                  {passenger.gender}
                </p>

              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Nationality
                </p>

                <p className="font-bold text-primary">
                  {passenger.nationality}
                </p>

              </div>

              <div className="md:col-span-2">

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Contact
                </p>

                <p className="font-bold text-primary">

                  {passenger.email}

                  <span className="text-slate-300 mx-1">
                    |
                  </span>

                  {passenger.mobile}

                </p>

              </div>

              {isInternational &&
                passenger.passportNumber && (
                  <div className="col-span-2 md:col-span-3 pt-3 border-t border-slate-100 dark:border-slate-800">

                    <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                      Passport Number
                    </p>

                    <p className="font-bold text-primary">
                      {passenger.passportNumber}
                    </p>

                  </div>
                )}

            </div>

          </Card>

          {/* ADD-ONS */}

          <Card className="shadow-sm border-theme-border">

            <CardHeader
              title="Add-ons"
              className="mb-4 pb-4 border-b border-theme-border"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">

              <div className="flex flex-col p-3 rounded-lg bg-surface border border-slate-100 dark:border-slate-800">

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Seat
                </p>

                <p className="font-bold text-primary">

                  {addOns.seat
                    ? `${addOns.seat} · ${formatMoney(
                        addOns.seatPrice || 0,
                        flight.currency
                      )}`
                    : 'None'}

                </p>

              </div>

              <div className="flex flex-col p-3 rounded-lg bg-surface border border-slate-100 dark:border-slate-800">

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Meal
                </p>

                <p className="font-bold text-primary">

                  {mealLabels[addOns.meal] ||
                    'No meal'}

                  {addOns.meal &&
                    addOns.meal !== 'NONE' &&
                    ` · ${formatMoney(
                      addOns.mealPrice || 0,
                      flight.currency
                    )}`}

                </p>

              </div>

              <div className="flex flex-col p-3 rounded-lg bg-surface border border-slate-100 dark:border-slate-800">

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Included Baggage
                </p>

                <p className="font-bold text-primary">

                  Cabin:{' '}

                  <span className="font-medium text-secondary">
                    {addOns.includedCabin ||
                      flight.baggage ||
                      'See fare rules'}
                  </span>

                </p>

                <p className="font-bold text-primary mt-1">

                  Check-in:{' '}

                  <span className="font-medium text-secondary">
                    {addOns.includedCheckIn ||
                      'See fare rules'}
                  </span>

                </p>

              </div>

              <div className="flex flex-col p-3 rounded-lg bg-surface border border-slate-100 dark:border-slate-800">

                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Extra Baggage
                </p>

                <p className="font-bold text-primary">

                  {addOns.extraBaggageKg
                    ? `${addOns.extraBaggageKg} kg · ${formatMoney(
                        addOns.baggagePrice || 0,
                        flight.currency
                      )}`
                    : 'None'}

                </p>

              </div>

            </div>

          </Card>

        </div>

        {/* =====================================================
            RIGHT — PRICE SUMMARY
        ====================================================== */}

        <div className="lg:col-span-1">

          <Card className="sticky top-6 shadow-md border-theme-border">

            <h3 className="font-black text-xl text-primary mb-5">
              {t('booking.review.fare')}
            </h3>

            <div className="space-y-3 text-sm font-medium text-secondary mb-6">

              {/* BASE FARE */}

              <div className="flex justify-between items-center gap-4">

                <span>
                  Base Fare (1x Adult) -{' '}
                  {selectedFare?.name ||
                    'Saver'}
                </span>

                <span className="font-bold text-primary whitespace-nowrap">

                  {formatMoney(
                    baseFare,
                    flight.currency
                  )}

                </span>

              </div>

              {/* TAXES */}

              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">

                <span>
                  Taxes & Fees
                </span>

                <span className="font-bold text-primary">

                  {formatMoney(
                    taxes,
                    flight.currency
                  )}

                </span>

              </div>

              {/* SEAT */}

              <div className="flex justify-between items-center">

                <span>
                  Seat
                </span>

                <span className="font-bold text-primary">

                  {addOns.seat
                    ? formatMoney(
                        addOns.seatPrice || 0,
                        flight.currency
                      )
                    : 'None'}

                </span>

              </div>

              {/* BAGGAGE */}

              <div className="flex justify-between items-center">

                <span>
                  Extra Baggage
                </span>

                <span className="font-bold text-primary">

                  {addOns.extraBaggageKg
                    ? formatMoney(
                        addOns.baggagePrice || 0,
                        flight.currency
                      )
                    : 'None'}

                </span>

              </div>

              {/* MEAL */}

              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">

                <span>
                  Meal
                </span>

                <span className="font-bold text-primary">

                  {addOns.meal &&
                  addOns.meal !== 'NONE'
                    ? formatMoney(
                        addOns.mealPrice || 0,
                        flight.currency
                      )
                    : 'None'}

                </span>

              </div>

              {/* TOTAL */}

              <div className="flex justify-between items-center pt-4 gap-4">

                <span className="font-black text-lg text-primary">
                  Total Amount
                </span>

                <span className="text-2xl font-black text-brand-600 whitespace-nowrap">

                  {formatMoney(
                    displayedTotal,
                    flight.currency
                  )}

                </span>

              </div>

            </div>

            {/* TERMS */}

            <div className="mb-6 bg-brand-50 dark:bg-brand-900/20 p-3 rounded flex items-start gap-3 border border-brand-100 dark:border-brand-800/50">

              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setBookingError('');
                }}
              />

              <label
                htmlFor="terms"
                className="text-xs font-medium text-brand-800 dark:text-brand-300 leading-relaxed cursor-pointer"
              >
                {t('booking.review.terms')}
              </label>

            </div>

            {/* CONFIRM / RETRY */}

            <Button
              fullWidth
              size="lg"
              className="text-base font-bold shadow-sm"
              onClick={handleConfirmBooking}
              isLoading={bookingLoading}
              disabled={!agreed}
            >
              {pendingBookingId.current
                ? 'Retry Payment'
                : t('common.confirm')}
            </Button>

            {/* SECURE */}

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">

              <CheckCircle className="h-4 w-4" />

              Secure Transaction

            </div>

          </Card>

        </div>

      </div>

    </div>
  );
}