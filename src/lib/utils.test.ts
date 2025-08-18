import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names and ignores falsy', () => {
    const result = cn('a', (0 as unknown) as string | undefined, (null as unknown) as string | undefined, (undefined as unknown) as string | undefined, 'c');
    expect(result).toContain('a');
    expect(result).toContain('c');
  });
});
