import React, { useEffect, useState } from 'react';
import api, { getEntitlements, assignEntitlement, removeEntitlement } from '../../api';
import Modal from '../Modal';

interface User {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    entitlements: { entitlement: { id: string; name: string } }[];
}

interface Entitlement {
    id: string;
    name: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntitlementId, setSelectedEntitlementId] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchEntitlements();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchEntitlements = async () => {
        try {
            const res = await getEntitlements();
            setEntitlements(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const openManageModal = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleAssign = async () => {
        if (!selectedUser || !selectedEntitlementId) return;
        try {
            await assignEntitlement(selectedUser.username, selectedEntitlementId);
            await fetchUsers(); // Refresh list
            // Update selected user locally to reflect changes immediately in modal if we wanted, 
            // but fetching users is safer to get the full relation
            const updatedUser = await api.get(`/api/users/${selectedUser.username}`);
            setSelectedUser(updatedUser.data);
            setSelectedEntitlementId('');
        } catch (e) {
            alert('Failed to assign entitlement');
        }
    };

    const handleRemove = async (entitlementId: string) => {
        if (!selectedUser) return;
        if (!confirm('Are you sure you want to remove this entitlement?')) return;
        try {
            await removeEntitlement(selectedUser.username, entitlementId);
            await fetchUsers();
            const updatedUser = await api.get(`/api/users/${selectedUser.username}`);
            setSelectedUser(updatedUser.data);
        } catch (e) {
            alert('Failed to remove entitlement');
        }
    };

    return (
        <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Users</h3>
            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.first_name} {user.last_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.entitlements.map((e) => (
                                                    <span key={e.entitlement.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                                        {e.entitlement.name}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => openManageModal(user)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Manage Entitlements
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {selectedUser && (
                <Modal open={isModalOpen} setOpen={setIsModalOpen} title={`Manage Entitlements for ${selectedUser.username}`}>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Current Entitlements</h4>
                            <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                                {selectedUser.entitlements.length === 0 && (
                                    <li className="p-3 text-sm text-gray-500 text-center">No entitlements assigned</li>
                                )}
                                {selectedUser.entitlements.map((e) => (
                                    <li key={e.entitlement.id} className="flex justify-between items-center p-3">
                                        <span className="text-sm text-gray-900">{e.entitlement.name}</span>
                                        <button
                                            onClick={() => handleRemove(e.entitlement.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Assign New Entitlement</h4>
                            <div className="flex gap-2">
                                <select
                                    value={selectedEntitlementId}
                                    onChange={(e) => setSelectedEntitlementId(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="">Select an entitlement...</option>
                                    {entitlements
                                        .filter(e => !selectedUser.entitlements.find(ue => ue.entitlement.id === e.id))
                                        .map((e) => (
                                            <option key={e.id} value={e.id}>{e.name}</option>
                                        ))}
                                </select>
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedEntitlementId}
                                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default UserList;
