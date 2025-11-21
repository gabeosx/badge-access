import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Entitlement {
    id: string;
    name: string;
    description: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

    useEffect(() => {
        // In a real app, we might fetch user details again to get latest entitlements
        // For now, we rely on what's in the user object from login, 
        // OR we can fetch /api/users/me if we implemented it.
        // Since we didn't implement /me, let's just use the user object from context if it has roles.
        // But wait, the user object in context only has roles (names), not full entitlement objects.
        // We might need to fetch entitlements.
        // Let's just display the roles from the user object for now as "Badges".
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Access</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Username</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.username}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">User ID</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.id}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Active Badges</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {user?.roles.map((role) => (
                    <div key={role} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6 flex items-center">
                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Entitlement
                                </dt>
                                <dd className="flex items-baseline">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {role}
                                    </div>
                                </dd>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
