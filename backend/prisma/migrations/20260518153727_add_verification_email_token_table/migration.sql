-- CreateTable
CREATE TABLE "verification_email_tokens" (
    "email" TEXT NOT NULL,
    "account_id" TEXT NOT NULL DEFAULT 'none',
    "token" TEXT NOT NULL,

    CONSTRAINT "verification_email_tokens_pkey" PRIMARY KEY ("email","account_id")
);

-- AddForeignKey
ALTER TABLE "verification_email_tokens" ADD CONSTRAINT "verification_email_tokens_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
