import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalization } from '../context/LocalizationProvider.tsx';
import { User } from '../types.ts';
import api from '../services/api.ts';
import { PageWrapper } from '../components/layout/PageWrapper.tsx';
import { Spinner } from '../components/ui/Spinner.tsx';
import { UserModal } from '../components/user/UserModal.tsx';

// --- SWEETALERT2 TYPE DEFINITION ---
declare const Swal: any;

const UserManagementPage = () => {
    const { t } = useLocalization();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            Swal.fire({ icon: 'error', title: t('error'), text: t('fetchUsersError') });
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (userData: any) => {
        try {
            if (userData.id) { // Editing existing user
                await api.updateUser(userData.id, userData.name, userData.role);
                 Swal.fire({ icon: 'success', title: t('userUpdatedSuccess'), showConfirmButton: false, timer: 1500 });
            } else { // Adding new user
                await api.addUser(userData.name, userData.username, userData.role, userData.password!);
                Swal.fire({ icon: 'success', title: t('userAddedSuccess'), showConfirmButton: false, timer: 1500 });
            }
            fetchUsers();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save user:", error);
            Swal.fire({ icon: 'error', title: t('error'), text: t('saveUserError') });
        }
    };

    const handleDeleteUser = async (userId: number) => {
        const result = await Swal.fire({
            title: t('confirmDeleteUserTitle'),
            text: t('confirmDeleteUserText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel')
        });

        if (result.isConfirmed) {
            try {
                await api.deleteUser(userId);
                Swal.fire({ icon: 'success', title: t('userDeletedSuccess'), showConfirmButton: false, timer: 1500 });
                fetchUsers();
            } catch (error) {
                console.error("Failed to delete user:", error);
                Swal.fire({ icon: 'error', title: t('error'), text: t('deleteUserError') });
            }
        }
    };
    
    const filteredUsers = useMemo(() => {
      if (!searchQuery) return users;
      return users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [users, searchQuery]);

    return (
        <PageWrapper title="userManagementTitle">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                 <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('searchUserPlaceholder')}
                    className="w-full max-w-sm p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005b9f]"
                />
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#003366] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#005b9f] transition-colors"
                >
                    {t('addUser')}
                </button>
            </div>
            {loading ? <Spinner /> : (
                 <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('userName')}</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('username')}</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('userRole')}</th>
                                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">{user.name}</td>
                                    <td className="py-3 px-4">{user.username}</td>
                                    <td className="py-3 px-4">{user.role}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-900 mr-4">{t('edit')}</button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">{t('delete')}</button>
                                    </td>
                                </tr>
                           )) : (
                               <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        {t('noUsersFound')}
                                    </td>
                                </tr>
                           )}
                        </tbody>
                    </table>
                </div>
            )}
            
            {isModalOpen && (
                <UserModal
                    user={editingUser}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                />
            )}
        </PageWrapper>
    );
};

export default UserManagementPage;