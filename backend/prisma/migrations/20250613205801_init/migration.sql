-- CreateTable
CREATE TABLE "mood_entries" (
    "id" TEXT NOT NULL,
    "mood" INTEGER NOT NULL,
    "moodEmoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);
