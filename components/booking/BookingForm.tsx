import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { useAuth } from '../../context/AuthProvider.tsx';
import { useLocalization } from '../../context/LocalizationProvider.tsx';
import { useBookings } from '../../context/BookingsProvider.tsx';
import { User, Booking, Program, BookingStatus } from '../../types.ts';
import { THAI_CLASSES, ENGLISH_CLASSES, KINDERGARTEN_CLASSES, PERIODS, EQUIPMENT_LIST } from '../../constants.ts';
import { getThaiTime } from '../../utils/time.ts';
import api from '../../services/api.ts';
import { LoadingIndicator } from '../ui/LoadingIndicator.tsx';

// --- SWEETALERT2 TYPE DEFINITION ---
declare const Swal: any;

type BookingFormProps = {
    isAdmin?: boolean;
    isModal?: boolean;
    initialData?: {
        classroom?: string;
        period?: number;
        bookingDate?: string;
        program?: Program;
    };
    onBookingSuccess?: () => void;
};

export const BookingForm = ({ isAdmin = false, isModal = false, initialData = {}, onBookingSuccess }: BookingFormProps) => {
    const { user } = useAuth();
    const { t } = useLocalization();
    const { bookings, createBooking } = useBookings();
    const navigate = useNavigate();

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [type, setType] = useState<Booking['type']>('จอง');

    const [teacherName, setTeacherName] = useState(isAdmin ? '' : user?.name || '');
    const [teacherSearchQuery, setTeacherSearchQuery] = useState(isAdmin ? '' : user?.name || '');
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
    const teacherDropdownRef = useRef<HTMLDivElement>(null);
    
    const [program, setProgram] = useState<Program | ''>(initialData?.program || '');
    const [classroom, setClassroom] = useState(initialData?.classroom || '');
    const [period, setPeriod] = useState<number | ''>(initialData?.period || '');
    const [bookingDate, setBookingDate] = useState(initialData?.bookingDate || getThaiTime().dateString);
    const [lessonPlanName, setLessonPlanName] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [otherEquipment, setOtherEquipment] = useState('');

    useEffect(() => {
        if (isAdmin) {
            api.getUsers().then(users => {
                const teachers = users.filter(u => u.role === 'teacher');
                setAllUsers(teachers);
            }).catch(err => console.error("Failed to fetch users for admin booking form", err));
        }
    }, [isAdmin]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target as Node)) {
                setIsTeacherDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTeachers = useMemo(() => {
        if (!teacherSearchQuery) return allUsers;
        return allUsers.filter(u => u.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()));
    }, [teacherSearchQuery, allUsers]);

    const handleTeacherSelect = (selectedTeacherName: string) => {
        setTeacherName(selectedTeacherName);
        setTeacherSearchQuery(selectedTeacherName);
        setIsTeacherDropdownOpen(false);
    };

    const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setSelectedEquipment(prev => 
            checked ? [...prev, value] : prev.filter(item => item !== value)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherName || !program || !classroom || !period || !bookingDate || !lessonPlanName || (selectedEquipment.length === 0 && !otherEquipment.trim())) {
            Swal.fire({ icon: 'warning', title: t('formValidationError'), showConfirmButton: false, timer: 2000 });
            return;
        }

        const finalEquipmentList = [
            ...selectedEquipment.map(item => item.trim()),
            ...(otherEquipment.trim() ? [otherEquipment.trim()] : [])
        ];
        
        const loaderContainer = document.createElement('div');
        const root = ReactDOM.createRoot(loaderContainer);
        root.render(<LoadingIndicator text={t('loadingActionText')} />);

        Swal.fire({
            html: loaderContainer,
            showConfirmButton: false,
            allowOutsideClick: false,
            willClose: () => {
                root.unmount();
            }
        });

        try {
            const activeStatuses: BookingStatus[] = ['Booked', 'In Use', 'Awaiting Return'];
            const bookingsAtSameTime = bookings.filter(b => {
                const bookingDatePart = b.bookingDate.substring(0, 10);
                return bookingDatePart === bookingDate &&
                        b.period === Number(period) &&
                        activeStatuses.includes(b.status)
            });

            // Check 1: Is the same classroom already booked?
            const isClassroomConflict = bookingsAtSameTime.some(b => b.classroom === classroom);
            if (isClassroomConflict) {
                 Swal.fire({
                    icon: 'error',
                    title: t('bookingConflictTitle'),
                    text: t('bookingConflictText'),
                    confirmButtonColor: '#005b9f',
                });
                return;
            }

            // Check 2: Are any of the requested equipment items booked in other classrooms at the same time?
            const allBookedEquipmentAtTime = bookingsAtSameTime.flatMap(b => b.equipment.map(eq => eq.trim()));
            const isEquipmentConflict = finalEquipmentList.some(reqEq => allBookedEquipmentAtTime.includes(reqEq.trim()));
            
            if (isEquipmentConflict) {
                Swal.fire({
                    icon: 'error',
                    title: t('equipmentConflictTitle'),
                    text: t('equipmentConflictText'),
                    confirmButtonColor: '#005b9f',
                });
                return;
            }
            
            // If no conflicts, create booking
            await createBooking({
                type, teacherName, program, classroom, period: Number(period), bookingDate,
                lessonPlanName, equipment: finalEquipmentList,
            });

            Swal.fire({ icon: 'success', title: t('bookingSuccessTitle'), text: t('bookingSuccessText'), showConfirmButton: false, timer: 2000 });
            
            if (onBookingSuccess) {
                onBookingSuccess();
            } else {
                navigate('/');
            }

        } catch (error) {
            console.error("Booking submission failed:", error);
            Swal.fire({ icon: 'error', title: t('error'), text: t('bookingSaveError') });
        }
    };
    
    const classroomsForProgram = 
        program === 'Thai Programme' ? THAI_CLASSES :
        program === 'English Programme' ? ENGLISH_CLASSES :
        program === 'Kindergarten' ? KINDERGARTEN_CLASSES :
        [];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('bookingType')}</label>
                    <select value={type} onChange={e => setType(e.target.value as Booking['type'])} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#005b9f] focus:border-[#005b9f]">
                        <option value="จอง">{t('book')}</option>
                        <option value="ยืม">{t('borrow')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('teacherName')}</label>
                     {isAdmin ? (
                        <div className="relative" ref={teacherDropdownRef}>
                            <input
                                type="text" value={teacherSearchQuery}
                                onChange={e => { setTeacherSearchQuery(e.target.value); setTeacherName(''); setIsTeacherDropdownOpen(true); }}
                                onFocus={() => setIsTeacherDropdownOpen(true)}
                                placeholder={t('searchUserPlaceholder')}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                autoComplete="off" required
                            />
                            {isTeacherDropdownOpen && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredTeachers.length > 0 ? (
                                        filteredTeachers.map(u => (
                                            <div key={u.id} onClick={() => handleTeacherSelect(u.name)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{u.name}</div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">{t('noUsersFound')}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <input type="text" value={teacherName} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100" />
                    )}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('program')}</label>
                    <select value={program} onChange={e => { setProgram(e.target.value as Program); setClassroom(''); }} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" required disabled={isModal}>
                        <option value="">{t('selectProgram')}</option>
                        <option value="Thai Programme">{t('programThai')}</option>
                        <option value="English Programme">{t('programEnglish')}</option>
                        <option value="Kindergarten">{t('programKindergarten')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('classroom')}</label>
                    <select value={classroom} onChange={e => setClassroom(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" required disabled={isModal || !program}>
                        <option value="">{t('selectClassroom')}</option>
                        {classroomsForProgram.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('usageDate')}</label>
                    <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" required disabled={isModal} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('period')}</label>
                    <select value={period} onChange={e => setPeriod(e.target.value ? Number(e.target.value) : '')} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" required disabled={isModal}>
                        <option value="">{t('selectPeriod')}</option>
                        {PERIODS.map(p => <option key={p.id} value={p.id}>{p.id} ({p.time})</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('lessonPlanName')}</label>
                    <input type="text" value={lessonPlanName} onChange={e => setLessonPlanName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
            </div>

            <div>
                <label className="block text-base font-medium text-gray-900">{t('equipmentList')}</label>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {EQUIPMENT_LIST.map(item => (
                        <div key={item.id} className="flex items-center">
                            <input id={`${item.id}-${isModal ? 'modal' : 'page'}`} type="checkbox" value={item.name} onChange={handleEquipmentChange} className="h-4 w-4 text-[#005b9f] focus:ring-[#005b9f] border-gray-300 rounded" />
                            <label htmlFor={`${item.id}-${isModal ? 'modal' : 'page'}`} className="ml-3 text-sm text-gray-700">{item.name}</label>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                     <label htmlFor={`other-equipment-${isModal ? 'modal' : 'page'}`} className="block text-sm font-medium text-gray-700">{t('other')}</label>
                     <input type="text" id={`other-equipment-${isModal ? 'modal' : 'page'}`} value={otherEquipment} onChange={e => setOtherEquipment(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button type="submit" className="w-full md:w-auto bg-[#003366] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#005b9f] transition-colors duration-200">
                        {t('submitBooking')}
                    </button>
                </div>
            </div>
        </form>
    );
};