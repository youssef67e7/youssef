import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSetting, SystemSettingDocument } from '../../database/schemas/system-setting.schema';

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(
    @InjectModel(SystemSetting.name) private settingModel: Model<SystemSettingDocument>,
  ) {}

  async findAll() {
    const settings = await this.settingModel.find().sort({ key: 1 });

    return {
      message: 'Settings retrieved',
      data: settings,
    };
  }

  async findPublic() {
    const settings = await this.settingModel.find({ isPublic: true }).sort({ key: 1 });

    return {
      message: 'Public settings retrieved',
      data: settings,
    };
  }

  async findByKey(key: string) {
    const setting = await this.settingModel.findOne({ key });
    if (!setting) {
      throw new NotFoundException(`Setting '${key}' not found`);
    }

    return {
      message: 'Setting retrieved',
      data: setting,
    };
  }

  async get(key: string): Promise<any> {
    const setting = await this.settingModel.findOne({ key });
    if (!setting) return null;

    switch (setting.type) {
      case 'boolean':
        return setting.value === 'true';
      case 'number':
        return Number(setting.value);
      case 'json':
        try {
          return JSON.parse(setting.value);
        } catch {
          return setting.value;
        }
      default:
        return setting.value;
    }
  }

  async set(key: string, value: any, type: string = 'string', description?: string, isPublic?: boolean) {
    const updateData: any = { value: String(value), type };
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const setting = await this.settingModel.findOneAndUpdate(
      { key },
      { $set: updateData },
      { new: true, upsert: true },
    );

    this.logger.log(`Setting updated: ${key}`);

    return {
      message: 'Setting updated',
      data: setting,
    };
  }

  async bulkUpdate(settings: { key: string; value: any; type?: string; description?: string; isPublic?: boolean }[]) {
    const operations = settings.map((s) => ({
      updateOne: {
        filter: { key: s.key },
        update: {
          $set: {
            value: String(s.value),
            type: s.type || 'string',
            description: s.description || '',
            isPublic: s.isPublic || false,
          },
        },
        upsert: true,
      },
    }));

    await this.settingModel.bulkWrite(operations);

    this.logger.log(`Bulk settings update: ${settings.length} settings`);

    return { message: `${settings.length} settings updated` };
  }

  async remove(key: string) {
    const setting = await this.settingModel.findOneAndDelete({ key });
    if (!setting) {
      throw new NotFoundException(`Setting '${key}' not found`);
    }

    return { message: `Setting '${key}' deleted` };
  }

  async isMaintenanceMode(): Promise<boolean> {
    const maintenanceMode = await this.get('maintenance_mode');
    return maintenanceMode === true;
  }

  async toggleMaintenanceMode(enable: boolean) {
    await this.set('maintenance_mode', enable, 'boolean', 'Enable/disable maintenance mode', true);

    return {
      message: `Maintenance mode ${enable ? 'enabled' : 'disabled'}`,
      data: { maintenanceMode: enable },
    };
  }
}
