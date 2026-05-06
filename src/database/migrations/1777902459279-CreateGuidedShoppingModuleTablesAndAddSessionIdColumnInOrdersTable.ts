import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGuidedShoppingModuleTablesAndAddSessionIdColumnInOrdersTable1777902459279 implements MigrationInterface {
    name = 'CreateGuidedShoppingModuleTablesAndAddSessionIdColumnInOrdersTable1777902459279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."chat_messages_role_enum" AS ENUM('USER', 'BOT', 'SYSTEM')`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sessionId" uuid NOT NULL, "role" "public"."chat_messages_role_enum" NOT NULL, "content" text NOT NULL, "metadata" text, "tokenUsage" jsonb, "correlationId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a82476a8acdd6cd6936378cb72" ON "chat_messages" ("sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a6f359922fb93e42d1b2daf38d" ON "chat_messages" ("createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."chat_sessions_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'EXPIRED', 'ABANDONED')`);
        await queryRunner.query(`CREATE TABLE "chat_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "buyerId" uuid, "status" "public"."chat_sessions_status_enum" NOT NULL DEFAULT 'ACTIVE', "contextVersion" integer NOT NULL DEFAULT '1', "expiresAt" TIMESTAMP NOT NULL, "metadata" jsonb DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_efc151a4aafa9a28b73dedc485f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_87ea4fe55a2e6142d37911f04b" ON "chat_sessions" ("buyerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f35c213237ac2a79ae1f109ffa" ON "chat_sessions" ("buyerId", "status") `);
        await queryRunner.query(`CREATE TABLE "shopping_intents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sessionId" uuid NOT NULL, "categoryId" uuid, "budgetLimit" numeric(10,2), "preferredBrands" text array, "features" jsonb DEFAULT '{}', "extractionConfidence" double precision NOT NULL DEFAULT '0', "version" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_a935ac62124533850d6d62a2a3" UNIQUE ("sessionId"), CONSTRAINT "PK_dc4c748b02c60258800f4bbd7e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recommendation_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sessionId" uuid NOT NULL, "zeroResultReason" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_299e10f3c5de37118dd78c019a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c2ed0187bf9466b3038248d916" ON "recommendation_sessions" ("sessionId") `);
        await queryRunner.query(`CREATE TABLE "recommended_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recommendationSessionId" uuid NOT NULL, "productId" uuid NOT NULL, "rankingScore" double precision NOT NULL, "reasoning" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d9ac83c2577f160e6081ff44ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."prompt_templates_type_enum" AS ENUM('SYSTEM_PROMPT', 'CLARIFICATION', 'RECOMMENDATION_REASONING')`);
        await queryRunner.query(`CREATE TABLE "prompt_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."prompt_templates_type_enum" NOT NULL, "content" text NOT NULL, "version" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d8621cc428ff586db3e3a8f5b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chatbot_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminId" uuid NOT NULL, "entityId" uuid, "action" character varying NOT NULL, "oldValue" jsonb NOT NULL, "newValue" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b4c628b476451d3220c2c6cbd8b" PRIMARY KEY ("id")); COMMENT ON COLUMN "chatbot_audit_logs"."entityId" IS 'ID of the Rule or Prompt being modified'`);
        await queryRunner.query(`CREATE INDEX "IDX_16dd3224a6129d3c91edd6d059" ON "chatbot_audit_logs" ("entityId") `);
        await queryRunner.query(`CREATE TABLE "chatbot_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "conditions" jsonb NOT NULL, "actions" jsonb NOT NULL, "priority" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ff7ad852f35898cb40fad5d62b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chatbot_interactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sessionId" character varying NOT NULL, "promptTemplateId" uuid NOT NULL, "isZeroResult" boolean NOT NULL DEFAULT false, "userIntent" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0d4ee2b6daa14ebf2a6e079903a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "chatbotSessionId" uuid`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."chatbotSessionId" IS 'Links this order to a chatbot session for conversion tracking'`);
        await queryRunner.query(`CREATE INDEX "IDX_4328408728ef5341cebd1fbbe1" ON "orders" ("chatbotSessionId") `);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_a82476a8acdd6cd6936378cb72d" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_sessions" ADD CONSTRAINT "FK_87ea4fe55a2e6142d37911f04b8" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shopping_intents" ADD CONSTRAINT "FK_a935ac62124533850d6d62a2a3d" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shopping_intents" ADD CONSTRAINT "FK_20524b154fce5ab3f42184c2f07" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommendation_sessions" ADD CONSTRAINT "FK_c2ed0187bf9466b3038248d9168" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommended_products" ADD CONSTRAINT "FK_c4b43f3e1a84276b2a56b397923" FOREIGN KEY ("recommendationSessionId") REFERENCES "recommendation_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommended_products" ADD CONSTRAINT "FK_10a9e613047cfb3d7500f07f8c2" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chatbot_audit_logs" ADD CONSTRAINT "FK_0a4a5a1a093c1bbd7e89772093f" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chatbot_interactions" ADD CONSTRAINT "FK_282dae8555db2e495db3e8a89d2" FOREIGN KEY ("promptTemplateId") REFERENCES "prompt_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chatbot_interactions" DROP CONSTRAINT "FK_282dae8555db2e495db3e8a89d2"`);
        await queryRunner.query(`ALTER TABLE "chatbot_audit_logs" DROP CONSTRAINT "FK_0a4a5a1a093c1bbd7e89772093f"`);
        await queryRunner.query(`ALTER TABLE "recommended_products" DROP CONSTRAINT "FK_10a9e613047cfb3d7500f07f8c2"`);
        await queryRunner.query(`ALTER TABLE "recommended_products" DROP CONSTRAINT "FK_c4b43f3e1a84276b2a56b397923"`);
        await queryRunner.query(`ALTER TABLE "recommendation_sessions" DROP CONSTRAINT "FK_c2ed0187bf9466b3038248d9168"`);
        await queryRunner.query(`ALTER TABLE "shopping_intents" DROP CONSTRAINT "FK_20524b154fce5ab3f42184c2f07"`);
        await queryRunner.query(`ALTER TABLE "shopping_intents" DROP CONSTRAINT "FK_a935ac62124533850d6d62a2a3d"`);
        await queryRunner.query(`ALTER TABLE "chat_sessions" DROP CONSTRAINT "FK_87ea4fe55a2e6142d37911f04b8"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_a82476a8acdd6cd6936378cb72d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4328408728ef5341cebd1fbbe1"`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."chatbotSessionId" IS 'Links this order to a chatbot session for conversion tracking'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "chatbotSessionId"`);
        await queryRunner.query(`DROP TABLE "chatbot_interactions"`);
        await queryRunner.query(`DROP TABLE "chatbot_rules"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16dd3224a6129d3c91edd6d059"`);
        await queryRunner.query(`DROP TABLE "chatbot_audit_logs"`);
        await queryRunner.query(`DROP TABLE "prompt_templates"`);
        await queryRunner.query(`DROP TYPE "public"."prompt_templates_type_enum"`);
        await queryRunner.query(`DROP TABLE "recommended_products"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2ed0187bf9466b3038248d916"`);
        await queryRunner.query(`DROP TABLE "recommendation_sessions"`);
        await queryRunner.query(`DROP TABLE "shopping_intents"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f35c213237ac2a79ae1f109ffa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87ea4fe55a2e6142d37911f04b"`);
        await queryRunner.query(`DROP TABLE "chat_sessions"`);
        await queryRunner.query(`DROP TYPE "public"."chat_sessions_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a6f359922fb93e42d1b2daf38d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a82476a8acdd6cd6936378cb72"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TYPE "public"."chat_messages_role_enum"`);
    }

}
