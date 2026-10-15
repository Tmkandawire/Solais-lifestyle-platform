/*
  Warnings:

  - The values [SOLD_OUT] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `ticketTypeName` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VendorApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "public"."ticket_types" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ticket_types" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "ticket_types" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "ticketTypeName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "vendor_applications" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "businessCategory" TEXT NOT NULL,
    "productsOrServices" TEXT NOT NULL,
    "websiteOrSocial" TEXT,
    "preferredEventId" TEXT,
    "status" "VendorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendor_applications_status_idx" ON "vendor_applications"("status");

-- CreateIndex
CREATE INDEX "vendor_applications_preferredEventId_idx" ON "vendor_applications"("preferredEventId");

-- CreateIndex
CREATE INDEX "vendor_applications_email_idx" ON "vendor_applications"("email");

-- CreateIndex
CREATE INDEX "vendor_applications_createdAt_idx" ON "vendor_applications"("createdAt");

-- CreateIndex
CREATE INDEX "vendor_applications_reviewedById_idx" ON "vendor_applications"("reviewedById");

-- CreateIndex
CREATE INDEX "orders_eventId_idx" ON "orders"("eventId");

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_preferredEventId_fkey" FOREIGN KEY ("preferredEventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
