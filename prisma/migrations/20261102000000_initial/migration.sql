-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "triageJson" TEXT,
    "errorCode" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "availableAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseToken" TEXT,
    "leaseExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Intake_status_availableAt_createdAt_idx" ON "Intake"("status", "availableAt", "createdAt");

-- CreateIndex
CREATE INDEX "Intake_status_leaseExpiresAt_idx" ON "Intake"("status", "leaseExpiresAt");
