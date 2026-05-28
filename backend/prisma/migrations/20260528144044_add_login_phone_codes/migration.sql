-- CreateTable
CREATE TABLE "login_phone_codes" (
    "code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_phone_codes_pkey" PRIMARY KEY ("phone")
);

-- AddForeignKey
ALTER TABLE "login_phone_codes" ADD CONSTRAINT "login_phone_codes_phone_fkey" FOREIGN KEY ("phone") REFERENCES "accounts"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;
