-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "emotions" TEXT[] DEFAULT ARRAY[]::TEXT[];
