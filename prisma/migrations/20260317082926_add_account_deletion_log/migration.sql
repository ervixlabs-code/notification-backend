-- CreateEnum
CREATE TYPE "DeleteAccountReason" AS ENUM ('NOT_USEFUL', 'TOO_MANY_NOTIFICATIONS', 'PRIVACY_CONCERNS', 'TECHNICAL_ISSUES', 'FOUND_ALTERNATIVE', 'OTHER');

-- CreateTable
CREATE TABLE "AccountDeletionLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT,
    "reason" "DeleteAccountReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountDeletionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountDeletionLog_userId_idx" ON "AccountDeletionLog"("userId");
