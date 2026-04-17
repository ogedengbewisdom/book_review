import { Expose } from 'class-transformer';

export class ReviewResponseDto {
  @Expose()
  name: string;

  @Expose({ name: 'book_title' })
  title: string;

  @Expose({ name: 'review_rating' })
  rating: number;

  @Expose({ name: 'review_comment' })
  comment: string;
}
