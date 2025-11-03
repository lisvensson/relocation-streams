ALTER TABLE "relocation" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;
ALTER TABLE "relocation" DROP CONSTRAINT "relocation_pkey"