const inputError = (message) => Object.assign(new Error(message), { statusCode: 400 });

const isDateOnly = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
const todayDateOnly = () => new Date().toISOString().slice(0, 10);
const positiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const nonNegativeInteger = (value) => Number.isInteger(Number(value)) && Number(value) >= 0;

export const validateFlightSearch = (query) => {
  const { from, to, date, returnDate, cabinClass, sortBy, sortOrder } = query;
  if (from !== undefined && typeof from !== 'string') throw inputError('from must be a valid three-letter airport code');
  if (to !== undefined && typeof to !== 'string') throw inputError('to must be a valid three-letter airport code');
  const origin = from?.trim().toUpperCase();
  const destination = to?.trim().toUpperCase();
  if (origin && !/^[A-Z]{3}$/.test(origin)) throw inputError('from must be a valid three-letter airport code');
  if (destination && !/^[A-Z]{3}$/.test(destination)) throw inputError('to must be a valid three-letter airport code');
  if (origin && destination && origin === destination) throw inputError('from and to must be different airports');
  if (date !== undefined && !isDateOnly(date)) throw inputError('date must use YYYY-MM-DD format');
  if (date && date < todayDateOnly()) throw inputError('date cannot be in the past');
  if (returnDate !== undefined && !isDateOnly(returnDate)) throw inputError('returnDate must use YYYY-MM-DD format');
  if (returnDate && date && returnDate <= date) throw inputError('returnDate must be after date');
  if (cabinClass !== undefined && (typeof cabinClass !== 'string' || !['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].includes(cabinClass.toUpperCase()))) throw inputError('cabinClass is not supported');
  if (sortBy !== undefined && !['price', 'departure', 'duration', 'stops'].includes(sortBy)) throw inputError('sortBy is not supported');
  if (sortOrder !== undefined && !['asc', 'desc'].includes(sortOrder.toLowerCase())) throw inputError('sortOrder must be asc or desc');

  for (const field of ['adults', 'passengers', 'children', 'infants']) {
    if (query[field] !== undefined && !nonNegativeInteger(query[field])) throw inputError(`${field} must be a non-negative integer`);
  }
  const adults = Number(query.adults ?? query.passengers ?? 1);
  const infants = Number(query.infants ?? 0);
  if (adults < 1) throw inputError('at least one adult is required');
  if (infants > adults) throw inputError('infants cannot exceed adults');

  return { ...query, from: origin, to: destination };
};

export const validateHotelSearch = (query) => {
  if (query.destination !== undefined && typeof query.destination !== 'string') throw inputError('destination is required');
  const destination = query.destination?.trim();
  if (!destination) throw inputError('destination is required');
  if (!isDateOnly(query.checkIn)) throw inputError('checkIn is required and must use YYYY-MM-DD format');
  if (!isDateOnly(query.checkOut)) throw inputError('checkOut is required and must use YYYY-MM-DD format');
  if (query.checkOut <= query.checkIn) throw inputError('checkOut must be after checkIn');
  for (const field of ['adults', 'guests', 'rooms']) {
    if (query[field] !== undefined && !positiveInteger(query[field])) throw inputError(`${field} must be a positive integer`);
  }
  if (query.children !== undefined && !nonNegativeInteger(query.children)) throw inputError('children must be a non-negative integer');
  if (query.children !== undefined && query.childAges !== undefined) {
    const ages = Array.isArray(query.childAges) ? query.childAges : String(query.childAges).split(',');
    if (ages.length !== Number(query.children) || ages.some((age) => !nonNegativeInteger(age) || Number(age) > 17)) throw inputError('childAges must contain valid ages for every child');
  }
  return { ...query, destination };
};

export const validateFlightPassengers = (passengerData, { international = false } = {}) => {
  if (!Array.isArray(passengerData) || passengerData.length < 1 || passengerData.length > 20) throw inputError('passengerData must contain between 1 and 20 passengers');
  for (const passenger of passengerData) {
    if (!passenger || typeof passenger !== 'object') throw inputError('each passenger must be an object');
    if (typeof passenger.firstName !== 'string' || !passenger.firstName.trim()) throw inputError('Passenger firstName is required');
    if (typeof passenger.lastName !== 'string' || !passenger.lastName.trim()) throw inputError('Passenger lastName is required');
    if (typeof passenger.dateOfBirth !== 'string' || !isDateOnly(passenger.dateOfBirth)) throw inputError('Passenger dateOfBirth must use YYYY-MM-DD format');
    if (new Date(`${passenger.dateOfBirth}T00:00:00.000Z`) >= new Date()) throw inputError('Passenger dateOfBirth must be in the past');
    if (typeof passenger.gender !== 'string' || !passenger.gender.trim()) throw inputError('Passenger gender is required');
    if (typeof passenger.nationality !== 'string' || !passenger.nationality.trim()) throw inputError('Passenger nationality is required');
    if (passenger.email !== undefined && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email) || passenger.email.length > 254)) throw inputError('Passenger email is invalid');
    if (passenger.mobile !== undefined) {
      const compactMobile = String(passenger.mobile).trim().replace(/[\s()-]/g, '');
      const localMobile = compactMobile.startsWith('+91')
        ? compactMobile.slice(3)
        : compactMobile.startsWith('91') && compactMobile.length === 12
          ? compactMobile.slice(2)
          : compactMobile;
      if (!/^[6-9]\d{9}$/.test(localMobile)) throw inputError('Passenger mobile must be a valid 10-digit Indian number');
    }
    if (international) {
      if (typeof passenger.passportNumber !== 'string' || !passenger.passportNumber.trim()) throw inputError('Passport number is required for international flights');
      if (!isDateOnly(passenger.passportExpiry) || passenger.passportExpiry <= new Date().toISOString().slice(0, 10)) throw inputError('Passport expiry date is required for international flights');
      if (typeof passenger.passportIssuingCountry !== 'string' || !passenger.passportIssuingCountry.trim()) throw inputError('Passport issuing country is required for international flights');
    }
  }
};

export const validateHotelGuests = (guestData) => {
  if (!Array.isArray(guestData) || guestData.length < 1 || guestData.length > 50) throw inputError('guestData must contain between 1 and 50 guests');
  for (const guest of guestData) {
    if (!guest || typeof guest !== 'object') throw inputError('each guest must be an object');
    if (typeof guest.firstName !== 'string' || !guest.firstName.trim()) throw inputError('Guest firstName is required');
    if (typeof guest.lastName !== 'string' || !guest.lastName.trim()) throw inputError('Guest lastName is required');
    if (typeof guest.title !== 'string' || !guest.title.trim()) throw inputError('Guest title is required');
    if (guest.gender !== undefined && !['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(guest.gender)) throw inputError('Guest gender is invalid');
    if (typeof guest.nationality !== 'string' || !guest.nationality.trim()) throw inputError('Guest nationality is required');
    if (typeof guest.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) throw inputError('Guest email is invalid');
    if (typeof guest.mobile !== 'string' || !/^\+?[1-9]\d{7,14}$/.test(guest.mobile.replace(/[\s()-]/g, ''))) throw inputError('Guest mobile is invalid');
    if (guest.dateOfBirth !== undefined && guest.dateOfBirth !== null && !isDateOnly(guest.dateOfBirth)) throw inputError('Guest dateOfBirth must use YYYY-MM-DD format');
  }
};

export { inputError, isDateOnly };
