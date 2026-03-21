import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774121897624 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE users
      SET role = 'admin'
      WHERE email = 'admin@example.com'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE users
      SET role = 'buyer'
      WHERE email = 'admiin@example.com'
    `);
  }
}
