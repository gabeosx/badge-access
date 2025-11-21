import React, { useEffect, useState } from 'react';
import api from '../../api';

interface Entitlement {
    id: string;
    name: string;
    description: string;
}

const EntitlementList: React.FC = () => {
    const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        fetchEntitlements();
    }, []);

    const fetchEntitlements = async () => {
        try {
            const res = await api.get('/api/entitlements');
            setEntitlements(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/entitlements', { name: newName, description: newDesc });
            setNewName('');
            setNewDesc('');
            fetchEntitlements();
        } catch (e) {
            alert('Failed to create entitlement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/api/entitlements/${id}`);
            fetchEntitlements();
        } catch (e) {
            alert('Failed to delete entitlement (might be assigned)');
        }
    };

    return (
        <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Entitlements</h3>

            <form onSubmit={handleCreate} className="mb-6 flex gap-4">
                <input
                    type="text"
                    placeholder="Name (e.g. Floor 2)"
                    className="border rounded px-3 py-2"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    className="border rounded px-3 py-2"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create</button>
            </form>

            <ul className="divide-y divide-gray-200 bg-white shadow rounded-lg">
                {entitlements.map((ent) => (
                    <li key={ent.id} className="px-4 py-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{ent.name}</p>
                            <p className="text-sm text-gray-500">{ent.description}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(ent.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EntitlementList;
