import React, { useState } from 'react';
import { useLocalization } from '../../context/LocalizationProvider.tsx';
import { User, UserRole } from '../../types.ts';

type UserModalProps = {
  user: User | null;
  onClose: () => void;
  onSave: (data: { id?: number; name: string; username: string; role: UserRole; password?: string }) => void;
};

export const UserModal = ({ user, onClose, onSave }: UserModalProps) => {
    const { t } = useLocalization();
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(user?.role || 'teacher');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: user?.id, name, username, role, password });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{user ? t('editUser') : t('addUser')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('userName')}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('username')}</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required disabled={!!user} />
                        </div>
                         {!user && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                        )}
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('userRole')}</label>
                            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                <option value="teacher">{t('roleTeacher')}</option>
                                <option value="admin">{t('roleAdmin')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-[#003366] text-white rounded-md hover:bg-[#005b9f]">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};