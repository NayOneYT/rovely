/*
  Warnings:

  - You are about to drop the column `createdAt` on the `verification_email_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "verification_email_requests" DROP COLUMN "createdAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
