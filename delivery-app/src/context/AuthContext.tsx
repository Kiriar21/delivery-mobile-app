import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Alert } from 'react-native';

import { Platform } from 'react-native';

// Auto-detect URL based on platform
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

// Safe Storage Helper (AsyncStorage Only)
const SafeStorage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await AsyncStorage.setItem(key, value);
        }
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    }
};

interface User {
    id: number;
    username: string;
    role: string;
    name: string;
}

interface AuthContextData {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, name: string, role: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await SafeStorage.getItem('userToken');
            const storedUser = await SafeStorage.getItem('userInfo');

            if (storedToken && storedUser) {
                // Optional: Check if token is expired
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                // Set default axios header
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        } catch (e) {
            console.error('Failed to load storage data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/auth/login`, { username, password });

            const { token: newToken, user: newUser } = response.data;

            setToken(newToken);
            setUser(newUser);

            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            await SafeStorage.setItem('userToken', newToken);
            await SafeStorage.setItem('userInfo', JSON.stringify(newUser));

        } catch (error) {
            console.error('Login error', error);
            // Alert.alert('Błąd logowania', 'Nieprawidłowy login lub hasło lub błąd serwera.'); // Handled in UI layer now
            if (axios.isAxiosError(error)) {
                console.log('Axios error details:', error.response?.data, error.response?.status, error.message);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string, name: string, role: string) => {
        try {
            setIsLoading(true);
            await axios.post(`${API_URL}/auth/register`, { username, password, name, role });
            return true;
        } catch (error) {
            console.error('Register error', error);
            Alert.alert('Błąd rejestracji', 'Nie udało się zarejestrować użytkownika.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        await SafeStorage.deleteItem('userToken');
        await SafeStorage.deleteItem('userInfo');
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
