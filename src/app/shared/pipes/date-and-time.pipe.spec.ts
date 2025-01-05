import { DateAndTimePipe } from './date-and-time.pipe';

describe('DateAndTimePipe', () => {
  let pipe: DateAndTimePipe;

  beforeEach(() => {
    pipe = new DateAndTimePipe();
  });

  it('should transform a Date object correctly', () => {
    const date = new Date(2023, 9, 5, 13, 45); // October 5, 2023, 1:45 PM
    const result = pipe.transform(date);
    expect(result).toBe('5 Oct 2023 1:45 PM');
  });

  it('should transform a date string correctly', () => {
    const dateString = '2023-10-05T13:45:00';
    const result = pipe.transform(dateString);
    expect(result).toBe('5 Oct 2023 1:45 PM');
  });

  it('should handle midnight correctly', () => {
    const midnight = new Date(2023, 9, 6, 0, 0); // October 6, 2023, 12:00 AM
    const result = pipe.transform(midnight);
    expect(result).toBe('6 Oct 2023 12:00 AM');
  });

  it('should handle noon correctly', () => {
    const noon = new Date(2023, 9, 6, 12, 0); // October 6, 2023, 12:00 PM
    const result = pipe.transform(noon);
    expect(result).toBe('6 Oct 2023 12:00 PM');
  });

  it('should pad single-digit minutes with a zero', () => {
    const dateWithMinutes = new Date(2023, 9, 6, 10, 5); // October 6, 2023, 10:05 AM
    const result = pipe.transform(dateWithMinutes);
    expect(result).toBe('6 Oct 2023 10:05 AM');
  });
});
