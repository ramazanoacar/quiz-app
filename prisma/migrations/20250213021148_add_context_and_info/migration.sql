-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "context" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "information" TEXT NOT NULL DEFAULT '';
