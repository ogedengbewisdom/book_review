import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRatingAndCommentToReviews1776228619204 implements MigrationInterface {
    name = 'AddRatingAndCommentToReviews1776228619204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ADD "rating" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD "comment" text`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "CHK_e87bbcfbe3ea0dda3d626010ee" CHECK ("rating" >= 1 AND "rating" <= 5)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "CHK_e87bbcfbe3ea0dda3d626010ee"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "comment"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "rating"`);
    }

}
