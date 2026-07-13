import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { UserRole } from '../../enums/role.enum';
import { ROLES_KEY } from '../../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createMockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: () => ({}),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      getArgs: () => [],
      getArgByIndex: () => ({}),
      switchToRpc: () => ({}),
      switchToWs: () => ({}),
      getType: () => 'http',
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({ role: UserRole.CUSTOMER });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockContext({ role: UserRole.ADMIN });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user lacks required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockContext({ role: UserRole.CUSTOMER });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should allow SUPER_ADMIN access to any role endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockContext({ role: UserRole.SUPER_ADMIN });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user is null', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockContext(null);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should deny access when user has no role property', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockContext({});

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should allow driver access to driver-only endpoints', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.DRIVER]);
      const context = createMockContext({ role: UserRole.DRIVER });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny driver access to admin endpoints', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
      const context = createMockContext({ role: UserRole.DRIVER });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});
