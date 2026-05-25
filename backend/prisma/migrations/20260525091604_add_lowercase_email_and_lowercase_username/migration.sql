/*
  Warnings:

  - A unique constraint covering the columns `[lowercase_email]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lowercase_username]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lowercase_username` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "lowercase_email" TEXT;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "lowercase_username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_lowercase_email_key" ON "accounts"("lowercase_email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_lowercase_username_key" ON "profiles"("lowercase_username");
