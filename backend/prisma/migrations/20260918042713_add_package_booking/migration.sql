-- AlterEnum
ALTER TYPE "BookingType" ADD VALUE 'PACKAGE';

-- AlterTable
ALTER TABLE "Attraction" ALTER COLUMN "entryFeeINR" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Destination" ALTER COLUMN "budgetINR" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "FlightOffer" ALTER COLUMN "priceINR" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "HolidayPackage" ALTER COLUMN "priceINR" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "pricePerNightINR" SET DATA TYPE DECIMAL(12,2);

-- CreateTable
CREATE TABLE "PackageBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "travelDate" TIMESTAMP(3),
    "travelers" INTEGER NOT NULL,
    "packageImageUrl" TEXT,

    CONSTRAINT "PackageBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackageBooking_bookingId_key" ON "PackageBooking"("bookingId");

-- AddForeignKey
ALTER TABLE "PackageBooking" ADD CONSTRAINT "PackageBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageBooking" ADD CONSTRAINT "PackageBooking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "HolidayPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
