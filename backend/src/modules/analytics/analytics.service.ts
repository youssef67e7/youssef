import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Medicine, MedicineDocument } from '../../database/schemas/medicine.schema';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async getDashboardData() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalOrders,
      todayOrders,
      monthOrders,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalUsers,
      newUsersToday,
      totalMedicines,
      lowStockCount,
    ] = await Promise.all([
      this.orderModel.countDocuments({ deletedAt: null }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'PAID', deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]).exec(),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'PAID', createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]).exec(),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'PAID', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]).exec(),
      this.userModel.countDocuments({ deletedAt: null }).exec(),
      this.userModel.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
      this.medicineModel.countDocuments({ deletedAt: null }).exec(),
      this.medicineModel.countDocuments({
        deletedAt: null,
        $expr: { $lte: ['$stockQuantity', '$reorderPoint'] },
      }).exec(),
    ]);

    return {
      message: 'Dashboard data retrieved',
      data: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          thisMonth: monthOrders,
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          today: todayRevenue[0]?.total || 0,
          thisMonth: monthRevenue[0]?.total || 0,
        },
        users: {
          total: totalUsers,
          newToday: newUsersToday,
        },
        medicines: {
          total: totalMedicines,
          lowStock: lowStockCount,
        },
      },
    };
  }

  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    const matchFilter: any = { paymentStatus: 'PAID', deletedAt: null };

    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    const dailyRevenue = await this.orderModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyRevenue = await this.orderModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      message: 'Revenue analytics retrieved',
      data: { daily: dailyRevenue, monthly: monthlyRevenue },
    };
  }

  async getSalesAnalytics() {
    const topMedicines = await this.orderModel.aggregate([
      { $match: { paymentStatus: 'PAID', deletedAt: null } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
    ]);

    const salesByCategory = await this.orderModel.aggregate([
      { $match: { paymentStatus: 'PAID', deletedAt: null } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'medicines',
          localField: 'items.medicine',
          foreignField: '_id',
          as: 'medicineData',
        },
      },
      { $unwind: { path: '$medicineData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$medicineData.category',
          totalRevenue: { $sum: '$items.total' },
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    ]);

    return {
      message: 'Sales analytics retrieved',
      data: { topMedicines, salesByCategory },
    };
  }

  async getUserAnalytics() {
    const usersByRole = await this.userModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const userGrowth = await this.userModel.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    return {
      message: 'User analytics retrieved',
      data: { usersByRole, userGrowth },
    };
  }

  async getInventoryAnalytics() {
    const lowStock = await this.medicineModel.find({
      deletedAt: null,
      $expr: { $lte: ['$stockQuantity', '$reorderPoint'] },
    }).select('name stockQuantity reorderPoint').limit(20);

    const expiringSoon = await this.medicineModel.find({
      deletedAt: null,
      expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gt: new Date() },
    }).select('name expiryDate stockQuantity').limit(20);

    const stockByCategory = await this.medicineModel.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$category',
          totalStock: { $sum: '$stockQuantity' },
          totalProducts: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    ]);

    return {
      message: 'Inventory analytics retrieved',
      data: { lowStock, expiringSoon, stockByCategory },
    };
  }
}
