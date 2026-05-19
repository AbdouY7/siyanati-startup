-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_type" "FavoriteTarget" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorites_user_id_target_type_idx" ON "favorites"("user_id", "target_type");

-- CreateIndex
CREATE INDEX "favorites_target_id_target_type_idx" ON "favorites"("target_id", "target_type");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_target_id_target_type_key" ON "favorites"("user_id", "target_id", "target_type");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
