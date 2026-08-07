import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const target = (exception.meta?.target as string[] | undefined)?.join(
          ', ',
        );
        res.status(409).json({
          statusCode: 409,
          message: target ? `${target} already in use` : 'Duplicate value',
          error: 'Conflict',
        });
        return;
      }
      case 'P2025':
        res.status(404).json({
          statusCode: 404,
          message: 'Record not found',
          error: 'Not Found',
        });
        return;
      case 'P2003':
        res.status(400).json({
          statusCode: 400,
          message: 'Invalid reference',
          error: 'Bad Request',
        });
        return;
      default:
        res.status(500).json({
          statusCode: 500,
          message: 'Database error',
          error: 'Internal Server Error',
        });
    }
  }
}
