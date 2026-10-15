/*
  Warnings:

  - You are about to drop the `tickets` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_checkedInById_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_orderItemId_fkey";

-- DropTable
DROP TABLE "tickets";

-- CreateTable
CREATE TABLE "gallery" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "publicId" TEXT NOT NULL,
    "eventId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_tickets" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "checkedInById" TEXT,
    "ticketNumber" TEXT NOT NULL,
    "qrTokenHash" TEXT NOT NULL,
    "status" "IssuedTicketStatus" NOT NULL DEFAULT 'ISSUED',
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issued_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_eventId_idx" ON "gallery"("eventId");

-- CreateIndex
CREATE INDEX "gallery_mediaType_idx" ON "gallery"("mediaType");

-- CreateIndex
CREATE INDEX "gallery_isPublished_idx" ON "gallery"("isPublished");

-- CreateIndex
CREATE INDEX "gallery_displayOrder_idx" ON "gallery"("displayOrder");

-- CreateIndex
CREATE INDEX "gallery_createdAt_idx" ON "gallery"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "issued_tickets_ticketNumber_key" ON "issued_tickets"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "issued_tickets_qrTokenHash_key" ON "issued_tickets"("qrTokenHash");

-- CreateIndex
CREATE INDEX "issued_tickets_orderItemId_idx" ON "issued_tickets"("orderItemId");

-- CreateIndex
CREATE INDEX "issued_tickets_ticketTypeId_idx" ON "issued_tickets"("ticketTypeId");

-- CreateIndex
CREATE INDEX "issued_tickets_accountId_idx" ON "issued_tickets"("accountId");

-- CreateIndex
CREATE INDEX "issued_tickets_status_idx" ON "issued_tickets"("status");

-- CreateIndex
CREATE INDEX "issued_tickets_checkedInAt_idx" ON "issued_tickets"("checkedInAt");

-- AddForeignKey
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_tickets" ADD CONSTRAINT "issued_tickets_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_tickets" ADD CONSTRAINT "issued_tickets_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "ticket_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_tickets" ADD CONSTRAINT "issued_tickets_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_tickets" ADD CONSTRAINT "issued_tickets_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
