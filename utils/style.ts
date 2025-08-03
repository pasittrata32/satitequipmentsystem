import { Booking, BookingStatus } from '../types.ts';
import { LOCALES } from '../constants.ts';

export const STATUS_TO_STYLE: Record<BookingStatus, { key: keyof typeof LOCALES.en, classes: string }> = {
  'Booked': { key: 'booked', classes: 'bg-yellow-100 text-yellow-800' },
  'In Use': { key: 'inUse', classes: 'bg-blue-100 text-blue-800' },
  'Awaiting Return': { key: 'awaitingReturn', classes: 'bg-red-100 text-red-800' },
  'Returned': { key: 'returned', classes: 'bg-green-100 text-green-800' },
  'Cancelled': { key: 'cancelled', classes: 'bg-gray-100 text-gray-800' },
};

export const TYPE_TO_STYLE: Record<Booking['type'], { key: keyof typeof LOCALES.en, classes: string }> = {
  'จอง': { key: 'book', classes: 'bg-purple-100 text-purple-800' },
  'ยืม': { key: 'borrow', classes: 'bg-cyan-100 text-cyan-800' },
};