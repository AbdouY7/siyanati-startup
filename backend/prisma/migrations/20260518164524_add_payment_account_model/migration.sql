-- CreateTable
CREATE TABLE "payment_accounts" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL DEFAULT 'Compte CCP',
    "ccp_code" TEXT NOT NULL,
    "ccp_key" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_accounts_client_id_is_active_idx" ON "payment_accounts"("client_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "payment_accounts_client_id_ccp_code_key" ON "payment_accounts"("client_id", "ccp_code");

-- AddForeignKey
ALTER TABLE "payment_accounts" ADD CONSTRAINT "payment_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
