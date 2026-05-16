-- CreateTable
CREATE TABLE "diagnostic_posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "brand_id" TEXT,
    "model_id" TEXT,
    "year" INTEGER,
    "fuel_type" "FuelType",
    "status" "PostStatus" NOT NULL DEFAULT 'open',
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "saves_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_by_admin_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "body" TEXT NOT NULL,
    "images" TEXT[],
    "is_accepted_answer" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_saves" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_saves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_reactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_type" "ReactionTarget" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" TEXT,
    "comment_id" TEXT,

    CONSTRAINT "diagnostic_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diagnostic_posts_author_id_idx" ON "diagnostic_posts"("author_id");

-- CreateIndex
CREATE INDEX "diagnostic_posts_brand_id_model_id_idx" ON "diagnostic_posts"("brand_id", "model_id");

-- CreateIndex
CREATE INDEX "diagnostic_posts_status_idx" ON "diagnostic_posts"("status");

-- CreateIndex
CREATE INDEX "diagnostic_posts_created_at_idx" ON "diagnostic_posts"("created_at");

-- CreateIndex
CREATE INDEX "diagnostic_comments_post_id_parent_id_idx" ON "diagnostic_comments"("post_id", "parent_id");

-- CreateIndex
CREATE INDEX "diagnostic_comments_author_id_idx" ON "diagnostic_comments"("author_id");

-- CreateIndex
CREATE INDEX "diagnostic_saves_post_id_idx" ON "diagnostic_saves"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_saves_user_id_post_id_key" ON "diagnostic_saves"("user_id", "post_id");

-- CreateIndex
CREATE INDEX "diagnostic_reactions_target_type_target_id_idx" ON "diagnostic_reactions"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_reactions_user_id_post_id_key" ON "diagnostic_reactions"("user_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_reactions_user_id_comment_id_key" ON "diagnostic_reactions"("user_id", "comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_reactions_user_id_target_id_target_type_key" ON "diagnostic_reactions"("user_id", "target_id", "target_type");

-- AddForeignKey
ALTER TABLE "diagnostic_posts" ADD CONSTRAINT "diagnostic_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_posts" ADD CONSTRAINT "diagnostic_posts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_posts" ADD CONSTRAINT "diagnostic_posts_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_posts" ADD CONSTRAINT "diagnostic_posts_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_comments" ADD CONSTRAINT "diagnostic_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "diagnostic_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_comments" ADD CONSTRAINT "diagnostic_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_comments" ADD CONSTRAINT "diagnostic_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "diagnostic_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_saves" ADD CONSTRAINT "diagnostic_saves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_saves" ADD CONSTRAINT "diagnostic_saves_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "diagnostic_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_reactions" ADD CONSTRAINT "diagnostic_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_reactions" ADD CONSTRAINT "diagnostic_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "diagnostic_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_reactions" ADD CONSTRAINT "diagnostic_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "diagnostic_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
