import { CustomValidationPipe } from '../validation.pipe';

describe('CustomValidationPipe', () => {
  it('should be defined', () => {
    expect(CustomValidationPipe).toBeDefined();
  });

  describe('transform', () => {
    it('should pass through non-object string values', async () => {
      const result = await (CustomValidationPipe as any).transform('test-string', {
        type: 'query',
        metatype: String,
      });

      expect(result).toBe('test-string');
    });

    it('should pass through number values', async () => {
      const result = await (CustomValidationPipe as any).transform(42, {
        type: 'query',
        metatype: Number,
      });

      expect(result).toBe(42);
    });

    it('should pass through boolean values', async () => {
      const result = await (CustomValidationPipe as any).transform(true, {
        type: 'query',
        metatype: Boolean,
      });

      expect(result).toBe(true);
    });

    it('should handle null body gracefully', async () => {
      const result = await (CustomValidationPipe as any).transform(null, {
        type: 'body',
        metatype: class {},
      });

      expect(result).toBeNull();
    });

    it('should handle empty object body', async () => {
      const result = await (CustomValidationPipe as any).transform({}, {
        type: 'body',
        metatype: class {},
      });

      expect(result).toEqual({});
    });

    it('should return original value when no metatype is provided', async () => {
      const result = await (CustomValidationPipe as any).transform({ key: 'value' }, {
        type: 'body',
        metatype: undefined,
      });

      expect(result).toEqual({ key: 'value' });
    });
  });
});
