import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

interface HttpResponse<T> {
  statusCode: number;
  status: string;
  message: string;
  data?: T;
  timestamp: string;
}

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<HttpResponse<T>> {
    const ctx = context.switchToHttp();

    const res = ctx.getResponse<Response>();

    const req = ctx.getRequest<Request>();
    return next.handle().pipe(
      map((data: { message: string; data?: T }) => ({
        statusCode: res.statusCode,
        status: res.statusMessage || 'success',
        message: data.message || 'Success',
        ...(data.data && { data: data.data }),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
