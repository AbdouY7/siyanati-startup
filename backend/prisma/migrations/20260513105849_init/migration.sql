-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'professional', 'store', 'admin');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "SpecialtyType" AS ENUM ('mechanic', 'electrician', 'bodywork', 'diagnostic', 'other');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'lpg');

-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('client', 'store');

-- CreateEnum
CREATE TYPE "PartCondition" AS ENUM ('new', 'used', 'refurbished');

-- CreateEnum
CREATE TYPE "OrderDeliveryType" AS ENUM ('home_delivery', 'store_pickup');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('edahabia', 'cash_on_delivery');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('open', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "ReactionTarget" AS ENUM ('post', 'comment');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'file', 'system');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'quarterly', 'annual');

-- CreateEnum
CREATE TYPE "SubscriptionTarget" AS ENUM ('professional', 'store');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'cancelled', 'expired', 'suspended');

-- CreateEnum
CREATE TYPE "ReviewTarget" AS ENUM ('store', 'part', 'professional');

-- CreateEnum
CREATE TYPE "LoyaltyOperation" AS ENUM ('earn', 'redeem', 'expire', 'admin_adjust');

-- CreateEnum
CREATE TYPE "FavoriteTarget" AS ENUM ('store', 'professional', 'part');

-- CreateEnum
CREATE TYPE "ReportTarget" AS ENUM ('store', 'professional', 'post', 'comment', 'user');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('spam', 'fraud', 'inappropriate_content', 'fake_parts', 'no_show', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'dismissed', 'actioned');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('order_status_updated', 'appointment_requested', 'appointment_confirmed', 'appointment_cancelled', 'appointment_completed', 'new_message', 'subscription_expiring', 'subscription_expired', 'account_frozen', 'account_unfrozen', 'review_received', 'report_reviewed', 'professional_approved', 'professional_rejected', 'store_approved', 'store_rejected', 'loyalty_points_earned', 'diagnostic_post_answered', 'diagnostic_answer_accepted');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "refresh_token" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "wilaya" TEXT,
    "address" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "national_id_number" TEXT,
    "national_id_card" TEXT[],
    "avatar_url" TEXT,
    "preferred_language" TEXT NOT NULL DEFAULT 'ar',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "wilaya" TEXT NOT NULL,
    "location_coordinates" TEXT,
    "documents" TEXT[],
    "images" TEXT[],
    "logo_url" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "reviewed_by_admin_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_frozen" BOOLEAN NOT NULL DEFAULT false,
    "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "specialty_type" "SpecialtyType" NOT NULL,
    "experience_years" INTEGER,
    "wilaya" TEXT NOT NULL,
    "location_address" TEXT,
    "shop_images" TEXT[],
    "documents" TEXT[],
    "bio" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "reviewed_by_admin_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_frozen" BOOLEAN NOT NULL DEFAULT false,
    "hourly_rate_dzd" DECIMAL(12,2),
    "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professional_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "logo_url" TEXT,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year_start" INTEGER,
    "year_end" INTEGER,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuel_type" "FuelType",
    "engine_cc" INTEGER,
    "registration_number" TEXT,
    "registration_document_url" TEXT,
    "vin" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_user_id_key" ON "client_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "store_profiles_user_id_key" ON "store_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "professional_profiles_user_id_key" ON "professional_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_profiles" ADD CONSTRAINT "store_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
