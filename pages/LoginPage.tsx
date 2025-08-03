import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.tsx';
import { useLocalization } from '../context/LocalizationProvider.tsx';
import { GlobeIcon } from '../components/icons.tsx';

// --- SWEETALERT2 TYPE DEFINITION ---
declare const Swal: any;

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { t, language, setLanguage } = useLocalization();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      Swal.fire({
        icon: 'success',
        title: t('loginSuccess'),
        showConfirmButton: false,
        timer: 1500,
      });
      navigate('/');
    } else {
      Swal.fire({
        icon: 'error',
        title: t('loginFailed'),
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001f3f]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-[#003366]">{t('appName')}</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="text-sm font-bold text-gray-600 block">{t('username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#005b9f]"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-bold text-gray-600 block">{t('password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#005b9f]"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 mt-4 font-bold text-white bg-[#003366] rounded-lg hover:bg-[#005b9f] transition-colors">
            {t('login')}
          </button>
        </form>
         <div className="text-center pt-4">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#005b9f] focus:outline-none transition-colors"
            >
              <GlobeIcon className="h-5 w-5 mr-2" />
              {t('toggleLanguage')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;