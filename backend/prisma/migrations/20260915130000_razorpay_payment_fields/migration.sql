ALTER TABLE "Payment" ADD COLUMN "razorpayOrderId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "razorpayPaymentId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "razorpayRefundId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "refundStatus" TEXT;
ALTER TABLE "Payment" ADD COLUMN "refundError" TEXT;

CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId");
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");
CREATE UNIQUE INDEX "Payment_razorpayRefundId_key" ON "Payment"("razorpayRefundId");
