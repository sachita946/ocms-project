/*
  Warnings:

  - A unique constraint covering the columns `[enrollment_code]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollment_code` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Certificate" ADD COLUMN     "expiry_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Enrollment" ADD COLUMN     "enrollment_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Lesson" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Quiz" ADD COLUMN     "instructons" TEXT;

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" INTEGER,
    "course_id" INTEGER,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoNote" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "timestamp_seconds" INTEGER NOT NULL DEFAULT 0,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_enrollment_code_key" ON "public"."Enrollment"("enrollment_code");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoNote" ADD CONSTRAINT "VideoNote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoNote" ADD CONSTRAINT "VideoNote_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
