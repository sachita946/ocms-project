/*
  Warnings:

  - You are about to drop the column `zoom_link` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "zoom_link";

-- AlterTable
ALTER TABLE "public"."CourseResource" ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."InstructorEarning" (
    "id" SERIAL NOT NULL,
    "instructor_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "platform_fee" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "net_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstructorEarning_instructor_id_idx" ON "public"."InstructorEarning"("instructor_id");

-- CreateIndex
CREATE INDEX "InstructorEarning_course_id_idx" ON "public"."InstructorEarning"("course_id");

-- CreateIndex
CREATE INDEX "InstructorEarning_payment_id_idx" ON "public"."InstructorEarning"("payment_id");

-- AddForeignKey
ALTER TABLE "public"."InstructorEarning" ADD CONSTRAINT "InstructorEarning_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."InstructorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstructorEarning" ADD CONSTRAINT "InstructorEarning_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstructorEarning" ADD CONSTRAINT "InstructorEarning_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
