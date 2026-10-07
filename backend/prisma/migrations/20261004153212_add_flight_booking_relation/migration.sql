-- AlterTable
ALTER TABLE "FlightBooking" ADD COLUMN     "fareClass" TEXT,
ADD COLUMN     "flightOfferId" TEXT;

-- CreateIndex
CREATE INDEX "FlightBooking_flightOfferId_idx" ON "FlightBooking"("flightOfferId");

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_flightOfferId_fkey" FOREIGN KEY ("flightOfferId") REFERENCES "FlightOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
