/*
  Warnings:

  - You are about to drop the `phone_verification_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "phone_verification_requests" DROP CONSTRAINT "phone_verification_requests_account_id_fkey";

-- DropTable
DROP TABLE "phone_verification_requests";
