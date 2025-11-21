import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    username: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in (e.g. by checking cookie or local storage, 
        // but since we use httpOnly cookie, we might need an endpoint /me. 
        // For now, we'll just rely on login state persistence if we had it, 
        // or just redirect to login if 401. 
        // Let's assume session is lost on refresh for simplicity unless we add /me endpoint.
        // I'll add a quick /me check if I have time, but for now default to null.
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        navigate('/dashboard');
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
