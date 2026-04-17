import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseParamPipe implements PipeTransform {
  transform(value: string) {
    if (!value) return null;

    const parsed_value = parseInt(value);
    if (isNaN(parsed_value)) throw new BadRequestException('Invalid parameter');
    return parsed_value;
  }
}
