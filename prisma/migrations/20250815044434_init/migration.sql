-- CreateTable
CREATE TABLE "public"."MonthlySummary" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "havings" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "MonthlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MovementDetail" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "monthlySummaryId" INTEGER NOT NULL,

    CONSTRAINT "MovementDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Budgets" (
    "id" SERIAL NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "clientName" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,

    CONSTRAINT "Budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."MovementDetail" ADD CONSTRAINT "MovementDetail_monthlySummaryId_fkey" FOREIGN KEY ("monthlySummaryId") REFERENCES "public"."MonthlySummary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
