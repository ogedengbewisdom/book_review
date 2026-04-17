import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToBooks1776228201936 implements MigrationInterface {
    name = 'AddFieldsToBooks1776228201936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" ADD "published_year" integer`);
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_4675aad2c57a7a793d26afbae99"`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "author" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_4675aad2c57a7a793d26afbae99" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_4675aad2c57a7a793d26afbae99"`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "author" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_4675aad2c57a7a793d26afbae99" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "published_year"`);
    }

}
