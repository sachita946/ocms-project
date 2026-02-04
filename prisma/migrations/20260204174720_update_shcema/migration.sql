/*
  Warnings:

  - You are about to drop the column `file_type` on the `LessonResource` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `LessonResource` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[semester_id,program,title]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `program` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Subject_semester_id_title_key";

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "zoom_link" TEXT;

-- AlterTable
ALTER TABLE "public"."LessonResource" DROP COLUMN "file_type",
DROP COLUMN "file_url";

-- AlterTable
ALTER TABLE "public"."Subject" ADD COLUMN     "program" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Subject_program_idx" ON "public"."Subject"("program");

-- CreateIndex
CREATE INDEX "Subject_semester_id_program_idx" ON "public"."Subject"("semester_id", "program");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_semester_id_program_title_key" ON "public"."Subject"("semester_id", "program", "title");
