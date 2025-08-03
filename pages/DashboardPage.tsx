import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthProvider.tsx';
import { useLocalization } from '../context/LocalizationProvider.tsx';
import { useBookings } from '../context/BookingsProvider.tsx';
import { BookingStatus } from '../types.ts';
import { formatDisplayDate } from '../utils/time.ts';
import { STATUS_TO_STYLE, TYPE_TO_STYLE } from '../utils/style.ts';
import { PageWrapper } from '../components/layout/PageWrapper.tsx';
import { Spinner } from '../components/ui/Spinner.tsx';
import { ReturnIcon, TrashIcon } from '../components/icons.tsx';

// --- SWEETALERT2 TYPE DEFINITION ---
declare const Swal: any;

const DashboardPage = () => {
    const { user } = useAuth();
    const { t, language } = useLocalization();
    const { bookings, loading, updateBookingStatus } = useBookings();
    const [searchQuery, setSearchQuery] = useState('');

    const handleReturn = async (bookingId: number) => {
        const result = await Swal.fire({
            title: t('confirmReturn'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#005b9f',
            cancelButtonColor: '#d33',
            confirmButtonText: t('confirm'),
            cancelButtonText: t('cancel'),
        });

        if (result.isConfirmed) {
            try {
                await updateBookingStatus(bookingId, 'Returned');
                Swal.fire({
                    icon: 'success',
                    title: t('success'),
                    text: t('returnSuccess'),
                    showConfirmButton: false,
                    timer: 1500,
                });
            } catch (error) {
                console.error("Failed to update status:", error);
                Swal.fire({ icon: 'error', title: t('error'), text: t('updateStatusError') });
            }
        }
    };
    
    const handleDelete = async (bookingId: number) => {
        const result = await Swal.fire({
            title: t('confirmDeleteBookingTitle'),
            text: t('confirmDeleteBookingText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
        });

        if (result.isConfirmed) {
            try {
                await updateBookingStatus(bookingId, 'Cancelled');
                Swal.fire({
                    icon: 'success',
                    title: t('success'),
                    text: t('deleteBookingSuccess'),
                    showConfirmButton: false,
                    timer: 1500,
                });
            } catch (error) {
                console.error("Failed to delete booking:", error);
                Swal.fire({ icon: 'error', title: t('error'), text: t('deleteBookingError') });
            }
        }
    };

    const activeBookings = useMemo(() => {
        const activeStatuses: BookingStatus[] = ['Booked', 'In Use', 'Awaiting Return'];
        return bookings
            .filter(b => activeStatuses.includes(b.status))
            .filter(b => {
                if (!searchQuery) return true;
                const lowerQuery = searchQuery.toLowerCase();
                return (
                    b.teacherName.toLowerCase().includes(lowerQuery) ||
                    b.equipment.some(eq => eq.toLowerCase().includes(lowerQuery)) ||
                    b.classroom.toLowerCase().includes(lowerQuery)
                );
            })
            // For the dashboard, sorting by event date is more intuitive for users
            .sort((a, b) => {
                const dateA = new Date(a.bookingDate);
                const dateB = new Date(b.bookingDate);
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateB.getTime() - dateA.getTime();
                }
                return b.period - a.period;
            });
    }, [bookings, searchQuery]);

    if (loading) {
        return <PageWrapper title="dashboard"><Spinner /></PageWrapper>;
    }

    return (
        <PageWrapper title="dashboard">
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('searchPendingReturnsPlaceholder')}
                    className="w-full max-w-lg p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005b9f]"
                />
            </div>

            {activeBookings.length === 0 ? (
                <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-xl">{t('noPendingReturns')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeBookings.map(booking => (
                        <div key={booking.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex-grow mb-4 md:mb-0">
                                    <div className="flex items-center mb-2 flex-wrap gap-x-2 gap-y-2">
                                        <p className="font-bold text-xl text-[#003366] mr-2">{booking.classroom}</p>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${TYPE_TO_STYLE[booking.type]?.classes || 'bg-gray-100 text-gray-800'}`}>
                                            {t(TYPE_TO_STYLE[booking.type]?.key || 'bookingType')}
                                        </span>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_TO_STYLE[booking.status]?.classes || ''}`}>
                                            {t(STATUS_TO_STYLE[booking.status]?.key || 'status')}
                                        </span>
                                    </div>
                                    <p className="text-gray-600"><span className="font-semibold">{t('teacher')}:</span> {booking.teacherName}</p>
                                    <p className="text-gray-600">
                                      <span className="font-semibold">{t('date')}:</span> {formatDisplayDate(booking.bookingDate, language)} / <span className="font-semibold">{t('period')}:</span> {booking.period}
                                    </p>
                                    <p className="mt-2 text-gray-800"><span className="font-semibold">{t('equipment')}:</span> {booking.equipment.join(', ')}</p>
                                </div>
                                
                                <div className="flex-shrink-0 self-start md:self-center flex flex-col md:flex-row gap-2">
                                    {user?.role === 'admin' && (
                                      <button
                                          onClick={() => handleReturn(booking.id)}
                                          className="w-full md:w-auto bg-[#005b9f] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#004070] transition-colors duration-200 flex items-center justify-center"
                                      >
                                          <ReturnIcon className="h-5 w-5 mr-2" />
                                          {t('returnEquipment')}
                                      </button>
                                    )}
                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(booking.id)}
                                            className="w-full md:w-auto bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-800 transition-colors duration-200 flex items-center justify-center"
                                        >
                                            <TrashIcon className="h-5 w-5 mr-2" />
                                            {t('delete')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
};

export default DashboardPage;