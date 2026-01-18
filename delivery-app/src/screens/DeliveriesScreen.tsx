import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Delivery } from '../types/types';

import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const DeliveriesScreen = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter states
    const [showArchived, setShowArchived] = useState(false);
    const [sortByDateDesc, setSortByDateDesc] = useState(true);

    const isCourier = user?.role === 'courier';
    const isClient = user?.role === 'client';

    // Check if this screen is being used as a specific tab via route params
    // Check if this screen is being used as a specific tab via route params
    const filterType = route?.params?.filterType; // 'client_active' | 'client_confirm'

    // 'archive' tab added for couriers
    const [courierTab, setCourierTab] = useState<'my' | 'pool' | 'archive'>('my');
    const [clientTab, setClientTab] = useState<'to_confirm' | 'history'>('to_confirm');

    const fetchDeliveries = async () => {
        try {
            const response = await axios.get(`${API_URL}/deliveries`);
            const mappedData: Delivery[] = response.data.map((d: any) => ({
                id: d.id,
                deliveryNumber: d.id,
                date: d.date,
                address: d.address,
                status: d.status === 'new' ? 'Do dostarczenia' :
                    d.status === 'delivered' ? 'Dostarczone' :
                        d.status === 'assigned' ? 'W drodze' :
                            d.status === 'waiting_for_client' ? 'Oczekuje na potwierdzenie' :
                                d.status === 'disputed' ? 'Zgłoszono problem' :
                                    'Dostarczone w części',
                statusCode: d.status, // Add raw status for filtering!
                products: d.items.map((i: any) => ({
                    id: i.id,
                    name: i.name,
                    quantityOrdered: i.quantity,
                    quantityDelivered: i.confirmed ? i.quantity : undefined
                })),
                archived: d.status === 'delivered'
            }));
            setDeliveries(mappedData);
        } catch (error) {
            console.error('Failed to fetch deliveries', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchDeliveries();
        }, [])
    );

    // Auto-refresh when switching internal tabs
    React.useEffect(() => {
        fetchDeliveries();
    }, [courierTab, clientTab]);

    // Filter data based on courier tab or general role
    const filteredData = deliveries
        .filter(d => {
            if (isCourier) {
                if (courierTab === 'pool') return d.statusCode === 'new';
                if (courierTab === 'archive') return d.statusCode === 'delivered';
                else {
                    // My (Active): assigned, waiting_for_client, disputed.
                    return d.statusCode !== 'new' && d.statusCode !== 'delivered';
                }
            }
            if (isClient && filterType) {
                if (filterType === 'client_active') {
                    // Show: new, assigned, disputed (Active statuses)
                    return d.statusCode === 'new' || d.statusCode === 'assigned' || d.statusCode === 'disputed';
                } else if (filterType === 'client_confirm') {
                    if (clientTab === 'to_confirm') {
                        // Only waiting for client
                        return d.statusCode === 'waiting_for_client';
                    } else {
                        // History: delivered, delivered_partial
                        return d.statusCode === 'delivered' || d.statusCode === 'delivered_partial';
                    }
                }
            }
            // Fallback / Admin
            return showArchived ? true : !d.archived;
        })
        .sort((a, b) => {
            // Priority Sort for Client Confirm: Waiting First!
            if (isClient && filterType === 'client_confirm') {
                if (a.statusCode === 'waiting_for_client' && b.statusCode !== 'waiting_for_client') return -1;
                if (a.statusCode !== 'waiting_for_client' && b.statusCode === 'waiting_for_client') return 1;
            }

            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortByDateDesc ? dateB - dateA : dateA - dateB;
        });

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'Dostarczone': return colors.statusDelivered;
            case 'Dostarczone w części': return colors.statusPartial;
            case 'Oczekuje na potwierdzenie': return colors.statusWaiting;
            case 'Zgłoszono problem': return colors.statusDisputed;
            default: return colors.statusToDeliver;
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Dostarczone': return colors.statusDeliveredText;
            case 'Dostarczone w części': return colors.statusPartialText;
            case 'Oczekuje na potwierdzenie': return colors.statusWaitingText;
            case 'Zgłoszono problem': return colors.statusDisputedText;
            default: return colors.statusToDeliverText;
        }
    };

    const renderItem = ({ item }: { item: Delivery }) => {
        const isWaiting = item.statusCode === 'waiting_for_client';

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: item.id })}
            >
                <Card style={[styles.card, isWaiting && { borderColor: colors.secondary, borderWidth: 2 }]}>
                    {/* Visual Highlight for Waiting Items */}
                    {isWaiting && (
                        <View style={{ backgroundColor: colors.secondary, padding: 4, borderRadius: 4, marginBottom: 8, alignSelf: 'flex-start' }}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>WYMAGA POTWIERDZENIA</Text>
                        </View>
                    )}

                    <View style={styles.row}>
                        <Text style={[styles.deliveryNumber, { color: colors.text }]}>{item.deliveryNumber}</Text>
                        <Text style={[styles.status, { backgroundColor: getStatusBgColor(item.status), color: getStatusTextColor(item.status) }]}>
                            {item.status}
                        </Text>
                    </View>
                    <Text style={[styles.date, { color: colors.textLight }]}>{item.date}</Text>
                    <Text style={[styles.address, { color: colors.text }]}>{item.address}</Text>
                </Card>
            </TouchableOpacity>
        );
    };

    const renderClientActiveSections = () => {
        const assigned = filteredData.filter(d => d.statusCode === 'assigned' || d.statusCode === 'disputed');
        const unassigned = filteredData.filter(d => d.statusCode === 'new');

        return (
            <ScrollView
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchDeliveries} />
                }
            >
                <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>W Realizacji (Przyjęte)</Text>
                </View>
                {assigned.length === 0 ? (
                    <Text style={[styles.emptyTextSmall, { color: colors.textLight }]}>Brak przesyłek w drodze.</Text>
                ) : (
                    assigned.map(item => <View key={item.id}>{renderItem({ item })}</View>)
                )}

                <View style={[styles.sectionHeader, { marginTop: 24, borderBottomColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Oczekujące na Kuriera (Wolne)</Text>
                </View>
                {unassigned.length === 0 ? (
                    <Text style={[styles.emptyTextSmall, { color: colors.textLight }]}>Brak nowych przesyłek.</Text>
                ) : (
                    unassigned.map(item => <View key={item.id}>{renderItem({ item })}</View>)
                )}
            </ScrollView>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Courier Tabs */}
            {isCourier && (
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <TouchableOpacity
                        style={{ flex: 1, padding: 16, borderBottomWidth: 2, borderBottomColor: courierTab === 'my' ? colors.primary : 'transparent' }}
                        onPress={() => setCourierTab('my')}
                    >
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: courierTab === 'my' ? colors.primary : colors.textLight }}>Moje (Aktywne)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flex: 1, padding: 16, borderBottomWidth: 2, borderBottomColor: courierTab === 'pool' ? colors.primary : 'transparent' }}
                        onPress={() => setCourierTab('pool')}
                    >
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: courierTab === 'pool' ? colors.primary : colors.textLight }}>Do przyjęcia</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flex: 1, padding: 16, borderBottomWidth: 2, borderBottomColor: courierTab === 'archive' ? colors.primary : 'transparent' }}
                        onPress={() => setCourierTab('archive')}
                    >
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: courierTab === 'archive' ? colors.primary : colors.textLight }}>Historia</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Client Confirm/History Tabs */}
            {isClient && filterType === 'client_confirm' && (
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <TouchableOpacity
                        style={{ flex: 1, padding: 16, borderBottomWidth: 2, borderBottomColor: clientTab === 'to_confirm' ? colors.primary : 'transparent' }}
                        onPress={() => setClientTab('to_confirm')}
                    >
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: clientTab === 'to_confirm' ? colors.primary : colors.textLight }}>Do Potwierdzenia</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flex: 1, padding: 16, borderBottomWidth: 2, borderBottomColor: clientTab === 'history' ? colors.primary : 'transparent' }}
                        onPress={() => setClientTab('history')}
                    >
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: clientTab === 'history' ? colors.primary : colors.textLight }}>Historia</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setSortByDateDesc(!sortByDateDesc)}
                >
                    <Text style={[styles.filterText, { color: colors.text }]}>Sortuj datą: {sortByDateDesc ? '↓' : '↑'}</Text>
                </TouchableOpacity>

                {/* Only show archive toggle for Admin or fallbacks (non-courier/non-client-tab) */}
                {(!isCourier && (!isClient || !filterType)) && (
                    <View style={styles.toggleContainer}>
                        <Text style={[styles.filterText, { color: colors.text }]}>Archiwum</Text>
                        <Switch
                            value={showArchived}
                            onValueChange={setShowArchived}
                            trackColor={{ false: colors.border, true: colors.secondary }}
                            thumbColor={colors.statusToDeliver}
                        />
                    </View>
                )}
            </View>

            {(user?.role === 'client' || user?.role === 'admin') && (
                <View style={{ padding: 16, paddingBottom: 0 }}>
                    <Button
                        title="+ Nowa Dostawa"
                        onPress={() => navigation.navigate('CreateDelivery')}
                    />
                </View>
            )}

            {/* Conditional Rendering: Custom Split View for Client Active vs Standard FlatList */}
            {isClient && filterType === 'client_active' ? (
                renderClientActiveSections()
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={null}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        fetchDeliveries();
                    }}
                    ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textLight }]}>{loading ? 'Ładowanie...' : 'Brak dostaw do wyświetlenia'}</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    sortButton: {
        padding: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterText: {
        fontSize: 14,
        marginRight: 8,
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    deliveryNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    status: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        fontWeight: '600',
        overflow: 'hidden',
    },
    date: {
        fontSize: 14,
        marginBottom: 4,
    },
    address: {
        fontSize: 15,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    // Sub-section styles
    sectionHeader: {
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc', // or use colors.border if available in scope (it's not here, so plain color or pass style)
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    emptyTextSmall: {
        textAlign: 'center',
        marginBottom: 16,
        fontStyle: 'italic',
        opacity: 0.6
    }
});
