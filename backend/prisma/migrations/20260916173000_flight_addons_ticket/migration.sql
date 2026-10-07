ALTER TABLE "FlightBooking" ADD COLUMN "seat" TEXT;
ALTER TABLE "FlightBooking" ADD COLUMN "extraBaggageKg" INTEGER;
ALTER TABLE "FlightBooking" ADD COLUMN "meal" TEXT;
ALTER TABLE "FlightBooking" ADD COLUMN "addOnsTotal" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "FlightBooking" ADD COLUMN "smartTripTicketId" TEXT;
CREATE UNIQUE INDEX "FlightBooking_smartTripTicketId_key" ON "FlightBooking"("smartTripTicketId");