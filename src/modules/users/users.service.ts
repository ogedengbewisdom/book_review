import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from 'src/common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);
    return user.id;
  }

  async findAll() {
    // return `This action returns all users`;
    const users = await this.userRepository.find();
    const mapped_users = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });
    return mapped_users;
  }

  async findOneById(id: number, user_role: UserRole, user_id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const is_authorized = user.id === user_id || user_role === UserRole.ADMIN;

    if (!is_authorized)
      throw new ForbiddenException('You are not allowed to access this user');

    const { password, deleted_at, ...rest } = user;
    return rest;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { password, ...rest } = user;
    return rest;
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return user;
    } catch (error) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    user_role: UserRole,
    user_id: number,
  ) {
    const user = await this.findOne(id);
    const is_authorized = user.id === user_id || user_role === UserRole.ADMIN;

    if (!is_authorized)
      throw new ForbiddenException('You are not allowed to update this user');

    await this.userRepository.update(id, updateUserDto);
    return user.id;
  }

  async assign_role(id: number, role: UserRole) {
    const user = await this.findOne(id);
    await this.userRepository.update(id, { role });
    return user.id;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
