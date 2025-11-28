-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "physicalSensations" TEXT[] DEFAULT ARRAY[]::TEXT[];
