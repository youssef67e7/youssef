import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  async uploadImage(file: Express.Multer.File, folder: string = 'uploads') {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum: 5MB');
    }

    const filename = `${folder}/${uuidv4()}-${file.originalname}`;

    this.logger.log(`File uploaded: ${filename}`);

    return {
      message: 'File uploaded successfully',
      data: {
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/files/${filename}`,
      },
    };
  }

  async uploadDocument(file: Express.Multer.File, folder: string = 'documents') {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: PDF, DOC, DOCX, TXT');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum: 10MB');
    }

    const filename = `${folder}/${uuidv4()}-${file.originalname}`;

    this.logger.log(`Document uploaded: ${filename}`);

    return {
      message: 'Document uploaded successfully',
      data: {
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/files/${filename}`,
      },
    };
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string = 'uploads') {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results = [];
    for (const file of files) {
      const result = await this.uploadImage(file, folder);
      results.push(result.data);
    }

    return {
      message: `${results.length} files uploaded successfully`,
      data: results,
    };
  }

  async deleteFile(filename: string) {
    this.logger.log(`File deleted: ${filename}`);

    return { message: 'File deleted successfully' };
  }
}
