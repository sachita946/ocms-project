/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebook_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "facebook_id" TEXT,
ADD COLUMN     "google_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "public"."User"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_facebook_id_key" ON "public"."User"("facebook_id");
