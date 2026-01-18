import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../context/AuthContext';
import { Card } from '../components/Card';

export const AdminDashboardScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]); // For disputed deliveries
    const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'reports'>('users');

    const fetchData = async () => {
        try {
            const statsRes = await axios.get(`${API_URL}/stats`);
            setStats(statsRes.data);
            const usersRes = await axios.get(`${API_URL}/users`);
            setUsers(usersRes.data);

            // Fetch all deliveries to filter disputed ones
            const deliveriesRes = await axios.get(`${API_URL}/deliveries`);
            const disputed = deliveriesRes.data.filter((d: any) => d.status === 'disputed');
            setReports(disputed);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleActiveUser = (userId: number, userName: string, currentStatus: number) => {
        const isBlocking = currentStatus !== 0; // If active (not 0), we block. If 0 (blocked), we unblock.
        const action = isBlocking ? 'zablokować' : 'odblokować';
        const endpoint = isBlocking ? 'deactivate' : 'reactivate';

        // Web support for confirmation
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`Czy na pewno chcesz ${action} użytkownika ${userName}?`);
            if (confirmed) {
                (async () => {
                    try {
                        await axios.patch(`${API_URL}/users/${userId}/${endpoint}`);
                        window.alert(`Sukces: Użytkownik został ${isBlocking ? 'zablokowany' : 'odblokowany'}.`);
                        fetchData();
                    } catch (e) {
                        window.alert('Błąd: Nie udało się zmienić statusu użytkownika.');
                    }
                })();
            }
            return;
        }

        Alert.alert(
            'Potwierdzenie',
            `Czy na pewno chcesz ${action} użytkownika ${userName}?`,
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: isBlocking ? 'Zablokuj' : 'Odblokuj',
                    style: isBlocking ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            await axios.patch(`${API_URL}/users/${userId}/${endpoint}`);
                            Alert.alert('Sukces', `Użytkownik został ${isBlocking ? 'zablokowany' : 'odblokowany'}.`);
                            fetchData();
                        } catch (e) {
                            Alert.alert('Błąd', `Nie udało się zmienić statusu użytkownika.`);
                        }
                    }
                }
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const renderUserSection = (role: 'client' | 'courier', title: string) => {
        const roleUsers = users.filter(u => u.role === role);
        return (
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{title} ({roleUsers.length})</Text>
                {roleUsers.length === 0 ? (
                    <Text style={{ color: colors.textLight, fontStyle: 'italic' }}>Brak użytkowników.</Text>
                ) : (
                    roleUsers.map(u => (
                        <Card key={u.id} style={styles.userCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.userName, { color: colors.text }]}>{u.name}</Text>
                                <Text style={[styles.userLogin, { color: colors.textLight }]}>@{u.username}</Text>
                                {u.is_active === 0 && <Text style={{ color: colors.error, fontSize: 12, fontWeight: 'bold' }}>ZABLOKOWANY</Text>}
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: u.is_active === 0 ? colors.success : colors.error,
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 4,
                                    marginLeft: 8
                                }}
                                onPress={() => toggleActiveUser(u.id, u.name, u.is_active)}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    {u.is_active === 0 ? 'Odblokuj' : 'Zablokuj'}
                                </Text>
                            </TouchableOpacity>
                        </Card>
                    ))
                )}
            </View>
        );
    };

    // Import helper or use navigation prop if passed, but AdminDashboardScreen export usually doesn't destructure navigation?
    // Checking previous usage... tab navigator usually passes it. 
    // We need navigation to go to delivery details.

    // Re-declare component with props if needed. But let's assume `useNavigation` hook or props.
    // The export at line 9 is `export const AdminDashboardScreen = () => {`.
    // I will replace it to `export const AdminDashboardScreen = ({ navigation }: any) => {` in a separate edit or assume access?
    // Wait, let's fix the signature in this edit block if possible, or use useNavigation.
    // I'll stick to replacing the body for now, but I need navigation.
    // I can't change line 9 easily with this block. I'll use `import { useNavigation } from '@react-navigation/native';`?
    // No, I can replace the whole file content or a large chunk including line 9.
    // Actually, let's just assume I can add `const navigation = useNavigation();` if I import it.
    // Better: I will use the `replace_file_content` to fix line 9 as well.
    // Ah, multi_replace_file_content or a large single block.
    // I'll just change the props at line 9 and then the rest.

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Tabs Header */}
            <View style={[styles.tabHeader, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'users' && { borderBottomColor: colors.primary }]}
                    onPress={() => setActiveTab('users')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'users' ? colors.primary : colors.textLight }]}>Użytkownicy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'reports' && { borderBottomColor: colors.primary }]}
                    onPress={() => setActiveTab('reports')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'reports' ? colors.primary : colors.textLight }]}>Zgłoszenia ({reports.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'stats' && { borderBottomColor: colors.primary }]}
                    onPress={() => setActiveTab('stats')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'stats' ? colors.primary : colors.textLight }]}>Statystyki</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'users' ? (
                    <>
                        {renderUserSection('client', 'Klienci')}
                        {renderUserSection('courier', 'Kurierzy')}
                    </>
                ) : activeTab === 'reports' ? (
                    <View>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Zgłoszone Problemy ({reports.length})</Text>
                        {reports.length === 0 ? (
                            <Text style={{ color: colors.textLight, fontStyle: 'italic' }}>Brak zgłoszeń.</Text>
                        ) : (
                            reports.map(item => (
                                <TouchableOpacity key={item.id} onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: item.id })}>
                                    {/* We need navigation here. */}
                                    <Card style={{ marginBottom: 12, borderColor: colors.error, borderWidth: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>{item.deliveryNumber}</Text>
                                            <Text style={{ color: colors.error, fontWeight: 'bold' }}>PROBLEM</Text>
                                        </View>
                                        <Text style={{ color: colors.textLight }}>Data: {item.date}</Text>
                                        <Text style={{ color: colors.text }}>Adres: {item.address}</Text>
                                        {item.courier_name && <Text style={{ color: colors.textLight }}>Kurier: {item.courier_name}</Text>}
                                    </Card>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                ) : (
                    <View style={styles.statsContainer}>
                        <Card style={styles.statCard}>
                            <Text style={[styles.statValue, { color: colors.primary }]}>{stats?.deliveriesTotal || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.textLight }]}>Wszystkie Dostawy</Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={[styles.statValue, { color: colors.success }]}>{stats?.deliveriesDelivered || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.textLight }]}>Dostarczone</Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats?.clients || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.textLight }]}>Klienci w bazie</Text>
                            <Text style={{ color: stats?.blockedClients > 0 ? colors.error : colors.textLight, fontSize: 12, marginTop: 4 }}>
                                (Zablokowani: {stats?.blockedClients || 0})
                            </Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats?.couriers || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.textLight }]}>Kurierzy w bazie</Text>
                            <Text style={{ color: stats?.blockedCouriers > 0 ? colors.error : colors.textLight, fontSize: 12, marginTop: 4 }}>
                                (Zablokowani: {stats?.blockedCouriers || 0})
                            </Text>
                        </Card>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabButton: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    userCard: {
        marginBottom: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userLogin: {
        fontSize: 14,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        marginBottom: 16,
        alignItems: 'center',
        paddingVertical: 24,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
    },
});
