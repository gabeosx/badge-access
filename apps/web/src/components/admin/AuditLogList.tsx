import React, { useEffect, useState } from 'react';
import api from '../../api';

interface AuditLog {
    id: number;
    timestamp: string;
    actor: string;
    action: string;
    target_type: string;
    details: string;
}

const AuditLogList: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/api/audit-logs');
            setLogs(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Audit Logs</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {logs.map((log) => (
                        <li key={log.id} className="px-4 py-4">
                            <div className="flex justify-between">
                                <div className="text-sm font-medium text-gray-900">
                                    {log.actor} <span className="text-gray-500">performed</span> {log.action} <span className="text-gray-500">on</span> {log.target_type}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <div className="mt-1 text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded">
                                {log.details}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AuditLogList;
