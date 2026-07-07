/*
  Warnings:

  - The primary key for the `password_recovery_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `login` on the `password_recovery_requests` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `password_recovery_requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "password_recovery_requests" DROP CONSTRAINT "password_recovery_requests_login_fkey";

-- AlterTable
ALTER TABLE "password_recovery_requests" DROP CONSTRAINT "password_recovery_requests_pkey",
DROP COLUMN "login",
ADD COLUMN     "account_id" TEXT NOT NULL,
ADD CONSTRAINT "password_recovery_requests_pkey" PRIMARY KEY ("account_id", "to");

-- AddForeignKey
ALTER TABLE "password_recovery_requests" ADD CONSTRAINT "password_recovery_requests_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
