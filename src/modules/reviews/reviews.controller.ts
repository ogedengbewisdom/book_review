import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ParseParamPipe } from '../../common/pipes/parse-param/parse-param.pipe';
import { UserRole } from '../../common/enums';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorator/public/public.decorator';
import { RoleGuard } from '../../common/guard/role/role.guard';
import { Roles } from '../../common/decorator/roles/roles.decorator';
import { PaginationDto } from '../../common/interface/interfaces';

@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @Post('book/:book_id')
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @Param('book_id', ParseParamPipe) book_id: number,
    @Req() req,
  ) {
    const user_id = req.user.sub as number;
    const result = await this.reviewsService.create(
      createReviewDto,
      book_id,
      user_id,
    );
    return {
      message: 'Review created successfully',
      data: result,
    };
  }

  @Public()
  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const reviews = await this.reviewsService.findAll(pagination);
    return {
      message: 'Reviews fetched successfully',
      data: reviews,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseParamPipe) id: number) {
    const result = await this.reviewsService.findOne(id);
    return {
      message: 'Review fetched successfully',
      data: result,
    };
  }

  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id', ParseParamPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req,
  ) {
    const user_id = req.user.sub as number;
    const result = await this.reviewsService.update(
      id,
      updateReviewDto,
      user_id,
    );
    return {
      message: 'Review updated successfully',
      data: result,
    };
  }

  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id', ParseParamPipe) id: number, @Req() req) {
    const user_id = req.user.sub as number;
    const user_role = req.user.role as UserRole;
    const result = await this.reviewsService.remove(id, user_id, user_role);
    return {
      message: 'Review removed successfully',
      data: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/restore')
  async restore_deleted_review(@Param('id', ParseParamPipe) id: number) {
    const result = await this.reviewsService.restore_deleted_review(id);
    return {
      message: 'Review restored successfully',
      data: result,
    };
  }
}
