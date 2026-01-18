import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/Card';

export const HomeScreen = () => {
    const { colors, theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    const isDark = theme === 'dark';

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
            <Card style={styles.contentCard}>
                <Text style={[styles.title, { color: colors.text }]}>Impost Inc.</Text>
                <Text style={[styles.description, { color: colors.textLight }]}>
                    Aplikacja do zarządzania procesem dostaw i weryfikacji zamówień.
                </Text>
                <Text style={[styles.description, { color: colors.textLight }]}>
                    Wybierz "Dostawy" z dolnego menu, aby rozpocząć pracę.
                </Text>
            </Card>

            <View style={styles.themeToggleContainer}>
                <Text style={[styles.themeText, { color: colors.text }]}>Tryb Ciemny</Text>
                <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#767577', true: colors.primary }}
                    thumbColor={isDark ? colors.primaryText : '#f4f3f4'}
                />
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.secondary }]}>
                    Zalogowano jako: {user?.name || user?.username || 'Gość'}
                </Text>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text style={[styles.logoutText, { color: colors.error }]}>Wyloguj się</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
    },
    contentCard: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 24,
    },
    themeToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        padding: 12,
    },
    themeText: {
        fontSize: 16,
        marginRight: 12,
        fontWeight: '600',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        marginBottom: 12,
    },
    logoutButton: {
        padding: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
