import { Expose, Transform } from 'class-transformer';

export class BookResponseDto {
  @Expose({ name: 'book_title' })
  title: string;

  @Expose()
  author: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  review_count: number;
}
