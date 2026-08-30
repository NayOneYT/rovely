/*
  Warnings:

  - You are about to drop the `password_recovery_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "password_recovery_requests" DROP CONSTRAINT "password_recovery_requests_account_id_fkey";

-- DropTable
DROP TABLE "password_recovery_requests";
