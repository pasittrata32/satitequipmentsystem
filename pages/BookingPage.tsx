import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper.tsx';
import { BookingForm } from '../components/booking/BookingForm.tsx';

const BookingPage = () => {
    return (
        <PageWrapper title="booking">
            <BookingForm isAdmin={false} />
        </PageWrapper>
    );
};

export default BookingPage;