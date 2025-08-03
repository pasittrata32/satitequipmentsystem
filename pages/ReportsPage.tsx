import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useLocalization } from '../context/LocalizationProvider.tsx';
import { useBookings } from '../context/BookingsProvider.tsx';
import { BookingStatus } from '../types.ts';
import { ALL_STATUSES } from '../constants.ts';
import { formatDisplayDate } from '../utils/time.ts';
import { STATUS_TO_STYLE } from '../utils/style.ts';
import { PageWrapper } from '../components/layout/PageWrapper.tsx';
import { Spinner } from '../components/ui/Spinner.tsx';

const ReportsPage = () => {
    const { t, language } = useLocalization();
    const { bookings, loading } = useBookings();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<BookingStatus | ''>('');

    const statusToLocaleKey: Record<BookingStatus, keyof typeof ALL_STATUSES_LOCALE_MAP> = {
        'Booked': 'booked', 'In Use': 'inUse', 'Awaiting Return': 'awaitingReturn',
        'Returned': 'returned', 'Cancelled': 'cancelled'
    };
    const ALL_STATUSES_LOCALE_MAP = {
        booked: 'booked', inUse: 'inUse', awaitingReturn: 'awaitingReturn',
        returned: 'returned', cancelled: 'cancelled', status: 'status'
    }
    
    const displayedBookings = useMemo(() => {
        return bookings
            .filter(b => { // Status filter
                if (!selectedStatus) return true;
                return b.status === selectedStatus;
            })
            .filter(b => { // Date filter
                if (!startDate && !endDate) return true;
                const bookingDate = new Date(b.bookingDate);
                bookingDate.setUTCHours(0, 0, 0, 0);

                let isAfterStart = true;
                if (startDate) {
                    const start = new Date(startDate);
                    start.setUTCHours(0, 0, 0, 0);
                    isAfterStart = bookingDate >= start;
                }

                let isBeforeEnd = true;
                if (endDate) {
                    const end = new Date(endDate);
                    end.setUTCHours(0, 0, 0, 0);
                    isBeforeEnd = bookingDate <= end;
                }

                return isAfterStart && isBeforeEnd;
            });
    }, [bookings, startDate, endDate, selectedStatus]);

    const handleExport = () => {
        const headers = [
            t('reportHeaderDate'),
            t('reportHeaderClassroom'),
            t('reportHeaderPeriod'),
            t('reportHeaderBorrower'),
            t('reportHeaderLessonPlanName'),
            t('reportHeaderEquipment'),
            t('status')
        ];

        const dataForSheet = displayedBookings.map(b => ([
            formatDisplayDate(b.bookingDate, language),
            b.classroom,
            b.period,
            b.teacherName,
            b.lessonPlanName,
            b.equipment.join(', '),
            t(statusToLocaleKey[b.status])
        ]));

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataForSheet]);
        
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFFFF" } },
            fill: { fgColor: { rgb: "FF001f3f" } },
        };

        const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: 0, c: C });
            if (worksheet[address]) {
                worksheet[address].s = headerStyle;
            }
        }
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Usage Report");
        
        const fileName = `Equipment_Usage_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };
    
    return (
         <PageWrapper title="reportsTitle">
            <div className="p-4 bg-gray-50 rounded-lg border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">{t('startDate')}</label>
                        <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">{t('endDate')}</label>
                        <input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">{t('status')}</label>
                        <select
                            id="status-filter"
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value as (BookingStatus | ''))}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">{t('allStatuses')}</option>
                            {ALL_STATUSES.map(status => (
                                <option key={status} value={status}>{t(statusToLocaleKey[status])}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 invisible">{t('exportLabel')}</label>
                        <button onClick={handleExport} disabled={displayedBookings.length === 0} className="w-full bg-[#0e7490] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#155e75] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {t('exportToExcel')}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? <Spinner /> : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('reportHeaderDate')}</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('reportHeaderClassroom')}</th>
                                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('reportHeaderPeriod')}</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('reportHeaderBorrower')}</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('reportHeaderLessonPlanName')}</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('reportHeaderEquipment')}</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {displayedBookings.length > 0 ? displayedBookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 whitespace-nowrap">{formatDisplayDate(booking.bookingDate, language)}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">{booking.classroom}</td>
                                    <td className="py-3 px-4 whitespace-nowrap text-center">{booking.period}</td>
                                    <td className="py-3 px-4">{booking.teacherName}</td>
                                    <td className="py-3 px-4 max-w-sm truncate" title={booking.lessonPlanName}>{booking.lessonPlanName}</td>
                                    <td className="py-3 px-4 max-w-xs truncate">{booking.equipment.join(', ')}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_TO_STYLE[booking.status] || 'bg-gray-200 text-gray-800'}`}>
                                            {t(statusToLocaleKey[booking.status] || 'status')}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500">
                                        {t('noBookingsToday')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </PageWrapper>
    );
};

export default ReportsPage;