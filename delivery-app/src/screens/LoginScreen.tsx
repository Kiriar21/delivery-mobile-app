import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../context/ThemeContext';

export const LoginScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        // Mock network delay & check
        setTimeout(() => {
            setLoading(false);
            if (username === 'admin' && password === 'admin') {
                navigation.replace('Main');
            } else {
                Alert.alert('Błąd logowania', 'Nieprawidłowy login lub hasło.');
            }
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[
                    styles.formContainer,
                    { backgroundColor: colors.surface, borderColor: colors.border }
                ]}>
                    <View style={styles.logoContainer}>
                        <Text style={[styles.title, { color: colors.text }]}>Impost Inc.</Text>
                        <Text style={[styles.subtitle, { color: colors.secondary }]}>System Dostaw</Text>
                    </View>

                    <Input
                        label="Login"
                        placeholder="Wpisz login"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <Input
                        label="Hasło"
                        placeholder="Wpisz hasło"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Zaloguj się"
                            onPress={handleLogin}
                            loading={loading}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    formContainer: {
        padding: 24,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: 24,
    },
});
