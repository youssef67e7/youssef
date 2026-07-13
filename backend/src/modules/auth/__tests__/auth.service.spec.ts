jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../../database/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: any;

  const mockUserDoc = {
    _id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+201234567890',
    password: 'hashedpassword',
    role: 'CUSTOMER',
    isActive: true,
    mfaEnabled: false,
    loginCount: 0,
    lastLogin: null,
    toObject: jest.fn().mockReturnValue({
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+201234567890',
      role: 'CUSTOMER',
      isActive: true,
    }),
    save: jest.fn().mockResolvedValue(true),
  };

  const MockUserModel = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'user123',
    save: jest.fn().mockResolvedValue({ ...data, _id: 'user123' }),
    toObject: jest.fn().mockReturnValue({ ...data, _id: 'user123' }),
  }));

  (MockUserModel as any).findOne = jest.fn();
  (MockUserModel as any).findById = jest.fn();
  (MockUserModel as any).find = jest.fn();

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (MockUserModel as any).findOne = jest.fn();
    (MockUserModel as any).findById = jest.fn();
    (MockUserModel as any).find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: MockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+201234567890',
      password: 'Password1!',
    };

    it('should register a new user successfully', async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await service.register(dto as any);

      expect(result.message).toBe('Registration successful');
      expect(result.data).toHaveProperty('accessToken');
      expect(result.data).toHaveProperty('refreshToken');
      expect(result.data.user).toBeDefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      userModel.findOne.mockResolvedValue({ email: dto.email });

      await expect(service.register(dto as any)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if phone already exists', async () => {
      userModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ phone: dto.phone });

      await expect(service.register(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const dto = { email: 'john@example.com', password: 'Password1!' };

    it('should login successfully with correct credentials', async () => {
      const user = {
        ...mockUserDoc,
        isActive: true,
        deletedAt: null,
        mfaEnabled: false,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({ _id: 'user123', email: 'john@example.com', role: 'CUSTOMER' }),
      };
      userModel.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      const result = await service.login(dto as any);

      expect(result.message).toBe('Login successful');
      expect(result.data).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userModel.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const user = { ...mockUserDoc, isActive: false, deletedAt: null, password: 'hashedpassword' };
      userModel.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      const user = { ...mockUserDoc, isActive: true, deletedAt: null, password: 'hashedpassword' };
      userModel.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('should return user profile by id', async () => {
      userModel.findById.mockResolvedValue(mockUserDoc);

      const result = await service.getMe('user123');

      expect(result.message).toBe('User profile retrieved');
      expect(result.data).toHaveProperty('email');
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(service.getMe('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user123', email: 'a@b.com', role: 'CUSTOMER' });
      userModel.findById.mockResolvedValue(mockUserDoc);

      const result = await service.refreshToken('refresh-token');

      expect(result.data).toHaveProperty('accessToken');
      expect(result.data).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error('Invalid'); });

      await expect(service.refreshToken('invalid')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      userModel.findById.mockResolvedValue(mockUserDoc);

      const result = await service.logout('user123');

      expect(result.message).toBe('Logged out successfully');
    });
  });
});
