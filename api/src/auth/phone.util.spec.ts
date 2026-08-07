import { syntheticEmailForPhone } from './phone.util';

describe('syntheticEmailForPhone', () => {
  it('appends the deterministic phone.local domain', () => {
    expect(syntheticEmailForPhone('+15551234567')).toBe(
      '+15551234567@phone.local',
    );
  });

  it('strips non-digit, non-plus characters', () => {
    expect(syntheticEmailForPhone('+1 (555) 123-4567')).toBe(
      '+15551234567@phone.local',
    );
  });

  it('is deterministic for the same input', () => {
    expect(syntheticEmailForPhone('+15551234567')).toBe(
      syntheticEmailForPhone('+15551234567'),
    );
  });
});
