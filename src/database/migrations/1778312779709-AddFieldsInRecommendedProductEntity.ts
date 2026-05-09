import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsInRecommendedProductEntity1778312779709 implements MigrationInterface {
    name = 'AddFieldsInRecommendedProductEntity1778312779709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommended_products" ADD "name" text`);
        await queryRunner.query(`ALTER TABLE "recommended_products" ADD "imageUrl" text`);
        await queryRunner.query(`ALTER TABLE "recommended_products" ADD "price" numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommended_products" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "recommended_products" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "recommended_products" DROP COLUMN "name"`);
    }

}
