import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeType } from '../theme/colors';

const ThemeContext = createContext({
    theme: 'light' as ThemeType,
    colors: lightColors,
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<ThemeType>('light');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            let savedTheme: string | null = null;
            if (Platform.OS === 'web') {
                savedTheme = localStorage.getItem('appTheme');
            } else {
                savedTheme = await AsyncStorage.getItem('appTheme');
            }

            if (savedTheme === 'light' || savedTheme === 'dark') {
                setTheme(savedTheme as ThemeType);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem('appTheme', newTheme);
            } else {
                await AsyncStorage.setItem('appTheme', newTheme);
            }
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const colors = theme === 'light' ? lightColors : darkColors;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
