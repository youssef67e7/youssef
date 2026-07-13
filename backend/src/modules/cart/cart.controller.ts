import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved' })
  async getCart(@CurrentUser('sub') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async addItem(
    @CurrentUser('sub') userId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:medicineId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'medicineId' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  async updateItem(
    @CurrentUser('sub') userId: string,
    @Param('medicineId') medicineId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, medicineId, dto);
  }

  @Delete('items/:medicineId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'medicineId' })
  @ApiResponse({ status: 200, description: 'Item removed' })
  async removeItem(
    @CurrentUser('sub') userId: string,
    @Param('medicineId') medicineId: string,
  ) {
    return this.cartService.removeItem(userId, medicineId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@CurrentUser('sub') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
