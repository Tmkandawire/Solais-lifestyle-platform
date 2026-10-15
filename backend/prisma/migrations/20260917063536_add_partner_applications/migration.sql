-- CreateEnum
CREATE TYPE "PartnerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "partner_applications" (
    "id" TEXT NOT NULL,
    "organisationName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "partnershipType" TEXT NOT NULL,
    "organisationDescription" TEXT NOT NULL,
    "partnershipInterest" TEXT NOT NULL,
    "contributionDescription" TEXT NOT NULL,
    "websiteOrSocial" TEXT,
    "preferredEventId" TEXT,
    "status" "PartnerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "partner_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partner_applications_status_idx" ON "partner_applications"("status");

-- CreateIndex
CREATE INDEX "partner_applications_preferredEventId_idx" ON "partner_applications"("preferredEventId");

-- CreateIndex
CREATE INDEX "partner_applications_email_idx" ON "partner_applications"("email");

-- CreateIndex
CREATE INDEX "partner_applications_createdAt_idx" ON "partner_applications"("createdAt");

-- CreateIndex
CREATE INDEX "partner_applications_reviewedById_idx" ON "partner_applications"("reviewedById");

-- AddForeignKey
ALTER TABLE "partner_applications" ADD CONSTRAINT "partner_applications_preferredEventId_fkey" FOREIGN KEY ("preferredEventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_applications" ADD CONSTRAINT "partner_applications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
