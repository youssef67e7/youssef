import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery, DeliveryDocument } from '../../database/schemas/delivery.schema';
import { Driver, DriverDocument } from '../../database/schemas/driver.schema';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectModel(Delivery.name) private deliveryModel: Model<DeliveryDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async assignDriver(dto: AssignDriverDto, adminId: string) {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const driver = await this.driverModel.findById(dto.driverId);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.isAvailable) {
      throw new BadRequestException('Driver is not available');
    }

    const existingDelivery = await this.deliveryModel.findOne({ order: dto.orderId });
    if (existingDelivery) {
      throw new BadRequestException('Delivery already assigned for this order');
    }

    const delivery = await this.deliveryModel.create({
      order: order._id,
      driver: driver._id,
      status: 'ASSIGNED',
      pickupAddress: order.shippingAddress,
      deliveryAddress: order.shippingAddress,
      deliveryFee: order.deliveryFee,
      statusHistory: [{ status: 'ASSIGNED', timestamp: new Date(), note: 'Driver assigned' }],
    });

    order.driver = driver._id;
    order.status = 'OUT_FOR_DELIVERY';
    order.statusHistory.push({
      status: 'OUT_FOR_DELIVERY',
      timestamp: new Date(),
      note: `Driver ${driver._id} assigned`,
    });
    await order.save();

    driver.isAvailable = false;
    driver.currentOrder = order._id;
    await driver.save();

    this.logger.log(`Driver ${driver._id} assigned to order ${order.orderNumber}`);

    return {
      message: 'Driver assigned successfully',
      data: delivery,
    };
  }

  async findAll(query: any) {
    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.driverId) {
      filter.driver = query.driverId;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.deliveryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('order', 'orderNumber')
        .populate('driver')
        .exec(),
      this.deliveryModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Deliveries retrieved',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string) {
    const delivery = await this.deliveryModel.findById(id)
      .populate('order')
      .populate('driver')
      .exec();
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return {
      message: 'Delivery retrieved',
      data: delivery,
    };
  }

  async updateStatus(id: string, dto: UpdateDeliveryStatusDto) {
    const delivery = await this.deliveryModel.findById(id);
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    delivery.status = dto.status;
    delivery.statusHistory.push({
      status: dto.status,
      timestamp: new Date(),
      note: dto.note || '',
    });

    if (dto.status === 'PICKED_UP') {
      delivery.pickupTime = new Date();
    }

    if (dto.status === 'DELIVERED') {
      delivery.deliveryTime = new Date();
      if (delivery.pickupTime) {
        delivery.actualDuration = Math.round(
          (delivery.deliveryTime.getTime() - delivery.pickupTime.getTime()) / 60000,
        );
      }

      const driver = await this.driverModel.findById(delivery.driver);
      if (driver) {
        driver.isAvailable = true;
        driver.currentOrder = null as any;
        driver.totalDeliveries += 1;
        await driver.save();
      }

      const order = await this.orderModel.findById(delivery.order);
      if (order) {
        order.status = 'DELIVERED';
        order.actualDeliveryTime = new Date();
        order.statusHistory.push({
          status: 'DELIVERED',
          timestamp: new Date(),
          note: 'Delivered successfully',
        });
        await order.save();
      }
    }

    if (dto.status === 'FAILED') {
      const driver = await this.driverModel.findById(delivery.driver);
      if (driver) {
        driver.isAvailable = true;
        driver.currentOrder = null as any;
        await driver.save();
      }
    }

    await delivery.save();

    this.logger.log(`Delivery ${id} status updated to ${dto.status}`);

    return {
      message: 'Delivery status updated',
      data: delivery,
    };
  }

  async updateLocation(id: string, dto: UpdateLocationDto) {
    const delivery = await this.deliveryModel.findById(id);
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const driver = await this.driverModel.findById(delivery.driver);
    if (driver) {
      driver.currentLocation = {
        lat: dto.latitude,
        lng: dto.longitude,
        updatedAt: new Date(),
      } as any;
      await driver.save();
    }

    return {
      message: 'Location updated',
      data: { latitude: dto.latitude, longitude: dto.longitude },
    };
  }

  async getAvailableDrivers() {
    const drivers = await this.driverModel.find({
      isAvailable: true,
      isOnline: true,
    }).populate('user', 'name phone avatar');

    return {
      message: 'Available drivers retrieved',
      data: drivers,
    };
  }

  async getDriverDeliveries(driverId: string, query: any) {
    const filter: any = { driver: driverId };

    if (query.status) {
      filter.status = query.status;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.deliveryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('order', 'orderNumber total')
        .exec(),
      this.deliveryModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Driver deliveries retrieved',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }
}
