/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `expiry_date` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `is_featured` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `instructons` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `is_approved` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Activity" DROP COLUMN "timestamp",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Certificate" DROP COLUMN "expiry_date",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "created_at",
DROP COLUMN "is_featured",
DROP COLUMN "tags",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "public"."Lesson" DROP COLUMN "created_at",
DROP COLUMN "order";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "is_read",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Quiz" DROP COLUMN "instructons";

-- AlterTable
ALTER TABLE "public"."Review" DROP COLUMN "is_approved",
DROP COLUMN "updated_at",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
