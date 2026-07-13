import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Medicine, MedicineDocument } from '../../database/schemas/medicine.schema';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async getSalesReport(startDate: Date, endDate: Date) {
    const orders = await this.orderModel.find({
      paymentStatus: 'PAID',
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      deletedAt: null,
    }).populate('user', 'name email');

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paymentMethodBreakdown = orders.reduce((acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      message: 'Sales report generated',
      data: {
        period: { startDate, endDate },
        summary: { totalRevenue, totalOrders, averageOrderValue },
        paymentMethodBreakdown,
        statusBreakdown,
        orders: orders.map((o) => ({
          orderNumber: o.orderNumber,
          customer: o.user,
          total: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod,
          createdAt: (o as any).createdAt,
        })),
      },
    };
  }

  async getRevenueReport(startDate: Date, endDate: Date) {
    const dailyRevenue = await this.orderModel.aggregate([
      {
        $match: {
          paymentStatus: 'PAID',
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);
    const totalDays = dailyRevenue.length || 1;

    return {
      message: 'Revenue report generated',
      data: {
        period: { startDate, endDate },
        totalRevenue,
        averageDailyRevenue: totalRevenue / totalDays,
        daily: dailyRevenue,
      },
    };
  }

  async getInventoryReport() {
    const medicines = await this.medicineModel.find({ deletedAt: null });

    const totalProducts = medicines.length;
    const totalStockValue = medicines.reduce((sum, m) => sum + (m.price * m.stockQuantity), 0);
    const lowStockProducts = medicines.filter((m) => m.stockQuantity <= m.reorderPoint);
    const outOfStockProducts = medicines.filter((m) => m.stockQuantity === 0);
    const expiringProducts = medicines.filter((m) => {
      if (!m.expiryDate) return false;
      const daysUntilExpiry = Math.ceil((m.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    });

    const categoryBreakdown = medicines.reduce((acc, m) => {
      const cat = m.category?.toString() || 'Unknown';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      message: 'Inventory report generated',
      data: {
        summary: {
          totalProducts,
          totalStockValue,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          expiringCount: expiringProducts.length,
        },
        lowStockProducts: lowStockProducts.map((m) => ({
          name: m.name,
          stockQuantity: m.stockQuantity,
          reorderPoint: m.reorderPoint,
        })),
        outOfStockProducts: outOfStockProducts.map((m) => ({ name: m.name, sku: m.sku })),
        expiringProducts: expiringProducts.map((m) => ({
          name: m.name,
          expiryDate: m.expiryDate,
          stockQuantity: m.stockQuantity,
        })),
        categoryBreakdown,
      },
    };
  }

  async getUserReport() {
    const users = await this.userModel.find({ deletedAt: null });

    const totalUsers = users.length;
    const roleBreakdown = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const verifiedUsers = users.filter((u) => u.isVerified).length;
    const activeUsers = users.filter((u) => u.isActive).length;

    return {
      message: 'User report generated',
      data: {
        summary: { totalUsers, verifiedUsers, activeUsers },
        roleBreakdown,
      },
    };
  }

  async exportCSV(data: any[]): Promise<string> {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map((row) =>
      headers.map((h) => {
        const value = row[h];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','),
    );

    return [csvHeaders, ...csvRows].join('\n');
  }
}
