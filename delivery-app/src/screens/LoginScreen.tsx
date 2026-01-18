import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await login(username, password);
            // Navigation verification happens in RootNavigator automatically via 'user' state
        } catch (e: any) {
            const msg = e.response?.data || 'Błąd logowania';
            if (Platform.OS === 'web') {
                window.alert(msg);
            } else {
                const { Alert } = require('react-native');
                Alert.alert('Błąd', msg);
            }
        } finally {
            setLoading(false);
        }
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
                        <Button
                            title="Zarejestruj się"
                            onPress={() => navigation.navigate('Register')}
                            variant="secondary"
                            style={{ marginTop: 12 }}
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
