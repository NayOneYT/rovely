/*
  Warnings:

  - Added the required column `telegram_chat_id` to the `verification_phone_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "verification_phone_requests" ADD COLUMN     "telegram_chat_id" INTEGER NOT NULL;
