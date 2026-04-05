import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductAndVariantAndInventoryAndCategoryTables1775412741971 implements MigrationInterface {
    name = 'CreateProductAndVariantAndInventoryAndCategoryTables1775412741971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(150) NOT NULL, "parentId" uuid, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_9a6f051e66982b5f0318981bca" ON "categories" ("parentId") `);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "description" text, "categoryId" uuid NOT NULL, "isPublished" boolean NOT NULL DEFAULT false, "status" "public"."products_status_enum" NOT NULL DEFAULT 'draft', "basePrice" numeric(10,2), "slug" character varying NOT NULL, "imageUrl" character varying NOT NULL, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ff56834e735fa78a15d0cf2192" ON "products" ("categoryId") `);
        await queryRunner.query(`CREATE INDEX "IDX_43d8624578b8830f470560dc49" ON "products" ("isPublished") `);
        await queryRunner.query(`CREATE INDEX "IDX_464f927ae360106b783ed0b410" ON "products" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_0e7d4a08839e3c60dea61e6442" ON "products" ("isPublished", "categoryId", "basePrice") `);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "variantId" uuid NOT NULL, "stock" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_c543b38cb9c82610bd0848862f4" UNIQUE ("variantId"), CONSTRAINT "REL_c543b38cb9c82610bd0848862f" UNIQUE ("variantId"), CONSTRAINT "CHK_436f066deebd771e5b88d0a061" CHECK ("stock" >= 0), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c543b38cb9c82610bd0848862f" ON "inventory" ("variantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7daff23230423fa09bb00a640f" ON "inventory" ("variantId", "stock") `);
        await queryRunner.query(`CREATE TABLE "variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "productId" uuid NOT NULL, "sku" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "attributes" jsonb, CONSTRAINT "UQ_product_sku" UNIQUE ("productId", "sku"), CONSTRAINT "PK_672d13d1a6de0197f20c6babb5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_36c4c7a3b994abc268f8ebbf48" ON "variants" ("sku") `);
        await queryRunner.query(`CREATE INDEX "IDX_95b8a348083fe0886116332fde" ON "variants" ("productId", "price") `);
        await queryRunner.query(`CREATE INDEX "IDX_bdbfe33a28befefa9723c35503" ON "variants" ("productId") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_c543b38cb9c82610bd0848862f4" FOREIGN KEY ("variantId") REFERENCES "variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "variants" ADD CONSTRAINT "FK_bdbfe33a28befefa9723c355036" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variants" DROP CONSTRAINT "FK_bdbfe33a28befefa9723c355036"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_c543b38cb9c82610bd0848862f4"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bdbfe33a28befefa9723c35503"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_95b8a348083fe0886116332fde"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36c4c7a3b994abc268f8ebbf48"`);
        await queryRunner.query(`DROP TABLE "variants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7daff23230423fa09bb00a640f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c543b38cb9c82610bd0848862f"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e7d4a08839e3c60dea61e6442"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_464f927ae360106b783ed0b410"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_43d8624578b8830f470560dc49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff56834e735fa78a15d0cf2192"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a6f051e66982b5f0318981bca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
