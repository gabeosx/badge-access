import React, { useState } from 'react';
import UserList from '../components/admin/UserList';
import EntitlementList from '../components/admin/EntitlementList';
import AuditLogList from '../components/admin/AuditLogList';

const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'entitlements' | 'audit'>('users');

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Admin Console</h1>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`${activeTab === 'users'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('entitlements')}
                        className={`${activeTab === 'entitlements'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Entitlements
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`${activeTab === 'audit'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Audit Logs
                    </button>
                </nav>
            </div>

            {activeTab === 'users' && <UserList />}
            {activeTab === 'entitlements' && <EntitlementList />}
            {activeTab === 'audit' && <AuditLogList />}
        </div>
    );
};

export default Admin;
