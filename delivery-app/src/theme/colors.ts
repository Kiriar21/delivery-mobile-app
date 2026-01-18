// Theme Palette Definition

interface ThemeColors {
    background: string;
    surface: string;
    primary: string;
    primaryText: string;
    secondary: string;
    text: string;
    textLight: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    statusToDeliver: string;
    statusToDeliverText: string;
    statusDelivered: string;
    statusDeliveredText: string;
    statusPartial: string;
    statusPartialText: string;
    statusWaiting: string;
    statusWaitingText: string;
    statusDisputed: string;
    statusDisputedText: string;
}

export const lightColors: ThemeColors = {
    // Vanilla Cream (Light)
    background: '#FDFCF0',
    surface: '#FFFBE6',
    primary: '#D4AF37',
    primaryText: '#FFFFFF',
    secondary: '#C19A6B',
    text: '#3E2723',
    textLight: '#5D4037',
    border: '#E0E0E0',
    error: '#BA1A1A',
    success: '#4CAF50',
    warning: '#FFC107',
    statusToDeliver: '#FFF9C4',
    statusToDeliverText: '#FBC02D',
    statusDelivered: '#E8F5E9',
    statusDeliveredText: '#388E3C',
    statusPartial: '#FFF3E0',
    statusPartialText: '#F57C00',
    statusWaiting: '#E3F2FD', // Light Blue
    statusWaitingText: '#0277BD',
    statusDisputed: '#FFEBEE', // Light Red
    statusDisputedText: '#C62828',
};

export const darkColors: ThemeColors = {
    // Rider / VSCode (Dark) - High Contrast
    background: '#121212',     // Almost Black
    surface: '#1E1E1E',        // Dark Grey
    primary: '#2196F3',        // Softer Blue
    primaryText: '#FFFFFF',
    secondary: '#64B5F6',      // Light Blue
    text: '#E0E0E0',           // Off-White (High Contrast)
    textLight: '#B0B0B0',      // Light Grey
    border: '#333333',         // Dark Border
    error: '#CF6679',          // Material Error
    success: '#81C784',        // Material Success
    warning: '#FFD54F',        // Material Warning
    statusToDeliver: '#424242',
    statusToDeliverText: '#FFF176',
    statusDelivered: '#1B5E20',
    statusDeliveredText: '#E8F5E9',
    statusPartial: '#3E2723',
    statusPartialText: '#FFCC80',
    statusWaiting: '#01579B', // Deep Blue
    statusWaitingText: '#E1F5FE',
    statusDisputed: '#B71C1C', // Deep Red
    statusDisputedText: '#FFEBEE',
};

export type ThemeType = 'light' | 'dark';

// Default export for backward compatibility during refactor (Points to Light)
export const colors = lightColors;
