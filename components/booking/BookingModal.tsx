import React from 'react';
import { useAuth } from '../../context/AuthProvider.tsx';
import { useLocalization } from '../../context/LocalizationProvider.tsx';
import { Program } from '../../types.ts';
import { CloseIcon } from '../icons.tsx';
import { BookingForm } from './BookingForm.tsx';

type BookingModalProps = {
    classroom: string;
    period: number;
    bookingDate: string;
    program: Program;
    onClose: () => void;
};

export const BookingModal = ({ classroom, period, bookingDate, program, onClose }: BookingModalProps) => {
    const { user } = useAuth();
    const { t } = useLocalization();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12 md:items-center" role="dialog" aria-modal="true">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label={t('cancel')}>
                    <CloseIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-[#001f3f]">{t('bookingForm')}</h2>
                <BookingForm
                    isAdmin={user?.role === 'admin'}
                    isModal={true}
                    initialData={{ classroom, period, bookingDate, program }}
                    onBookingSuccess={onClose}
                />
            </div>
        </div>
    );
};