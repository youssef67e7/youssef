import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportChat, SupportChatDocument } from '../../database/schemas/support-chat.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectModel(SupportChat.name) private supportModel: Model<SupportChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createTicket(userId: string, subject: string, message: string, category?: string) {
    const ticket = await this.supportModel.create({
      user: userId,
      subject,
      category: category || 'OTHER',
      status: 'OPEN',
      messages: [{
        sender: userId,
        message,
        timestamp: new Date(),
        isAdmin: false,
      }],
    });

    this.logger.log(`Support ticket created: ${ticket._id} by user ${userId}`);

    return {
      message: 'Support ticket created',
      data: ticket,
    };
  }

  async getMyTickets(userId: string, query: PaginationDto) {
    const filter: any = { user: userId };

    if ((query as any).search) {
      filter['subject'] = { $regex: (query as any).search, $options: 'i' };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.supportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.supportModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Tickets retrieved',
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

  async getAllTickets(query: PaginationDto) {
    const filter: any = {};

    if ((query as any).search) {
      filter['subject'] = { $regex: (query as any).search, $options: 'i' };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.supportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user', 'name email phone')
        .populate('assignedTo', 'name email')
        .exec(),
      this.supportModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'All tickets retrieved',
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

  async getTicketById(id: string, userId?: string) {
    const filter: any = { _id: id };
    if (userId) {
      filter.user = userId;
    }

    const ticket = await this.supportModel.findOne(filter)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('messages.sender', 'name avatar')
      .exec();

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return {
      message: 'Ticket retrieved',
      data: ticket,
    };
  }

  async sendMessage(ticketId: string, userId: string, message: string, isAdmin: boolean = false) {
    const ticket = await this.supportModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException('Cannot send message to closed ticket');
    }

    ticket.messages.push({
      sender: userId,
      message,
      timestamp: new Date(),
      isAdmin,
    } as any);

    if (ticket.status === 'RESOLVED') {
      ticket.status = 'OPEN';
    }

    await ticket.save();

    return {
      message: 'Message sent',
      data: ticket,
    };
  }

  async assignTicket(ticketId: string, adminId: string) {
    const ticket = await this.supportModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.assignedTo = adminId as any;
    ticket.status = 'IN_PROGRESS';
    await ticket.save();

    return {
      message: 'Ticket assigned',
      data: ticket,
    };
  }

  async closeTicket(ticketId: string) {
    const ticket = await this.supportModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.status = 'CLOSED';
    await ticket.save();

    return {
      message: 'Ticket closed',
      data: ticket,
    };
  }

  async resolveTicket(ticketId: string) {
    const ticket = await this.supportModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.status = 'RESOLVED';
    await ticket.save();

    return {
      message: 'Ticket resolved',
      data: ticket,
    };
  }
}
