/*
  Warnings:

  - A unique constraint covering the columns `[student_id,course_id]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_student_id_course_id_key" ON "public"."Enrollment"("student_id", "course_id");
