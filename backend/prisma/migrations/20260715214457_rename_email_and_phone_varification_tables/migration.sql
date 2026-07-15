/*
  Warnings:

  - You are about to drop the `verification_email_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_phone_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "verification_email_requests";

-- DropTable
DROP TABLE "verification_phone_requests";

-- CreateTable
CREATE TABLE "email_verification_requests" (
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lowercase_email" TEXT NOT NULL,
    "account_id" TEXT NOT NULL DEFAULT 'none',
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_requests_pkey" PRIMARY KEY ("lowercase_email","account_id")
);

-- CreateTable
CREATE TABLE "phone_verification_requests" (
    "code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "account_id" TEXT NOT NULL DEFAULT 'none',
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_verification_requests_pkey" PRIMARY KEY ("phone","account_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_requests_token_key" ON "email_verification_requests"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_requests_email_key" ON "email_verification_requests"("email");
