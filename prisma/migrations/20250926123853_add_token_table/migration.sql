-- AlterTable
ALTER TABLE "public"."Token" ADD COLUMN     "type" "public"."TokenType" NOT NULL DEFAULT 'REFRESH';
