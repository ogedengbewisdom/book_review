import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const is_http_instance = exception instanceof HttpException;

    const statusCode = is_http_instance
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exception_response = is_http_instance
      ? (exception.getResponse() as any)
      : null;

    const error_code = is_http_instance
      ? exception_response?.error.toUpperCase().replace(/ /g, '_') ||
        'UNKNOWN_ERROR'
      : 'INTERNAL_SERVER_ERROR';

    const message = is_http_instance
      ? exception_response?.message || 'An unknown error occurred'
      : (exception as Error)?.message || 'Internal server error';

    res.status(statusCode).json({
      statusCode,
      status: 'error',
      method: req.method,
      path: req.originalUrl,
      error: {
        errorCode: error_code,
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
