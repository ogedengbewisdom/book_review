import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './modules/users/entities/user.entity';
import { Book } from './modules/books/entities/book.entity';
import { Review } from './modules/reviews/entities/review.entity';
dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '1234',
  database: process.env.DB_NAME ?? 'book_review_db',
  entities: [User, Book, Review],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
