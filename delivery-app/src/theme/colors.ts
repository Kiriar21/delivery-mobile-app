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
};

export const darkColors: ThemeColors = {
    // Rider / VSCode (Dark)
    background: '#1E1E1E',     // VSCode Dark
    surface: '#252526',        // Sidebar/List
    primary: '#007ACC',        // VSCode Blue
    primaryText: '#FFFFFF',
    secondary: '#569CD6',      // Syntax Blue
    text: '#D4D4D4',           // Light Grey
    textLight: '#858585',      // Comment Grey
    border: '#3E3E42',         // Dark Border
    error: '#F48771',          // Soft Red
    success: '#89D185',        // Soft Green
    warning: '#DCDCAA',        // Gentle Yellow
    statusToDeliver: '#4D4D4D',
    statusToDeliverText: '#DCDCAA',
    statusDelivered: '#2E3C43',
    statusDeliveredText: '#89D185',
    statusPartial: '#4D3830',
    statusPartialText: '#D7BA7D',
};

export type ThemeType = 'light' | 'dark';

// Default export for backward compatibility during refactor (Points to Light)
export const colors = lightColors;
