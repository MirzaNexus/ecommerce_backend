import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndUserAddresses1772654781390 implements MigrationInterface {
    name = 'CreateUserAndUserAddresses1772654781390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_addresses_type_enum" AS ENUM('shipping', 'billing')`);
        await queryRunner.query(`CREATE TABLE "user_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" "public"."user_addresses_type_enum" NOT NULL, "line1" character varying(255) NOT NULL, "line2" character varying(255), "city" character varying(100) NOT NULL, "state" character varying(100), "postal_code" character varying(20), "country" character varying(100) NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8abbeb5e3239ff7877088ffc25b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "ux_user_default_address" ON "user_addresses" ("user_id", "type") WHERE "is_default" = true`);
        await queryRunner.query(`CREATE INDEX "idx_user_addresses_user_id" ON "user_addresses" ("user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'suspended')`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'buyer')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "auth_user_id" uuid, "first_name" character varying(100) NOT NULL, "last_name" character varying(100), "email" character varying(255) NOT NULL, "phone" character varying(20), "avatar_url" text, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "role" "public"."users_role_enum" NOT NULL DEFAULT 'buyer', "deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8d4681a2d24fe0a272f0f6cce7f" UNIQUE ("auth_user_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "ux_users_email_active" ON "users" ("email") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "ux_users_phone_active" ON "users" ("phone") WHERE "deleted_at" IS NULL AND phone IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_users_deleted_null" ON "users" ("id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users" ("role") `);
        await queryRunner.query(`CREATE INDEX "idx_users_status" ON "users" ("status") `);
        await queryRunner.query(`ALTER TABLE "user_addresses" ADD CONSTRAINT "FK_7a5100ce0548ef27a6f1533a5ce" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_addresses" DROP CONSTRAINT "FK_7a5100ce0548ef27a6f1533a5ce"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_role"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_deleted_null"`);
        await queryRunner.query(`DROP INDEX "public"."ux_users_phone_active"`);
        await queryRunner.query(`DROP INDEX "public"."ux_users_email_active"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_addresses_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."ux_user_default_address"`);
        await queryRunner.query(`DROP TABLE "user_addresses"`);
        await queryRunner.query(`DROP TYPE "public"."user_addresses_type_enum"`);
    }

}
