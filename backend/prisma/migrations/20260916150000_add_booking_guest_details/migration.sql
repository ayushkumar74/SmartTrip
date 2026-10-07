-- Add optional fields so existing bookings remain readable while new bookings can store realistic traveler details.
ALTER TABLE "HotelBooking" ADD COLUMN "specialRequest" TEXT;

ALTER TABLE "Passenger"
  ADD COLUMN "title" TEXT,
  ADD COLUMN "middleName" TEXT,
  ADD COLUMN "nationality" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "mobile" TEXT,
  ADD COLUMN "passportExpiry" TIMESTAMP(3),
  ADD COLUMN "passportIssuingCountry" TEXT,
  ADD COLUMN "frequentFlyerNumber" TEXT;
