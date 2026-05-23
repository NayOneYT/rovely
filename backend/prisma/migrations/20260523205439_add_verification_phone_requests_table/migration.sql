-- CreateTable
CREATE TABLE "verification_phone_requests" (
    "code" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "account_id" TEXT NOT NULL DEFAULT 'none',
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_phone_requests_pkey" PRIMARY KEY ("phone","account_id")
);
