-- AlterTable
ALTER TABLE "public"."CourseResource" ADD COLUMN     "subject_id" INTEGER,
ALTER COLUMN "course_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CourseResource_subject_id_type_idx" ON "public"."CourseResource"("subject_id", "type");

-- AddForeignKey
ALTER TABLE "public"."CourseResource" ADD CONSTRAINT "CourseResource_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
