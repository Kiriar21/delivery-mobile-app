import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    textStyle?: any; // Allow custom text style overrides
}

export const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', loading, style, ...props }) => {
    const { colors } = useTheme();

    const getBackgroundColor = () => {
        if (variant === 'primary') return colors.primary;
        if (variant === 'secondary') return colors.secondary;
        return 'transparent';
    };

    const getTextColor = () => {
        if (variant === 'outline') return colors.primary;
        return colors.primaryText;
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: variant === 'outline' ? colors.primary : undefined,
                    borderWidth: variant === 'outline' ? 1 : 0,
                },
                style,
                props.disabled && styles.disabled
            ]}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }, props.textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
