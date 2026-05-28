/*
  Warnings:

  - You are about to drop the `login_phone_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "login_phone_codes" DROP CONSTRAINT "login_phone_codes_phone_fkey";

-- DropTable
DROP TABLE "login_phone_codes";

-- CreateTable
CREATE TABLE "login_with_phone_requests" (
    "code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_with_phone_requests_pkey" PRIMARY KEY ("phone")
);

-- AddForeignKey
ALTER TABLE "login_with_phone_requests" ADD CONSTRAINT "login_with_phone_requests_phone_fkey" FOREIGN KEY ("phone") REFERENCES "accounts"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;
