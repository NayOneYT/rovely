/*
  Warnings:

  - You are about to drop the column `is_email_verified` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the `verification_email_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "verification_email_tokens" DROP CONSTRAINT "verification_email_tokens_account_id_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "is_email_verified";

-- DropTable
DROP TABLE "verification_email_tokens";

-- CreateTable
CREATE TABLE "verification_email_request" (
    "email" TEXT NOT NULL,
    "account_id" TEXT NOT NULL DEFAULT 'none',
    "token" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_email_request_pkey" PRIMARY KEY ("email","account_id")
);

-- AddForeignKey
ALTER TABLE "verification_email_request" ADD CONSTRAINT "verification_email_request_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
