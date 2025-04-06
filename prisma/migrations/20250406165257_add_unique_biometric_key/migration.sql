/*
  Warnings:

  - A unique constraint covering the columns `[biometricKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `biometricKey` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "biometricKey" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_biometricKey_key" ON "User"("biometricKey");
