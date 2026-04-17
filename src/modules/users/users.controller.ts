import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from '../../common/guard/role/role.guard';
import { Roles } from '../../common/decorator/roles/roles.decorator';
import { UserRole } from '../../common/enums';
import { ParseParamPipe } from 'src/common/pipes/parse-param/parse-param.pipe';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AssignRoleDto } from './dto/assign.role.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: 'Users fetched successfully',
      data: users,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseParamPipe) id: number, @Req() req) {
    const user_role = req.user.role as UserRole;
    const user_id = req.user.sub as number;
    const user = await this.usersService.findOneById(id, user_role, user_id);
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseParamPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const user_role = req.user.role as UserRole;
    const user_id = req.user.sub as number;
    const user = await this.usersService.update(
      id,
      updateUserDto,
      user_role,
      user_id,
    );
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiBody({ type: AssignRoleDto })
  @Patch(':id/assign-role')
  async assign_role(
    @Param('id', ParseParamPipe) id: number,
    @Body() assignRoleDto: AssignRoleDto,
    @Req() req,
  ) {
    console.log(req.user.role);
    const { role } = assignRoleDto;

    const user = await this.usersService.assign_role(id, role);
    return {
      message: 'User role assigned successfully',
      data: user,
    };
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
