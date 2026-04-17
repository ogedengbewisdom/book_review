import { MigrationInterface, QueryRunner } from "typeorm";

export class BookDescriptionType1776359996514 implements MigrationInterface {
    name = 'BookDescriptionType1776359996514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "books" ADD "description" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "books" ADD "description" character varying NOT NULL`);
    }

}
