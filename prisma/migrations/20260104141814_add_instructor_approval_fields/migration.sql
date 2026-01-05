-- AlterTable
ALTER TABLE "public"."InstructorProfile" ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "is_pending_approval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qualifications" TEXT;
