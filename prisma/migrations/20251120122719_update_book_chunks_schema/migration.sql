/*
  Warnings:

  - You are about to drop the column `content` on the `book_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `book_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `book_chunks` table. All the data in the column will be lost.
  - Added the required column `chunk_text` to the `book_chunks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "books" ADD COLUMN "error_message" TEXT;
ALTER TABLE "books" ADD COLUMN "processed_at" DATETIME;
ALTER TABLE "books" ADD COLUMN "processing_status" TEXT;
ALTER TABLE "books" ADD COLUMN "total_chunks" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_book_chunks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "book_id" INTEGER NOT NULL,
    "chunk_id" TEXT,
    "chunk_text" TEXT NOT NULL,
    "chapter_number" INTEGER,
    "word_count" INTEGER,
    "chunk_index" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "book_chunks_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_book_chunks" ("book_id", "created_at", "id") SELECT "book_id", "created_at", "id" FROM "book_chunks";
DROP TABLE "book_chunks";
ALTER TABLE "new_book_chunks" RENAME TO "book_chunks";
CREATE INDEX "book_chunks_book_id_idx" ON "book_chunks"("book_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
