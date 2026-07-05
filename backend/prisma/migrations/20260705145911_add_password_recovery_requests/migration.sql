-- CreateEnum
CREATE TYPE "PasswordRecoveryRequestTo" AS ENUM ('EMAIL', 'PHONE');

-- CreateTable
CREATE TABLE "password_recovery_requests" (
    "token" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "to" "PasswordRecoveryRequestTo" NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_recovery_requests_pkey" PRIMARY KEY ("login","to")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_recovery_requests_token_key" ON "password_recovery_requests"("token");

-- AddForeignKey
ALTER TABLE "password_recovery_requests" ADD CONSTRAINT "password_recovery_requests_login_fkey" FOREIGN KEY ("login") REFERENCES "accounts"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
