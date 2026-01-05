-- CreateTable
CREATE TABLE "public"."CourseResource" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseResource_course_id_type_idx" ON "public"."CourseResource"("course_id", "type");

-- CreateIndex
CREATE INDEX "CourseResource_user_id_idx" ON "public"."CourseResource"("user_id");

-- AddForeignKey
ALTER TABLE "public"."CourseResource" ADD CONSTRAINT "CourseResource_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseResource" ADD CONSTRAINT "CourseResource_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
