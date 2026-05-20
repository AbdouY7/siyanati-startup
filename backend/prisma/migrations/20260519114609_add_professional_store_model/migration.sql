/*
  Warnings:

  - You are about to drop the column `shop_images` on the `professional_profiles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('individuel', 'avec_magasin');

-- AlterTable
ALTER TABLE "professional_profiles" DROP COLUMN "shop_images",
ADD COLUMN     "work_type" "WorkType" NOT NULL DEFAULT 'individuel';

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wilaya" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "location_coordinates" TEXT,
    "images" TEXT[],
    "documents" TEXT[],
    "logo_url" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_professional_id_key" ON "stores"("professional_id");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
