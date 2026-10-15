-- CreateEnum
CREATE TYPE "IssuedTicketStatus" AS ENUM ('ISSUED', 'CHECKED_IN', 'CANCELLED');

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "status" "IssuedTicketStatus" NOT NULL DEFAULT 'ISSUED',
    "checkedInAt" TIMESTAMP(3),
    "checkedInById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketCode_key" ON "tickets"("ticketCode");

-- CreateIndex
CREATE INDEX "tickets_orderItemId_idx" ON "tickets"("orderItemId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_checkedInById_idx" ON "tickets"("checkedInById");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
