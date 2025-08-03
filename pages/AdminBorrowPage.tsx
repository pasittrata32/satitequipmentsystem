import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper.tsx';
import { BookingForm } from '../components/booking/BookingForm.tsx';

const AdminBorrowPage = () => {
    return (
        <PageWrapper title="adminBorrow">
            <BookingForm isAdmin={true} />
        </PageWrapper>
    );
};

export default AdminBorrowPage;