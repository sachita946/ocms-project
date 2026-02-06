-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" TEXT;
