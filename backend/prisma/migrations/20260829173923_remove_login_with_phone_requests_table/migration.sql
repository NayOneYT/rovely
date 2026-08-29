/*
  Warnings:

  - You are about to drop the `login_with_phone_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "login_with_phone_requests" DROP CONSTRAINT "login_with_phone_requests_phone_fkey";

-- DropTable
DROP TABLE "login_with_phone_requests";
