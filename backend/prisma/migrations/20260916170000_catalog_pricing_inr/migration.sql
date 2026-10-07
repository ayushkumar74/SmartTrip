-- SmartTrip-owned catalog prices are stored in INR.
-- Renaming preserves every existing numeric value without deleting catalog rows.
ALTER TABLE "FlightOffer" RENAME COLUMN "priceUSD" TO "priceINR";
ALTER TABLE "Room" RENAME COLUMN "pricePerNightUSD" TO "pricePerNightINR";
ALTER TABLE "HolidayPackage" RENAME COLUMN "priceUSD" TO "priceINR";
ALTER TABLE "Destination" RENAME COLUMN "budgetUSD" TO "budgetINR";
ALTER TABLE "Attraction" RENAME COLUMN "entryFeeUSD" TO "entryFeeINR";