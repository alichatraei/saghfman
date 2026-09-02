ALTER TABLE "Banner" ADD COLUMN "message" TEXT;
ALTER TABLE "Banner" ADD COLUMN "variant" TEXT NOT NULL DEFAULT 'info';
ALTER TABLE "Banner" ADD COLUMN "ctaLabel" TEXT;
ALTER TABLE "Banner" ADD COLUMN "dismissible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Banner" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Banner" ALTER COLUMN "imageUrl" DROP NOT NULL;
ALTER TABLE "Banner" ALTER COLUMN "position" SET DEFAULT 'home-top';

DROP INDEX IF EXISTS "Banner_position_isActive_idx";
CREATE INDEX "Banner_position_isActive_startsAt_endsAt_idx"
  ON "Banner"("position", "isActive", "startsAt", "endsAt");
