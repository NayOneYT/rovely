/*
  Warnings:

  - You are about to drop the column `telegram_chat_id` on the `verification_phone_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "verification_phone_requests" DROP COLUMN "telegram_chat_id";

-- CreateTable
CREATE TABLE "telegram_links" (
    "phone" TEXT NOT NULL,
    "telegram_user_id" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_links_phone_key" ON "telegram_links"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_links_telegram_user_id_key" ON "telegram_links"("telegram_user_id");
