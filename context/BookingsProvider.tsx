import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { Booking, BookingStatus } from '../types.ts';
import api from '../services/api.ts';
import { useLocalization } from './LocalizationProvider.tsx';
import { sanitizeBooking } from '../utils/booking.ts';

// --- SWEETALERT2 TYPE DEFINITION ---
declare const Swal: any;

type BookingsContextType = {
    bookings: Booking[];
    loading: boolean;
    fetchBookings: () => Promise<void>;
    createBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) => Promise<void>;
    updateBookingStatus: (id: number, status: Booking['status']) => Promise<void>;
    deleteBooking: (id: number) => Promise<void>;
};

const BookingsContext = createContext<BookingsContextType | null>(null);

export const useBookings = () => {
    const context = useContext(BookingsContext);
    if (!context) throw new Error('useBookings must be used within a BookingsProvider');
    return context;
};

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLocalization();

    const fetchBookings = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const data = await api.getBookings();
            // Sanitize every booking object upon fetching to ensure data integrity
            const sortedData = data
                .map(sanitizeBooking)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setBookings(sortedData);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            if (!isSilent) {
                Swal.fire({ icon: 'error', title: t('error'), text: t('fetchBookingsError') });
            }
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
        const tempId = Date.now();
        const newStatus = bookingData.type === 'ยืม' ? 'In Use' : 'Booked';

        const optimisticBooking: Booking = {
            id: tempId,
            status: newStatus,
            createdAt: new Date().toISOString(),
            ...bookingData,
        };

        // Optimistically add to the beginning of the list for immediate visibility
        setBookings(prev => [optimisticBooking, ...prev]);

        try {
            const finalBooking = await api.createBooking(bookingData);
            // Sanitize the booking object returned from the API
            const processedFinalBooking = sanitizeBooking(finalBooking);
            
            // Replace the temporary booking with the final one from the server
            setBookings(prev =>
                prev.map(b => (b.id === tempId ? processedFinalBooking : b))
            );
        } catch (error) {
            console.error("Optimistic createBooking failed:", error);
            // Revert the state by removing the temporary booking
            setBookings(prev => prev.filter(b => b.id !== tempId));
            // Re-throw the error so the calling function can handle it (e.g., show a message)
            throw error;
        }
    };

    const updateBookingStatus = async (id: number, status: Booking['status']) => {
        const originalBookings = [...bookings];
        // Optimistic update for instant UI feedback
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));

        try {
            await api.updateBookingStatus(id, status);
            await fetchBookings(true); // Silent refresh to confirm state
        } catch (error) {
            setBookings(originalBookings); // Revert on error
            throw error;
        }
    };
    
    const deleteBooking = async (id: number) => {
        const originalBookings = [...bookings];
        setBookings(prev => prev.filter(b => b.id !== id)); // Optimistic deletion
        try {
            await api.deleteBooking(id);
            await fetchBookings(true); // Silently sync with backend
        } catch (error) {
            setBookings(originalBookings); // Revert on error
            throw error;
        }
    };

    const value = { bookings, loading, fetchBookings, createBooking, updateBookingStatus, deleteBooking };

    return (
        <BookingsContext.Provider value={value}>
            {children}
        </BookingsContext.Provider>
    );
};