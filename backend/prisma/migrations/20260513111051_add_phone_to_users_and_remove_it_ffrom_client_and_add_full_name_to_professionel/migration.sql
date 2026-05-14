/*
  Warnings:

  - You are about to drop the column `phone` on the `client_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `professional_profiles` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `professional_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client_profiles" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "professional_profiles" DROP COLUMN "specialty",
ADD COLUMN     "full_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "color" TEXT,
ADD COLUMN     "mileage_km" INTEGER,
ADD COLUMN     "notes" TEXT;
