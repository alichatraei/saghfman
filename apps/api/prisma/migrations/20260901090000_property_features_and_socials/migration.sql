-- CreateEnum
CREATE TYPE "HeatingType" AS ENUM ('PACKAGE', 'HEATER', 'CENTRAL', 'FLOOR_HEATING', 'NONE');
CREATE TYPE "CoolingType" AS ENUM ('SPLIT', 'EVAPORATIVE', 'CENTRAL', 'NONE');
CREATE TYPE "CabinetType" AS ENUM ('MDF', 'METAL', 'WOOD', 'OTHER');
CREATE TYPE "FloorMaterial" AS ENUM ('CARPET', 'CERAMIC', 'PARQUET', 'STONE', 'OTHER');
CREATE TYPE "WallMaterial" AS ENUM ('WALLPAPER', 'PAINT', 'OTHER');

-- AlterTable: Property feature columns
ALTER TABLE "Property" ADD COLUMN "hallArea" INTEGER;
ALTER TABLE "Property" ADD COLUMN "heating" "HeatingType";
ALTER TABLE "Property" ADD COLUMN "cooling" "CoolingType";
ALTER TABLE "Property" ADD COLUMN "cabinet" "CabinetType";
ALTER TABLE "Property" ADD COLUMN "floorMaterial" "FloorMaterial";
ALTER TABLE "Property" ADD COLUMN "wallMaterial" "WallMaterial";

-- AlterTable: company messaging channels
ALTER TABLE "CompanySetting" ADD COLUMN "whatsappLink" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "rubika" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "bale" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "eitaa" TEXT;
