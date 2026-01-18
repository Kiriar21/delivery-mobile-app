import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { register } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('client'); // default role
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !password || !name) {
            // Basic validation
            return;
        }

        setLoading(true);
        const success = await register(username, password, name, role);
        setLoading(false);

        if (success) {
            navigation.navigate('Login');
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
                    <View style={styles.headerContainer}>
                        <Text style={[styles.title, { color: colors.text }]}>Rejestracja</Text>
                    </View>

                    <Input
                        label="Nazwa wyświetlana"
                        placeholder="Np. Jan Kowalski"
                        value={name}
                        onChangeText={setName}
                    />

                    <Input
                        label="Login"
                        placeholder="Wybierz login"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <Input
                        label="Hasło"
                        placeholder="Hasło"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* Role Selection */}
                    <Text style={[styles.label, { color: colors.text }]}>Typ konta:</Text>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'client' && { backgroundColor: colors.primary }]}
                            onPress={() => setRole('client')}
                        >
                            <Text style={[styles.roleText, role === 'client' && { color: '#fff' }]}>Zamawiający</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'courier' && { backgroundColor: colors.primary }]}
                            onPress={() => setRole('courier')}
                        >
                            <Text style={[styles.roleText, role === 'courier' && { color: '#fff' }]}>Dostawca</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Zarejestruj się"
                            onPress={handleRegister}
                            loading={loading}
                        />
                        <Button
                            title="Powrót do logowania"
                            onPress={() => navigation.goBack()}
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
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginTop: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 12,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
