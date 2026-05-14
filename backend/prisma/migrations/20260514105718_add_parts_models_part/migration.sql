-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon_url" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "seller_type" "SellerType" NOT NULL,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "oem_reference" TEXT,
    "condition" "PartCondition" NOT NULL DEFAULT 'new',
    "price_dzd" DECIMAL(12,2) NOT NULL,
    "stock_qty" INTEGER NOT NULL DEFAULT 1,
    "weight_kg" DECIMAL(6,2),
    "images" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verified_by_admin_id" TEXT,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_compatibility" (
    "id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "year_from" INTEGER NOT NULL,
    "year_to" INTEGER,
    "engine_variant" TEXT,

    CONSTRAINT "part_compatibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "parts_seller_id_seller_type_idx" ON "parts"("seller_id", "seller_type");

-- CreateIndex
CREATE INDEX "parts_category_id_idx" ON "parts"("category_id");

-- CreateIndex
CREATE INDEX "parts_condition_price_dzd_idx" ON "parts"("condition", "price_dzd");

-- CreateIndex
CREATE INDEX "parts_is_verified_is_active_idx" ON "parts"("is_verified", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "parts_seller_id_sku_key" ON "parts"("seller_id", "sku");

-- CreateIndex
CREATE INDEX "part_compatibility_part_id_idx" ON "part_compatibility"("part_id");

-- CreateIndex
CREATE INDEX "part_compatibility_brand_id_model_id_year_from_idx" ON "part_compatibility"("brand_id", "model_id", "year_from");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_compatibility" ADD CONSTRAINT "part_compatibility_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_compatibility" ADD CONSTRAINT "part_compatibility_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_compatibility" ADD CONSTRAINT "part_compatibility_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
