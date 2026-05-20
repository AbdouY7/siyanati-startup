/*
  Warnings:

  - Changed the type of `specialty_type` on the `professional_profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "professional_profiles" DROP COLUMN "specialty_type",
ADD COLUMN     "specialty_type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "SpecialtyType";
