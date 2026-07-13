import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from '../dto/pagination.dto';

export function ApiPaginatedResponse<TModel extends Type<any>>(
  model: TModel,
) {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get paginated list' }),
    ApiOkResponse({
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/' + String(model.name) },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 100 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 20 },
              totalPages: { type: 'number', example: 5 },
              hasNextPage: { type: 'boolean', example: true },
              hasPrevPage: { type: 'boolean', example: false },
            },
          },
        },
      },
    }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
  );
}
