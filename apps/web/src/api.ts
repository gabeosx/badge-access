import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    withCredentials: true,
});

export const assignEntitlement = (username: string, entitlementId: string) => {
    return api.post(`/api/users/${username}/entitlements`, { entitlementId });
};

export const removeEntitlement = (username: string, entitlementId: string) => {
    return api.delete(`/api/users/${username}/entitlements/${entitlementId}`);
};

export const getEntitlements = () => {
    return api.get('/api/entitlements');
};

export default api;
