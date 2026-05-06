import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewFieldInShoppingIntentEntity1778073183323 implements MigrationInterface {
    name = 'AddNewFieldInShoppingIntentEntity1778073183323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shopping_intents" ADD "productIdentifier" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shopping_intents" DROP COLUMN "productIdentifier"`);
    }

}
