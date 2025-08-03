import { Booking } from '../types.ts';

/**
 * Sanitizes a booking object to ensure the `equipment` property is always a string array.
 * This handles cases where the API might return a single string or a comma-separated string
 * instead of an array.
 * @param booking The raw booking object from the API.
 * @returns A booking object with a guaranteed `equipment: string[]`.
 */
export const sanitizeBooking = (booking: any): Booking => {
    let equipmentArray: string[] = [];
    if (Array.isArray(booking.equipment)) {
        equipmentArray = booking.equipment;
    } else if (typeof booking.equipment === 'string') {
        // Split by comma, trim whitespace, and filter out any empty strings that result.
        equipmentArray = booking.equipment.split(',').map(e => e.trim()).filter(e => e.length > 0);
    }
    return { ...booking, equipment: equipmentArray };
};