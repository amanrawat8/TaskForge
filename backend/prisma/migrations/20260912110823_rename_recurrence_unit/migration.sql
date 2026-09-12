/*
  Warnings:

  - You are about to drop the column `recurrenceunit` on the `ServiceType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceType" DROP COLUMN "recurrenceunit",
ADD COLUMN     "recurrenceUnit" "RecurrenceUnit";
