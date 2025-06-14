-- CreateTable
CREATE TABLE "playlist_history" (
    "id" TEXT NOT NULL,
    "mood" INTEGER NOT NULL,
    "playlistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_history_pkey" PRIMARY KEY ("id")
);
