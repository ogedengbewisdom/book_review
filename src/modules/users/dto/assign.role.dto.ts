import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class AssignRoleDto {
  @ApiProperty({
    description: 'The role of the user',
    example: 'author',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
