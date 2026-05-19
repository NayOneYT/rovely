/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `verification_email_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "verification_email_requests" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
