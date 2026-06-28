/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "google_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_google_id_key" ON "accounts"("google_id");
