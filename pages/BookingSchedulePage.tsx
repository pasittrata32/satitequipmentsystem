import React, { useState, useMemo } from 'react';
import { useLocalization } from '../context/LocalizationProvider.tsx';
import { useAuth } from '../context/AuthProvider.tsx';
import { useBookings } from '../context/BookingsProvider.tsx';
import { Booking, BookingStatus, Program } from '../types.ts';
import { getThaiTime } from '../utils/time.ts';
import { THAI_CLASSES, ENGLISH_CLASSES, KINDERGARTEN_CLASSES, PERIODS } from '../constants.ts';
import { PageWrapper } from '../components/layout/PageWrapper.tsx';
import { Spinner } from '../components/ui/Spinner.tsx';
import { BookingModal } from '../components/booking/BookingModal.tsx';
import { BookedSlotInfo } from '../components/booking/BookedSlotInfo.tsx';

// --- SWEETALERT2 TYPE DEFINITION ---
declare const Swal: any;

const BookingSchedulePage = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { bookings, loading, updateBookingStatus } = useBookings();
    const [selectedDate, setSelectedDate] = useState(() => getThaiTime().dateString);
    const [selectedProgram, setSelectedProgram] = useState<Program>('Thai Programme');
    const [bookingModalInfo, setBookingModalInfo] = useState<{ classroom: string; period: number } | null>(null);

    const handleCellClick = (classroom: string, period: number) => {
        setBookingModalInfo({ classroom, period });
    };

    const handleCloseModal = () => {
        setBookingModalInfo(null);
    };

    const handleCancelBooking = async (bookingId: number) => {
        const result = await Swal.fire({
            title: t('confirmCancelTitle'),
            text: t('confirmCancelText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('confirmCancelAction'),
            cancelButtonText: t('denyCancelAction'),
        });

        if (result.isConfirmed) {
            try {
                await updateBookingStatus(bookingId, 'Cancelled');
                Swal.fire({
                    icon: 'success',
                    title: t('cancelSuccessTitle'),
                    text: t('cancelSuccessText'),
                    showConfirmButton: false,
                    timer: 1500,
                });
            } catch (error) {
                console.error("Failed to cancel booking:", error);
                Swal.fire({ icon: 'error', title: t('error'), text: t('updateStatusError') });
            }
        }
    };

    const bookingsForDateMap = useMemo(() => {
        const map = new Map<string, Booking>();
        const activeStatuses: BookingStatus[] = ['Booked', 'In Use', 'Awaiting Return'];
        bookings
            .filter(b => {
                const bookingDateInBangkok = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date(b.bookingDate));
                return bookingDateInBangkok === selectedDate && activeStatuses.includes(b.status);
            })
            .forEach(b => {
                map.set(`${b.classroom}-${b.period}`, b);
            });
        return map;
    }, [bookings, selectedDate]);
    
    const classrooms = 
        selectedProgram === 'Thai Programme' ? THAI_CLASSES :
        selectedProgram === 'English Programme' ? ENGLISH_CLASSES :
        KINDERGARTEN_CLASSES;
    
    return (
        <PageWrapper title="bookingGrid">
            {bookingModalInfo && (
                <BookingModal
                    classroom={bookingModalInfo.classroom}
                    period={bookingModalInfo.period}
                    bookingDate={selectedDate}
                    program={selectedProgram}
                    onClose={handleCloseModal}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 p-4 bg-gray-50 rounded-lg border">
                <div>
                    <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">{t('selectDate')}</label>
                    <input
                        id="schedule-date"
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005b9f]"
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-200 p-1 rounded-lg">
                    <button
                        onClick={() => setSelectedProgram('Thai Programme')}
                        className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedProgram === 'Thai Programme' ? 'bg-white text-[#003366] shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}
                    >
                        {t('programThai')}
                    </button>
                    <button
                        onClick={() => setSelectedProgram('English Programme')}
                        className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedProgram === 'English Programme' ? 'bg-white text-[#003366] shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}
                    >
                        {t('programEnglish')}
                    </button>
                    <button
                        onClick={() => setSelectedProgram('Kindergarten')}
                        className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedProgram === 'Kindergarten' ? 'bg-white text-[#003366] shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}
                    >
                        {t('programKindergarten')}
                    </button>
                </div>
            </div>

            {loading ? <Spinner /> : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="sticky left-0 bg-gray-100 py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider z-10">{t('classroom')}</th>
                                {PERIODS.map(p => (
                                    <th key={p.id} className="py-3 px-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        {t('period')} {p.id}<br/><span className="font-normal text-xs">({p.time})</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {classrooms.map(classroom => (
                                <tr key={classroom} className="hover:bg-gray-50">
                                    <td className="sticky left-0 bg-white hover:bg-gray-50 py-3 px-4 whitespace-nowrap font-medium text-gray-800 z-10">{classroom}</td>
                                    {PERIODS.map(period => {
                                        const bookingDetails = bookingsForDateMap.get(`${classroom}-${period.id}`);
                                        return (
                                            <td key={period.id} className="py-2 px-1 text-center whitespace-nowrap border-l border-gray-200">
                                                {bookingDetails ? (
                                                    <BookedSlotInfo
                                                        booking={bookingDetails}
                                                        currentUser={user}
                                                        onCancel={handleCancelBooking}
                                                        t={t}
                                                    />
                                                ) : (
                                                    <button 
                                                      onClick={() => handleCellClick(classroom, period.id)}
                                                      className="w-full flex items-center justify-center text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors h-full"
                                                      aria-label={`Book ${classroom} for period ${period.id}`}
                                                    >
                                                        <span className="text-sm font-semibold">{t('bookingSlotAvailable')}</span>
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PageWrapper>
    );
};

export default BookingSchedulePage;