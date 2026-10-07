import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Armchair, Briefcase, Plane, Utensils, Check } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';

const seatRows = [
  { row: 12, seats: ['12A', '12B', '12C', '12D', '12E', '12F'], exit: false },
  { row: 13, seats: ['13A', '13B', '13C', '13D', '13E', '13F'], exit: true },
  { row: 14, seats: ['14A', '14B', '14C', '14D', '14E', '14F'], exit: false },
  { row: 15, seats: ['15A', '15B', '15C', '15D', '15E', '15F'], exit: false },
];

const occupiedSeats = new Set(['12C', '13D', '15A']);

const baggageOptions = [
  [0, 'No extra baggage', 0],
  [5, '+5 kg', 600],
  [10, '+10 kg', 1000],
  [15, '+15 kg', 1400],
];

const mealOptions = [
  ['NONE', 'No meal', 0, ''],
  ['VEG_SANDWICH', 'Veg Sandwich', 180, 'Vegetarian'],
  ['VEG_BIRYANI', 'Veg Biryani', 280, 'Vegetarian'],
  ['VEG_MEAL', 'Veg Meal', 320, 'Vegetarian'],
  ['CHICKEN_MEAL', 'Chicken Meal', 420, 'Non-vegetarian'],
  ['NON_VEG_SANDWICH', 'Non-Veg Sandwich', 260, 'Non-vegetarian'],
  ['JAIN_MEAL', 'Jain Meal', 320, 'Special Diet'],
  ['GLUTEN_FREE', 'Gluten-Free', 350, 'Special Diet'],
  ['WATER', 'Water', 40, 'Beverages'],
  ['TEA_COFFEE', 'Tea/Coffee', 90, 'Beverages'],
];

const seatPriceFor = (seat) =>
  seat && seat.startsWith('13')
    ? 799
    : seat
      ? 499
      : 0;

const getSeatType = (seat) => {
  if (!seat) return '';

  const letter = seat.slice(-1);

  if (['A', 'F'].includes(letter)) return 'Window';
  if (['B', 'E'].includes(letter)) return 'Middle';
  if (['C', 'D'].includes(letter)) return 'Aisle';

  return '';
};

function OptionCard({
  selected,
  onClick,
  title,
  detail,
  price,
  currency,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left rounded-xl border p-4 transition-all duration-200 ${
        selected
          ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
          : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
          <Check
            className="w-3 h-3 text-white"
            strokeWidth={3}
          />
        </div>
      )}

      <div className="flex flex-col pr-6">
        <span
          className={`text-sm font-bold ${
            selected
              ? 'text-brand-900'
              : 'text-slate-900'
          }`}
        >
          {title}
        </span>

        <span
          className={`text-xs mt-0.5 font-medium ${
            selected
              ? 'text-brand-600'
              : 'text-slate-500'
          }`}
        >
          {price
            ? `+ ${currency(price)}`
            : 'Included'}
        </span>
      </div>

      {detail && (
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-2">
          {detail}
        </span>
      )}
    </button>
  );
}

