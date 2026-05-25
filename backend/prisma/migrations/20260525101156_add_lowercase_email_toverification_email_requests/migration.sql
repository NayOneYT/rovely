/*
  Warnings:

  - The primary key for the `verification_email_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[email]` on the table `verification_email_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lowercase_email` to the `verification_email_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "verification_email_requests" DROP CONSTRAINT "verification_email_requests_pkey",
ADD COLUMN     "lowercase_email" TEXT NOT NULL,
ADD CONSTRAINT "verification_email_requests_pkey" PRIMARY KEY ("lowercase_email", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_email_requests_email_key" ON "verification_email_requests"("email");
