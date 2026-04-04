import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRefreshTokenEntity1774032911820 implements MigrationInterface {
  name = 'UpdateRefreshTokenEntity1774032911820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // STEP 1: Column ko nullable add karo
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD "device_id" character varying(255)
        `);

    // STEP 2: Existing data ko fill karo
    await queryRunner.query(`
            UPDATE "refresh_tokens"
            SET "device_id" = 'unknown_device'
            WHERE "device_id" IS NULL
        `);

    // STEP 3: Ab NOT NULL constraint lagao
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ALTER COLUMN "device_id" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback (agar migration undo karni ho)
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            DROP COLUMN "device_id"
        `);
  }
}
