-- CreateTable
CREATE TABLE "playlist_recommendations" (
    "id" TEXT NOT NULL,
    "moodEntryId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "playlistName" TEXT NOT NULL,
    "playlistDescription" TEXT,
    "playlistImage" TEXT,
    "playlistUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_recommendations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "playlist_recommendations" ADD CONSTRAINT "playlist_recommendations_moodEntryId_fkey" FOREIGN KEY ("moodEntryId") REFERENCES "mood_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
