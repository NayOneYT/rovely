/*
  Warnings:

  - You are about to drop the `email_verification_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "email_verification_requests" DROP CONSTRAINT "email_verification_requests_account_id_fkey";

-- DropTable
DROP TABLE "email_verification_requests";
