/*
  Warnings:

  - Made the column `content` on table `CourseResource` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."CourseResource" ALTER COLUMN "content" SET NOT NULL;
