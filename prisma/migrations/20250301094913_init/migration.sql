-- CreateEnum
CREATE TYPE "auth_types" AS ENUM ('PASSWORD', 'TWO_FACTOR', 'PASSKEY', 'MAGIC_LINK');

-- CreateEnum
CREATE TYPE "providers" AS ENUM ('DISCORD');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "password" TEXT,
    "token_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registered_providers" (
    "user_id" VARCHAR(36) NOT NULL,
    "email" TEXT,
    "provider" "providers" NOT NULL,

    CONSTRAINT "registered_providers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkeys" (
    "id" TEXT NOT NULL,
    "public_key" BYTEA NOT NULL,
    "user_id" TEXT NOT NULL,
    "webauthn_user_id" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "device_type" VARCHAR(12) NOT NULL,
    "backed_up" BOOLEAN NOT NULL,
    "transports" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_auth" (
    "user_id" TEXT NOT NULL,
    "secret" VARCHAR(64) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registered_providers_email_provider_key" ON "registered_providers"("email", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_user_id_key" ON "email_verifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "passkeys_user_id_webauthn_user_id_key" ON "passkeys"("user_id", "webauthn_user_id");

-- AddForeignKey
ALTER TABLE "registered_providers" ADD CONSTRAINT "registered_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
