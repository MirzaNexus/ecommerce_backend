import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRecommendationTables1777531827682 implements MigrationInterface {
    name = 'CreateRecommendationTables1777531827682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_category_affinity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "category_id" uuid NOT NULL, "view_count" integer NOT NULL DEFAULT '0', "add_to_cart_count" integer NOT NULL DEFAULT '0', "purchase_count" integer NOT NULL DEFAULT '0', "affinity_score" double precision NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6771037efbe284a3c30cb521649" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6914c4c8c46dfe35b5ae71cd20" ON "user_category_affinity" ("user_id", "category_id") `);
        await queryRunner.query(`CREATE TABLE "recommendation_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "enabled" boolean NOT NULL DEFAULT true, "related_products_limit" integer NOT NULL DEFAULT '20', "price_similarity_factor" double precision NOT NULL DEFAULT '1', "category_priority_enabled" boolean NOT NULL DEFAULT true, "version" integer NOT NULL, "fallback_enabled" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_71ca9cfa20c6547aa30ef8a68cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_47d4b1b092f363caf5c3fbe422" ON "recommendation_settings" ("enabled") `);
        await queryRunner.query(`CREATE TYPE "public"."recommendation_events_event_type_enum" AS ENUM('View', 'ADD_TO_CART', 'PAID_ORDER')`);
        await queryRunner.query(`CREATE TABLE "recommendation_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "product_id" uuid NOT NULL, "category_id" uuid NOT NULL, "event_type" "public"."recommendation_events_event_type_enum" NOT NULL, "price_at_event" numeric(10,2), "quantity" integer NOT NULL DEFAULT '1', "session_id" character varying, "idempotency_key" character varying NOT NULL, "algolia_payload" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_db50d84ce47c8a64d6ef040609c" UNIQUE ("idempotency_key"), CONSTRAINT "PK_f383c8576d8b5738d6c12ddb137" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_423042caad9729523ae3e9f870" ON "recommendation_events" ("product_id", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_394d80bcfe97c34aef1cea0298" ON "recommendation_events" ("user_id", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_394d80bcfe97c34aef1cea0298"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_423042caad9729523ae3e9f870"`);
        await queryRunner.query(`DROP TABLE "recommendation_events"`);
        await queryRunner.query(`DROP TYPE "public"."recommendation_events_event_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_47d4b1b092f363caf5c3fbe422"`);
        await queryRunner.query(`DROP TABLE "recommendation_settings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6914c4c8c46dfe35b5ae71cd20"`);
        await queryRunner.query(`DROP TABLE "user_category_affinity"`);
    }

}
