import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../../database/schemas/cart.schema';
import { Medicine, MedicineDocument } from '../../database/schemas/medicine.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ user: userId }).populate('items.medicine');

    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [], totalItems: 0, totalPrice: 0 });
    }

    return {
      message: 'Cart retrieved successfully',
      data: cart,
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const medicine = await this.medicineModel.findById(dto.medicine);
    if (!medicine || !medicine.isActive || medicine.deletedAt) {
      throw new NotFoundException('Medicine not found or unavailable');
    }

    if (medicine.stockQuantity < dto.quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${medicine.stockQuantity}`);
    }

    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new this.cartModel({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.medicine.toString() === dto.medicine,
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + dto.quantity;
      if (newQuantity > medicine.stockQuantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${medicine.stockQuantity}`);
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        medicine: medicine._id,
        quantity: dto.quantity,
        addedAt: new Date(),
      } as any);
    }

    await this.recalculateCart(cart);
    await cart.save();

    const populatedCart = await this.cartModel.findById(cart._id).populate('items.medicine');

    this.logger.log(`Item added to cart for user ${userId}`);

    return {
      message: 'Item added to cart',
      data: populatedCart,
    };
  }

  async updateItem(userId: string, medicineId: string, dto: UpdateCartItemDto) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.medicine.toString() === medicineId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    if (dto.quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const medicine = await this.medicineModel.findById(medicineId);
      if (!medicine) {
        throw new NotFoundException('Medicine not found');
      }

      if (dto.quantity > medicine.stockQuantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${medicine.stockQuantity}`);
      }

      cart.items[itemIndex].quantity = dto.quantity;
    }

    await this.recalculateCart(cart);
    await cart.save();

    const populatedCart = await this.cartModel.findById(cart._id).populate('items.medicine');

    return {
      message: 'Cart item updated',
      data: populatedCart,
    };
  }

  async removeItem(userId: string, medicineId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.medicine.toString() === medicineId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);
    await this.recalculateCart(cart);
    await cart.save();

    const populatedCart = await this.cartModel.findById(cart._id).populate('items.medicine');

    return {
      message: 'Item removed from cart',
      data: populatedCart,
    };
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
      cart.couponCode = null as any;
      cart.couponDiscount = 0;
      await cart.save();
    }

    return {
      message: 'Cart cleared',
      data: { items: [], totalItems: 0, totalPrice: 0 },
    };
  }

  private async recalculateCart(cart: CartDocument) {
    let totalItems = 0;
    let totalPrice = 0;

    for (const item of cart.items) {
      const medicine = await this.medicineModel.findById(item.medicine);
      if (medicine) {
        totalItems += item.quantity;
        const itemPrice = medicine.priceAfterDiscount || medicine.price;
        totalPrice += itemPrice * item.quantity;
      }
    }

    cart.totalItems = totalItems;
    cart.totalPrice = Math.round(totalPrice * 100) / 100;
  }
}