export default function FlightAddons() {
  const { id } = useParams();
  const { formatMoney } = useSettings();
  const navigate = useNavigate();
  const { state } = useLocation();

  const passenger = state?.passenger;
  const flight = state?.flight;
  const selectedFare = state?.selectedFare;

  const [seat, setSeat] = useState('');
  const [hoverSeat, setHoverSeat] = useState('');
  const [extraBaggageKg, setExtraBaggageKg] = useState(0);
  const [meal, setMeal] = useState('NONE');
  const [activeMealTab, setActiveMealTab] =
    useState('Vegetarian');

  if (!passenger || !flight) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-red-600 font-medium">
        Please complete passenger details first.
      </div>
    );
  }

  const selectedMeal =
    mealOptions.find(([value]) => value === meal) ||
    mealOptions[0];

  const baggagePrice =
    baggageOptions.find(
      ([kg]) => kg === extraBaggageKg
    )?.[2] || 0;

  const seatPrice = seatPriceFor(seat);
  const mealPrice = selectedMeal[2];

  const addOnsTotal =
    seatPrice +
    baggagePrice +
    mealPrice;

  const includedCabin = flight.cabinBaggageKg
    ? `${flight.cabinBaggageKg} kg / ${flight.cabinBaggagePieces} piece`
    : flight.baggage || 'See fare rules';

  const includedCheckIn = flight.checkInBaggageKg
    ? `${flight.checkInBaggageKg} kg / ${flight.checkInBaggagePieces} piece`
    : 'See fare rules';

  const currency = (amount) =>
    formatMoney(amount, flight.currency);

  /*
   * Keep the existing SmartTrip review flow.
   *
   * Frontend sends the user's selections to the review page.
   * Final fare/booking amount must still be validated
   * by the backend when the booking is created.
   */
  const continueToReview = () =>
    navigate(
      `/flights/${encodeURIComponent(id)}/review`,
      {
        state: {
          passenger,
          flight,
          selectedFare,

          addOns: {
            seat,
            seatType: getSeatType(seat),

            extraBaggageKg,

            meal,
            mealName:
              selectedMeal[1] || 'No meal',

            addOnsTotal,

            includedCabin,
            includedCheckIn,

            seatPrice,
            baggagePrice,
            mealPrice,
          },
        },
      }
    );

  const mealCategories = [
    'Vegetarian',
    'Non-vegetarian',
    'Special Diet',
    'Beverages',
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Choose flight extras
        </h1>

        <p className="text-sm text-slate-500 font-medium mt-1.5">
          Personalize your journey. Additional services are subject to availability.
        </p>
      </div>

      <div className="space-y-6">

        {/* SEAT SELECTION */}

        <Card className="overflow-hidden border-slate-200 shadow-sm">

          <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center gap-3">

            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Armchair className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Seat selection
              </h2>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select your preferred seat in the cabin
              </p>
            </div>

          </div>

          <div className="p-8 bg-slate-50/50">

            <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-bold text-slate-500 mb-10 uppercase tracking-widest">

              <span className="flex items-center">
                <div className="w-4 h-4 rounded border border-brand-200 bg-white mr-2" />
                Available
              </span>

              <span className="flex items-center">
                <div className="w-4 h-4 rounded bg-brand-500 mr-2" />
                Selected
              </span>

              <span className="flex items-center">
                <div className="w-4 h-4 rounded bg-slate-200 mr-2" />
                Occupied
              </span>

              <span className="flex items-center">
                <div className="w-4 h-4 rounded border-amber-300 bg-amber-50 mr-2" />
                Exit Row
              </span>

            </div>

            <div className="relative max-w-[340px] mx-auto min-w-[300px]">

              <div className="absolute inset-0 bg-white border border-slate-200 rounded-t-[140px] rounded-b-[40px] shadow-sm pointer-events-none" />

              <div className="relative z-10 pt-10 pb-10 px-8">

                <div className="flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-10">

                  <Plane className="w-6 h-6 text-slate-200 -rotate-90 mb-1" />

                  COCKPIT

                </div>

                <div className="grid grid-cols-[1fr_1fr_1fr_32px_1fr_1fr_1fr] gap-2 mb-4 text-center text-[10px] font-black text-slate-400">

                  <div>A</div>
                  <div>B</div>
                  <div>C</div>
                  <div></div>
                  <div>D</div>
                  <div>E</div>
                  <div>F</div>

                </div>

                <div className="space-y-4 relative">

                  {seatRows.map(
                    ({ row, seats, exit }) => (

                      <div
                        key={row}
                        className="relative group"
                      >

                        {exit && (
                          <div className="absolute -left-7 top-1/2 -translate-y-1/2 text-[9px] font-black text-amber-500 uppercase -rotate-90 tracking-widest hidden sm:block">
                            Exit
                          </div>
                        )}

                        {exit && (
                          <div className="absolute -right-7 top-1/2 -translate-y-1/2 text-[9px] font-black text-amber-500 uppercase rotate-90 tracking-widest hidden sm:block">
                            Exit
                          </div>
                        )}

                        {exit && (
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-200/50 -z-10" />
                        )}

                        <div className="grid grid-cols-[1fr_1fr_1fr_32px_1fr_1fr_1fr] gap-2 items-center">

                          {seats.map(
                            (value, index) => {

                              const occupied =
                                occupiedSeats.has(value);

                              const selected =
                                seat === value;

                              let seatClasses =
                                'h-11 w-full rounded-t-lg rounded-b-sm border-2 text-[10px] font-bold flex items-center justify-center transition-all duration-200 relative group-seat focus:outline-none focus:ring-2 focus:ring-brand-500/50 ';

                              if (occupied) {
                                seatClasses +=
                                  'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed';
                              } else if (selected) {
                                seatClasses +=
                                  'bg-brand-500 text-white border-brand-500 shadow-md scale-105 z-10';
                              } else if (exit) {
                                seatClasses +=
                                  'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400 hover:bg-amber-100';
                              } else {
                                seatClasses +=
                                  'bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:bg-brand-50';
                              }

                              return (
                                <React.Fragment key={value}>

                                  {index === 3 && (
                                    <div className="text-center text-xs font-black text-slate-300 select-none">
                                      {row}
                                    </div>
                                  )}

                                  <div
                                    className="relative"
                                    onMouseEnter={() =>
                                      !occupied &&
                                      setHoverSeat(value)
                                    }
                                    onMouseLeave={() =>
                                      setHoverSeat('')
                                    }
                                  >

                                    <button
                                      type="button"
                                      disabled={occupied}
                                      onClick={() =>
                                        setSeat(value)
                                      }
                                      aria-label={`${value} ${
                                        exit
                                          ? 'exit row'
                                          : ''
                                      }`}
                                      className={seatClasses}
                                    >

                                      {selected && (
                                        <Check
                                          className="w-4 h-4 text-white"
                                          strokeWidth={3}
                                        />
                                      )}

                                    </button>

                                    {!occupied &&
                                      hoverSeat === value &&
                                      !selected && (

                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">

                                          <div className="font-bold mb-0.5">
                                            Seat {value}
                                          </div>

                                          <div className="text-[10px] font-medium text-slate-300 mb-1.5">
                                            {getSeatType(value)}
                                          </div>

                                          <div className="text-brand-300 font-bold">
                                            {currency(
                                              seatPriceFor(value)
                                            )}
                                          </div>

                                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />

                                        </div>

                                      )}

                                  </div>

                                </React.Fragment>
                              );
                            }
                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

            <div className="mt-10 mx-auto max-w-sm bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all duration-300">

              <div className="flex flex-col">

                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  Selected Seat
                </span>

                {seat ? (
                  <div className="flex items-center gap-2">

                    <span className="text-lg font-black text-slate-900">
                      {seat}
                    </span>

                    <span className="w-1 h-1 rounded-full bg-slate-300" />

                    <span className="text-sm font-medium text-slate-600">
                      {getSeatType(seat)}
                    </span>

                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-500">
                    None selected
                  </span>
                )}

              </div>

              <div className="text-right">

                <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  Price
                </span>

                <span className="text-lg font-black text-brand-600">
                  {seat
                    ? currency(seatPrice)
                    : '—'}
                </span>

              </div>

            </div>

          </div>

        </Card>

        {/* BAGGAGE */}

        <Card className="border-slate-200 shadow-sm">

          <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center gap-3">

            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Baggage allowance
              </h2>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Included allowance and extra options
              </p>
            </div>

          </div>

          <div className="p-6">

            <div className="grid sm:grid-cols-2 gap-4 mb-8">

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">

                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Cabin baggage
                </div>

                <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">

                  <Briefcase className="w-4 h-4 text-slate-400" />

                  {includedCabin}

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">

                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Check-in baggage
                </div>

                <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">

                  <Briefcase className="w-4 h-4 text-slate-400" />

                  {includedCheckIn}

                </div>

              </div>

            </div>

            <div>

              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Extra check-in baggage
              </h3>

              <div className="grid sm:grid-cols-4 gap-3">

                {baggageOptions.map(
                  ([kg, title, price]) => (

                    <OptionCard
                      key={kg}
                      selected={
                        extraBaggageKg === kg
                      }
                      onClick={() =>
                        setExtraBaggageKg(kg)
                      }
                      title={title}
                      price={price}
                      currency={currency}
                    />

                  )
                )}

              </div>

            </div>

          </div>

        </Card>

        {/* MEALS */}

        <Card className="border-slate-200 shadow-sm overflow-hidden">

          <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center gap-3">

            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Utensils className="w-5 h-5" />
            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Meal & Beverage
              </h2>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Choose from available options for your journey
              </p>

            </div>

          </div>

          <div className="p-6">

            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2">

              {mealCategories.map(
                (cat) => (

                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setActiveMealTab(cat)
                    }
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      activeMealTab === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>

                )
              )}

            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

              {mealOptions
                .filter(
                  ([, , , group]) =>
                    group === activeMealTab
                )
                .map(
                  ([value, title, price]) => (

                    <OptionCard
                      key={value}
                      selected={
                        meal === value
                      }
                      onClick={() =>
                        setMeal(value)
                      }
                      title={title}
                      price={price}
                      currency={currency}
                    />

                  )
                )}

            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">

              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Don't need a meal?
              </h3>

              <div className="max-w-xs">

                <OptionCard
                  selected={
                    meal === 'NONE'
                  }
                  onClick={() =>
                    setMeal('NONE')
                  }
                  title="No meal included"
                  price={0}
                  currency={currency}
                />

              </div>

            </div>

          </div>

        </Card>

        {/* ADD-ONS SUMMARY */}

        <Card className="border-slate-200 shadow-sm mt-8 bg-slate-900 text-white">

          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

            <div className="w-full sm:w-auto">

              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                Add-ons Summary
              </h3>

              <div className="space-y-2 mb-4 w-full sm:min-w-[240px]">

                <div className="flex justify-between items-center text-sm font-medium">

                  <span className="text-slate-300">
                    Seat {seat ? `(${seat})` : ''}
                  </span>

                  <span className="text-white">
                    {currency(seatPrice)}
                  </span>

                </div>

                <div className="flex justify-between items-center text-sm font-medium">

                  <span className="text-slate-300">
                    Extra Baggage{' '}
                    {extraBaggageKg
                      ? `(+${extraBaggageKg}kg)`
                      : ''}
                  </span>

                  <span className="text-white">
                    {currency(baggagePrice)}
                  </span>

                </div>

                <div className="flex justify-between items-center text-sm font-medium">

                  <span className="text-slate-300">
                    Meal{' '}
                    {meal !== 'NONE'
                      ? `(${selectedMeal[1]})`
                      : ''}
                  </span>

                  <span className="text-white">
                    {currency(mealPrice)}
                  </span>

                </div>

              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-between items-center">

                <span className="font-bold text-slate-200">
                  Total Add-ons
                </span>

                <span className="text-2xl font-black text-white">
                  {currency(addOnsTotal)}
                </span>

              </div>

            </div>

            <div className="w-full sm:w-auto flex flex-col gap-3 sm:items-end">

              <Button
                type="button"
                onClick={continueToReview}
                className="w-full sm:w-auto py-3 px-8 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-xl shadow-lg transition-colors"
              >
                Continue to Review
              </Button>

              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Back to passenger details
              </button>

            </div>

          </div>

        </Card>

      </div>
    </div>
  );
}