-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "preferredAnswers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "preferredCorrectAnswer" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "preferredQuestion" TEXT NOT NULL DEFAULT '';
