import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'The rating of the review',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'The comment of the review',
    example: 'This is a great book',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
