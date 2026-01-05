/*
  Warnings:

  - Added the required column `subject_id` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Lesson" ADD COLUMN     "subject_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Semester" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "semester_num" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" SERIAL NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LessonResource" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Semester_name_key" ON "public"."Semester"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_semester_num_key" ON "public"."Semester"("semester_num");

-- CreateIndex
CREATE INDEX "Subject_semester_id_idx" ON "public"."Subject"("semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_semester_id_title_key" ON "public"."Subject"("semester_id", "title");

-- CreateIndex
CREATE INDEX "LessonResource_lesson_id_type_idx" ON "public"."LessonResource"("lesson_id", "type");

-- CreateIndex
CREATE INDEX "LessonResource_user_id_idx" ON "public"."LessonResource"("user_id");

-- CreateIndex
CREATE INDEX "Lesson_course_id_idx" ON "public"."Lesson"("course_id");

-- CreateIndex
CREATE INDEX "Lesson_subject_id_idx" ON "public"."Lesson"("subject_id");

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonResource" ADD CONSTRAINT "LessonResource_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonResource" ADD CONSTRAINT "LessonResource_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
