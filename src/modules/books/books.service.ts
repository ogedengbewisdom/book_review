import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums';
import { PaginationDto } from '../../common/interface/interfaces';
import { plainToInstance } from 'class-transformer';
import { BookResponseDto } from './dto/book.response.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private bookRepository: Repository<Book>,
  ) {}
  async create(createBookDto: CreateBookDto, author: number) {
    // return 'This action adds a new book';
    try {
      const book = this.bookRepository.create({ ...createBookDto, author });
      await this.bookRepository.save(book);
      return book.id;
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create book');
    }
  }

  // Get all books, including those without reviews. Show book title, author, and total number of reviews.
  // Expected columns: book.title, book.author, review_count (Aggregation)

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;

    const skip = (page - 1) * limit;
    try {
      const queryBuilder = this.bookRepository
        .createQueryBuilder('book')
        .leftJoin('book.reviews', 'reviews')
        .leftJoin('book.user', 'user')
        .select([
          'book.title',
          "CONCAT(user.first_name, ' ', user.last_name) AS author",
          'COUNT(reviews.id) AS review_count',
        ])
        .orderBy('book.created_at', 'DESC')
        .groupBy('book.id')
        .addGroupBy('user.first_name')
        .addGroupBy('user.last_name')
        .skip(skip)
        .take(limit);

      const [books, total] = await Promise.all([
        queryBuilder.getRawMany(),
        queryBuilder.getCount(),
      ]);

      return {
        books: plainToInstance(BookResponseDto, books, {
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
        error.message || 'Failed to get books',
      );
    }
  }

  async findOne(id: number) {
    try {
      const book = await this.bookRepository.findOne({
        where: { id },
        relations: ['user'],
        select: {
          id: true,
          title: true,
          description: true,
          published_year: true,
          created_at: true,
          user: {
            first_name: true,
            last_name: true,
          },
        },
      });

      if (!book) throw new NotFoundException(`Book with id ${id} not found`);
      const { user, deleted_at, ...rest } = book;
      return { ...rest, author: `${user.first_name} ${user.last_name}` };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to get book',
      );
    }
  }

  async update(
    id: number,
    updateBookDto: UpdateBookDto,
    user_role: UserRole,
    user_id: number,
  ) {
    try {
      const book = await this.bookRepository.findOne({
        where: { id },
        select: { id: true, author: true },
      });
      if (!book) throw new NotFoundException(`Book with id ${id} not found`);

      const is_authorized =
        book.author === user_id || user_role === UserRole.ADMIN;
      if (!is_authorized)
        throw new ForbiddenException('You are not allowed to update this book');

      await this.bookRepository.update(id, updateBookDto);
      return book.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to update book',
      );
    }
  }

  async remove(id: number, user_role: UserRole, user_id: number) {
    try {
      const book = await this.bookRepository.findOne({
        where: { id },
        select: { id: true, author: true },
      });
      if (!book) throw new NotFoundException(`Book with id ${id} not found`);

      const is_authorized =
        book.author === user_id || user_role === UserRole.ADMIN;
      if (!is_authorized)
        throw new ForbiddenException('You are not allowed to delete this book');

      await this.bookRepository.softDelete(id);
      return book.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to delete book',
      );
    }
  }

  async restore_deleted_book(id: number) {
    try {
      const book = await this.bookRepository.findOne({
        where: { id },
        withDeleted: true,
        select: { id: true, author: true, deleted_at: true },
      });
      if (!book) throw new NotFoundException(`Book with id ${id} not found`);

      if (!book.deleted_at)
        throw new BadRequestException('Book is not deleted');

      await this.bookRepository.restore(id);
      return book.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to restore deleted book',
      );
    }
  }
}
