import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNewsLetterSubscriptionTable1777025889651 implements MigrationInterface {
    name = 'CreateNewsLetterSubscriptionTable1777025889651'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "newsletter_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "isSubscribed" boolean NOT NULL DEFAULT true, "userId" uuid, "fcmToken" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_57fd53bd8b39fe19d2be8136f64" UNIQUE ("email"), CONSTRAINT "PK_cfca9a6e4f146a80a6cd2e76f1d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "newsletter_subscriptions"`);
    }

}
