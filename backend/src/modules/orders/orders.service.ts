import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { Cart, CartDocument } from '../../database/schemas/cart.schema';
import { Medicine, MedicineDocument } from '../../database/schemas/medicine.schema';
import { Coupon, CouponDocument } from '../../database/schemas/coupon.schema';
import { Invoice, InvoiceDocument } from '../../database/schemas/invoice.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartModel.findOne({ user: userId }).populate('items.medicine');
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const medicine = await this.medicineModel.findById(cartItem.medicine);
      if (!medicine || !medicine.isActive || medicine.deletedAt) {
        throw new BadRequestException(`Medicine ${cartItem.medicine} is not available`);
      }
      if (medicine.stockQuantity < cartItem.quantity) {
        throw new BadRequestException(`Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}`);
      }

      const price = medicine.priceAfterDiscount || medicine.price;
      const total = price * cartItem.quantity;

      orderItems.push({
        medicine: medicine._id,
        quantity: cartItem.quantity,
        price,
        total,
        medicineSnapshot: {
          name: medicine.name,
          sku: medicine.sku,
          price: medicine.price,
          image: medicine.images?.[0]?.url || '',
        },
      });

      subtotal += total;
    }

    let discount = 0;
    let couponId = null;

    if (dto.couponCode) {
      const coupon = await this.couponModel.findOne({
        code: dto.couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!coupon) {
        throw new BadRequestException('Invalid or expired coupon');
      }

      if (coupon.minimumOrderAmount > 0 && subtotal < coupon.minimumOrderAmount) {
        throw new BadRequestException(`Minimum order amount is ${coupon.minimumOrderAmount}`);
      }

      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        throw new BadRequestException('Coupon usage limit reached');
      }

      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maximumDiscountAmount > 0 && discount > coupon.maximumDiscountAmount) {
          discount = coupon.maximumDiscountAmount;
        }
      } else if (coupon.type === 'FIXED') {
        discount = Math.min(coupon.discountValue, subtotal);
      }

      coupon.usedCount += 1;
      await coupon.save();
      couponId = coupon._id;
    }

    const deliveryFee = dto.deliveryFee || 0;
    const tax = Math.round(subtotal * 0.14 * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + tax - discount) * 100) / 100;

    const orderNumber = `PW-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;

    const order = await this.orderModel.create({
      orderNumber,
      user: userId,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      coupon: couponId,
      couponDiscount: discount,
      status: 'PENDING',
      paymentStatus: dto.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
      paymentMethod: dto.paymentMethod || 'CASH_ON_DELIVERY',
      shippingAddress: dto.shippingAddress,
      deliveryInstructions: dto.deliveryInstructions || '',
      notes: dto.notes || '',
      isGift: dto.isGift || false,
      giftMessage: dto.giftMessage || '',
      statusHistory: [{ status: 'PENDING', timestamp: new Date(), note: 'Order created' }],
    });

    for (const item of orderItems) {
      await this.medicineModel.findByIdAndUpdate(item.medicine, {
        $inc: { stockQuantity: -item.quantity, totalSold: item.quantity },
      });
    }

    await this.cartModel.findOneAndUpdate({ user: userId }, {
      $set: { items: [], totalItems: 0, totalPrice: 0, couponCode: null, couponDiscount: 0 },
    });

    const invoice = await this.invoiceModel.create({
      invoiceNumber: `INV-${orderNumber}`,
      order: order._id,
      user: userId,
      items: orderItems.map((item) => ({
        medicine: item.medicine,
        name: item.medicineSnapshot.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: order.paymentMethod,
      paymentStatus: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    this.logger.log(`Order created: ${orderNumber} for user ${userId}`);

    return {
      message: 'Order created successfully',
      data: { order, invoice },
    };
  }

  async findAll(query: OrderQueryDto) {
    const filter: any = { deletedAt: null };

    if (query.userId) {
      filter.user = query.userId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }

    if (query.paymentMethod) {
      filter.paymentMethod = query.paymentMethod;
    }

    if (query.search) {
      filter.orderNumber = { $regex: query.search, $options: 'i' };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sort: any = { [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.orderModel.find(filter).sort(sort).skip(skip).limit(limit).populate('user', 'name email phone').exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Orders retrieved successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id).populate('user', 'name email phone').exec();
    if (!order || order.deletedAt) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderModel.findOne({ orderNumber }).populate('user', 'name email phone').exec();
    if (!order || order.deletedAt) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  async getUserOrders(userId: string, query: OrderQueryDto) {
    const filter: any = { user: userId, deletedAt: null };

    if (query.status) {
      filter.status = query.status;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Orders retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, adminId: string) {
    const order = await this.orderModel.findById(id);
    if (!order || order.deletedAt) {
      throw new NotFoundException('Order not found');
    }

    order.status = dto.status;
    order.statusHistory.push({
      status: dto.status,
      timestamp: new Date(),
      note: dto.note || '',
    });

    if (dto.status === 'DELIVERED') {
      order.actualDeliveryTime = new Date();
      order.paymentStatus = order.paymentMethod === 'CASH_ON_DELIVERY' ? 'PAID' : order.paymentStatus;
    }

    if (dto.status === 'CANCELLED') {
      for (const item of order.items) {
        await this.medicineModel.findByIdAndUpdate(item.medicine, {
          $inc: { stockQuantity: item.quantity, totalSold: -item.quantity },
        });
      }
    }

    await order.save();

    this.logger.log(`Order ${order.orderNumber} status updated to ${dto.status} by ${adminId}`);

    return {
      message: 'Order status updated',
      data: order,
    };
  }

  async cancelOrder(id: string, userId: string, reason?: string) {
    const order = await this.orderModel.findById(id);
    if (!order || order.deletedAt) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = 'CANCELLED';
    order.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: reason || 'Cancelled by customer',
    });

    for (const item of order.items) {
      await this.medicineModel.findByIdAndUpdate(item.medicine, {
        $inc: { stockQuantity: item.quantity, totalSold: -item.quantity },
      });
    }

    await order.save();

    this.logger.log(`Order ${order.orderNumber} cancelled by user ${userId}`);

    return {
      message: 'Order cancelled successfully',
      data: order,
    };
  }

  async softDelete(id: string, adminId: string) {
    const order = await this.orderModel.findById(id);
    if (!order || order.deletedAt) {
      throw new NotFoundException('Order not found');
    }

    await this.orderModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

    this.logger.log(`Order ${id} soft deleted by admin ${adminId}`);

    return { message: 'Order deleted successfully' };
  }
}
