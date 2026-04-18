import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { RoleGuard } from '../../common/guard/role/role.guard';
import { Roles } from '../../common/decorator/roles/roles.decorator';
import { UserRole } from '../../common/enums';
import { ParseParamPipe } from '../../common/pipes/parse-param/parse-param.pipe';
import { Public } from '../../common/decorator/public/public.decorator';
import { PaginationDto } from '../../common/interface/interfaces';

@Controller({ path: 'books', version: '1' })
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiBody({ type: CreateBookDto })
  @UseGuards(RoleGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @Post()
  async create(@Body() createBookDto: CreateBookDto, @Req() req) {
    const author = req.user.sub as number;
    const result = await this.booksService.create(createBookDto, author);
    return {
      message: 'Book created successfully',
      data: result,
    };
  }

  @Public()
  @ApiQuery({ name: 'pagination', type: PaginationDto })
  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.booksService.findAll(pagination);
    return {
      message: 'Books fetched successfully',
      data: result,
    };
  }

  @Public()
  @ApiQuery({ name: 'pagination', type: PaginationDto })
  @Get(':id')
  async findOne(
    @Param('id', ParseParamPipe) id: number,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.booksService.findOne(id, pagination);
    return {
      message: 'Book fetched successfully',
      data: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseParamPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @Req() req,
  ) {
    const user_role = req.user.role as UserRole;
    const user_id = req.user.sub as number;
    const result = await this.booksService.update(
      id,
      updateBookDto,
      user_role,
      user_id,
    );
    return {
      message: 'Book updated successfully',
      data: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseParamPipe) id: number, @Req() req) {
    const user_role = req.user.role as UserRole;
    const user_id = req.user.sub as number;
    const result = await this.booksService.remove(id, user_role, user_id);
    return {
      message: 'Book deleted successfully',
      data: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/restore')
  async restore_deleted_book(@Param('id', ParseParamPipe) id: number) {
    const result = await this.booksService.restore_deleted_book(id);
    return {
      message: 'Book restored successfully',
      data: result,
    };
  }
}
