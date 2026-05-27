/*
  Warnings:

  - You are about to drop the column `updated_at` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "updated_at",
ADD COLUMN     "password_changed_at" TIMESTAMP(3);
