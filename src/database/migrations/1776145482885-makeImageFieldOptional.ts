import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeImageFieldOptional1776145482885 implements MigrationInterface {
    name = 'MakeImageFieldOptional1776145482885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variants" ADD "imageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "imageUrl" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "imageUrl" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "variants" DROP COLUMN "imageUrl"`);
    }

}
