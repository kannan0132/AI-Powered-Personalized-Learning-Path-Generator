import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    const login = async (email, password) => {
        const { data } = await axios.post(`${API_URL}/users/login`, { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const adminLogin = async (email, password, adminKey) => {
        const { data } = await axios.post(`${API_URL}/admin/login`, { email, password, adminKey });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const register = async (name, email, password, adminKey) => {
        const { data } = await axios.post(`${API_URL}/users/register`, { name, email, password, adminKey });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const updateProfile = async (profileData) => {
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        };
        const { data } = await axios.put(`${API_URL}/users/profile`, profileData, config);
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
