import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../../database/schemas/notification.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(userId: string, query: PaginationDto) {
    const filter: any = { user: userId };

    if ((query as any).search) {
      filter.$or = [
        { title: { $regex: (query as any).search, $options: 'i' } },
        { body: { $regex: (query as any).search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.notificationModel.countDocuments(filter).exec(),
    ]);

    const unreadCount = await this.notificationModel.countDocuments({ ...filter, isRead: false }).exec();

    return {
      message: 'Notifications retrieved',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        unreadCount,
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationModel.findOne({ _id: id, user: userId });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    return { message: 'All notifications marked as read' };
  }

  async remove(id: string, userId: string) {
    const notification = await this.notificationModel.findOne({ _id: id, user: userId });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationModel.findByIdAndDelete(id);

    return { message: 'Notification deleted' };
  }

  async create(data: {
    userId: string;
    title: string;
    titleAr?: string;
    body: string;
    bodyAr?: string;
    type: string;
    data?: Record<string, any>;
  }) {
    const notification = await this.notificationModel.create({
      user: data.userId,
      title: data.title,
      titleAr: data.titleAr || '',
      body: data.body,
      bodyAr: data.bodyAr || '',
      type: data.type,
      data: data.data || {},
      isRead: false,
    });

    this.logger.log(`Notification created: ${data.title} for user ${data.userId}`);

    return notification;
  }

  async sendBulkNotifications(userIds: string[], data: {
    title: string;
    titleAr?: string;
    body: string;
    bodyAr?: string;
    type: string;
    data?: Record<string, any>;
  }) {
    const notifications = userIds.map((userId) => ({
      user: userId,
      title: data.title,
      titleAr: data.titleAr || '',
      body: data.body,
      bodyAr: data.bodyAr || '',
      type: data.type,
      data: data.data || {},
      isRead: false,
    }));

    await this.notificationModel.insertMany(notifications);

    this.logger.log(`Bulk notifications sent to ${userIds.length} users`);

    return { message: `Notifications sent to ${userIds.length} users` };
  }

  async sendToAllCustomers(data: {
    title: string;
    titleAr?: string;
    body: string;
    bodyAr?: string;
    type: string;
  }) {
    const customers = await this.userModel.find({ role: 'CUSTOMER', isActive: true }).select('_id');
    const userIds = customers.map((c) => c._id.toString());

    if (userIds.length === 0) {
      return { message: 'No active customers found' };
    }

    return this.sendBulkNotifications(userIds, data);
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({ user: userId, isRead: false }).exec();

    return {
      message: 'Unread count retrieved',
      data: { count },
    };
  }
}
