/*
  Warnings:

  - The primary key for the `email_verification_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `phone_verification_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `email_verification_requests` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `phone_verification_requests` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "email_verification_requests" DROP CONSTRAINT "email_verification_requests_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "account_id" DROP NOT NULL,
ALTER COLUMN "account_id" DROP DEFAULT,
ADD CONSTRAINT "email_verification_requests_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "phone_verification_requests" DROP CONSTRAINT "phone_verification_requests_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "account_id" DROP NOT NULL,
ALTER COLUMN "account_id" DROP DEFAULT,
ADD CONSTRAINT "phone_verification_requests_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "email_verification_requests_account_id_idx" ON "email_verification_requests"("account_id");

-- CreateIndex
CREATE INDEX "email_verification_requests_lowercase_email_account_id_idx" ON "email_verification_requests"("lowercase_email", "account_id");

-- CreateIndex
CREATE INDEX "phone_verification_requests_account_id_idx" ON "phone_verification_requests"("account_id");

-- CreateIndex
CREATE INDEX "phone_verification_requests_phone_account_id_idx" ON "phone_verification_requests"("phone", "account_id");

-- AddForeignKey
ALTER TABLE "email_verification_requests" ADD CONSTRAINT "email_verification_requests_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_verification_requests" ADD CONSTRAINT "phone_verification_requests_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
