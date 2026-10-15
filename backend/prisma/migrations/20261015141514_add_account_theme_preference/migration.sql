-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "account_preferences" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "theme" "ThemePreference" NOT NULL DEFAULT 'LIGHT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_preferences_accountId_key" ON "account_preferences"("accountId");

-- AddForeignKey
ALTER TABLE "account_preferences" ADD CONSTRAINT "account_preferences_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
