import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider.tsx';
import { useLocalization } from '../../context/LocalizationProvider.tsx';
import { DashboardIcon, CalendarIcon, ReportIcon, UsersIcon, LogoutIcon, CloseIcon, TableIcon } from '../icons.tsx';

export const Sidebar = ({ isSidebarOpen, setSidebarOpen } : { isSidebarOpen: boolean, setSidebarOpen: (isOpen: boolean) => void }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLocalization();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = "flex items-center px-4 py-3 text-lg hover:bg-[#005b9f] rounded-lg transition-colors duration-200";
  const activeNavLinkClasses = "bg-[#005b9f]";

  const NavLink = ({ to, icon, label }: { to: string, icon: ReactNode, label: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setSidebarOpen(false)}>
        <span className="mr-4">{icon}</span>
        {label}
      </Link>
    );
  };
  
  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-[#001f3f] text-[#e6f0fa] p-4 flex flex-col z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-72`}>
        <div className="flex items-center justify-between mb-8 md:justify-center">
            <h1 className="text-xl font-bold text-center">{t('appName')}</h1>
            <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
                <CloseIcon className="h-6 w-6" />
            </button>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            <li><NavLink to="/" icon={<DashboardIcon className="h-6 w-6"/>} label={t('dashboard')} /></li>
            <li><NavLink to="/schedule" icon={<TableIcon className="h-6 w-6"/>} label={t('bookingGrid')} /></li>
            {user?.role === 'teacher' && (
              <li><NavLink to="/book" icon={<CalendarIcon className="h-6 w-6"/>} label={t('booking')} /></li>
            )}
            {user?.role === 'admin' && (
              <>
                <li><NavLink to="/admin-borrow" icon={<CalendarIcon className="h-6 w-6"/>} label={t('adminBorrow')} /></li>
                <li><NavLink to="/reports" icon={<ReportIcon className="h-6 w-6"/>} label={t('reports')} /></li>
                <li><NavLink to="/users" icon={<UsersIcon className="h-6 w-6"/>} label={t('userManagement')} /></li>
              </>
            )}
          </ul>
        </nav>
        
        <div className="flex-shrink-0">
           <div className="border-t border-white/20 pt-4 space-y-4">
                <div className="px-2 text-center">
                    <p className="font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-sm text-gray-400 capitalize">{t(user?.role === 'admin' ? 'roleAdmin' : 'roleTeacher')}</p>
                </div>
              
              <div className="flex items-center space-x-1 p-1 bg-black/20 rounded-lg">
                <button 
                    onClick={() => setLanguage('th')} 
                    className={`w-full px-4 py-1.5 text-sm rounded-md transition-colors font-semibold ${language === 'th' ? 'bg-[#e6f0fa] text-[#001f3f]' : 'text-gray-300 hover:bg-[#005b9f]/70'}`}
                >
                    TH
                </button>
                <button 
                    onClick={() => setLanguage('en')} 
                    className={`w-full px-4 py-1.5 text-sm rounded-md transition-colors font-semibold ${language === 'en' ? 'bg-[#e6f0fa] text-[#001f3f]' : 'text-gray-300 hover:bg-[#005b9f]/70'}`}
                >
                    EN
                </button>
              </div>

              <button onClick={handleLogout} className="flex items-center justify-center px-4 py-3 text-lg w-full rounded-lg transition-colors duration-200 bg-red-600 text-white hover:bg-red-700">
                <LogoutIcon className="h-6 w-6 mr-3" />
                {t('logout')}
              </button>
           </div>
        </div>
      </aside>
    </>
  );
};