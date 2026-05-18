/*
  Warnings:

  - You are about to drop the `verification_email_request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "verification_email_request" DROP CONSTRAINT "verification_email_request_account_id_fkey";

-- DropTable
DROP TABLE "verification_email_request";

-- CreateTable
CREATE TABLE "verification_email_requests" (
    "email" TEXT NOT NULL,
    "account_id" TEXT NOT NULL DEFAULT 'none',
    "token" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_email_requests_pkey" PRIMARY KEY ("email","account_id")
);

-- AddForeignKey
ALTER TABLE "verification_email_requests" ADD CONSTRAINT "verification_email_requests_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
