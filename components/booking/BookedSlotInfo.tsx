import React from 'react';
import { Booking, User } from '../../types.ts';
import { LOCALES } from '../../constants.ts';

type BookedSlotInfoProps = {
    booking: Booking;
    currentUser: User | null;
    onCancel: (bookingId: number) => Promise<void>;
    t: (key: keyof typeof LOCALES.en) => string;
};

export const BookedSlotInfo = ({ booking, currentUser, onCancel, t }: BookedSlotInfoProps) => {
    const canCancel = currentUser &&
                      (currentUser.role === 'admin' || currentUser.name === booking.teacherName) &&
                      booking.status !== 'Returned' &&
                      booking.status !== 'Cancelled';

    return (
        <div className="w-full h-full flex flex-col items-center justify-center rounded-lg p-1 text-center bg-yellow-50 border border-yellow-200">
            <div className="flex items-center">
                <span className="font-semibold text-sm text-yellow-800">
                    {t('bookingSlotBooked')}
                </span>
            </div>
            <p className="text-xs text-gray-700 mt-1 px-1 w-full truncate" title={booking.teacherName}>
                {booking.teacherName}
            </p>
            {canCancel && (
                <button
                    onClick={() => onCancel(booking.id)}
                    className="mt-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    aria-label={`${t('cancel')} booking`}
                >
                    {t('cancel')}
                </button>
            )}
        </div>
    );
};