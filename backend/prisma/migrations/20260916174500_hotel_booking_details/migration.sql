ALTER TABLE "HotelBooking" ADD COLUMN "hotelImageUrl" TEXT;
ALTER TABLE "HotelBooking" ADD COLUMN "roomAmenities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "HotelBooking" ADD COLUMN "mealPlan" TEXT;
ALTER TABLE "HotelBooking" ADD COLUMN "cancellationPolicy" TEXT;