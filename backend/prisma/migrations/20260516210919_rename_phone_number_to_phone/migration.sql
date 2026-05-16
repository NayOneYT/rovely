/*
  Warnings:

  - You are about to drop the column `phone_number` on the `accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "accounts_phone_number_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "phone_number",
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_phone_key" ON "accounts"("phone");
