
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { LocalizationProvider } from './context/LocalizationProvider.tsx';
import { AuthProvider, useAuth } from './context/AuthProvider.tsx';
import { BookingsProvider } from './context/BookingsProvider.tsx';

import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { MenuIcon } from './components/icons.tsx';
import { ProtectedRoute } from './components/ui/ProtectedRoute.tsx';

import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import BookingSchedulePage from './pages/BookingSchedulePage.tsx';
import BookingPage from './pages/BookingPage.tsx';
import AdminBorrowPage from './pages/AdminBorrowPage.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import UserManagementPage from './pages/UserManagementPage.tsx';

const AppContent = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-[#e6f0fa]">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto">
                     <button className="md:hidden p-4 text-[#001f3f]" onClick={() => setSidebarOpen(true)}>
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    <Routes>
                        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/schedule" element={<ProtectedRoute><BookingSchedulePage /></ProtectedRoute>} />
                        <Route path="/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                        <Route path="/admin-borrow" element={<ProtectedRoute adminOnly><AdminBorrowPage /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute adminOnly><ReportsPage /></ProtectedRoute>} />
                        <Route path="/users" element={<ProtectedRoute adminOnly><UserManagementPage /></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default function App() {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <BookingsProvider>
            <AppContent />
        </BookingsProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}