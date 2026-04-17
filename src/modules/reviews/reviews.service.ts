import {
  HttpException,
  NotFoundException,
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums';
import { PaginationDto } from '../../common/interface/interfaces';
import { plainToInstance } from 'class-transformer';
import { ReviewResponseDto } from './dto/reviews.res.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
  ) {}
  async create(
    createReviewDto: CreateReviewDto,
    book_id: number,
    user_id: number,
  ) {
    try {
      const review = this.reviewRepository.create({
        ...createReviewDto,
        book_id,
        user_id,
      });
      await this.reviewRepository.save(review);
      return {
        id: review.id,
        book_id: review.book_id,
        comment: review.comment,
        rating: review.rating,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to create review',
      );
    }
  }

  // Expected columns: user.name, book.title, reviews.rating, reviews.comment

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;

    const skip = (page - 1) * limit;
    try {
      const queryBuilder = this.reviewRepository
        .createQueryBuilder('review')
        .innerJoin('review.book', 'book')
        .innerJoin('review.user', 'user')
        .select([
          "CONCAT(user.first_name, ' ', user.last_name) AS name",
          'book.title',
          'review.rating',
          'review.comment',
        ])
        .orderBy('review.created_at', 'DESC')
        .skip(skip)
        .take(limit);
      // .getRawMany();

      const [reviews, total] = await Promise.all([
        queryBuilder.getRawMany(),
        queryBuilder.getCount(),
      ]);

      return {
        reviews: plainToInstance(ReviewResponseDto, reviews, {
          excludeExtraneousValues: true,
        }),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to get reviews',
      );
    }
  }

  async findOne(id: number) {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
        relations: ['book', 'user'],
        select: {
          id: true,
          comment: true,
          rating: true,
          book: {
            title: true,
          },
          user: {
            first_name: true,
            last_name: true,
          },
        },
      });

      if (!review)
        throw new NotFoundException(`Review with id ${id} not found`);
      return {
        id: review.id,
        book_title: review.book.title,
        user_name: `${review.user.first_name} ${review.user.last_name}`,
        comment: review.comment,
        rating: review.rating,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to get review',
      );
    }
  }

  async update(id: number, updateReviewDto: UpdateReviewDto, user_id: number) {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
      });

      if (!review)
        throw new NotFoundException(`Review with id ${id} not found`);

      const is_authorized = review.user_id === user_id;
      if (!is_authorized)
        throw new ForbiddenException(
          'You are not allowed to update this review',
        );

      await this.reviewRepository.update(id, updateReviewDto);
      return review.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to update review',
      );
    }
  }

  async remove(id: number, user_id: number, user_role: UserRole) {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
      });

      if (!review)
        throw new NotFoundException(`Review with id ${id} not found`);

      const is_authorized =
        review.user_id === user_id || user_role === UserRole.ADMIN;
      if (!is_authorized)
        throw new ForbiddenException(
          'You are not allowed to remove this review',
        );

      await this.reviewRepository.softDelete(id);
      return review.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to remove review',
      );
    }
  }

  async restore_deleted_review(id: number) {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
        withDeleted: true,
        select: { id: true, deleted_at: true },
      });

      if (!review)
        throw new NotFoundException(`Review with id ${id} not found`);

      if (!review.deleted_at)
        throw new BadRequestException('Review is not deleted');

      await this.reviewRepository.restore(id);
      return review.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to restore deleted review',
      );
    }
  }
}
