import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'The Great Gatsby',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the book',
    example: 'A great book about the life of a man',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The published year of the book',
    example: 1925,
  })
  @IsNumber()
  published_year: number;
}
