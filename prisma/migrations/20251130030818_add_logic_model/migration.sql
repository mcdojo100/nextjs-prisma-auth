-- CreateTable
CREATE TABLE "Logic" (
    "id" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "facts" TEXT NOT NULL,
    "assumptions" TEXT NOT NULL,
    "patterns" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Logic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Logic" ADD CONSTRAINT "Logic_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
