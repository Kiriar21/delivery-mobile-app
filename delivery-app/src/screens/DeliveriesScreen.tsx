import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { mockDeliveries } from '../data/mockData';
import { Card } from '../components/Card';
import { Delivery } from '../types/types';

export const DeliveriesScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const [showArchived, setShowArchived] = useState(false);
    const [sortByDateDesc, setSortByDateDesc] = useState(true);

    const filteredData = mockDeliveries
        .filter(d => showArchived ? true : !d.archived)
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortByDateDesc ? dateB - dateA : dateA - dateB;
        });

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'Dostarczone': return colors.statusDelivered;
            case 'Dostarczone w części': return colors.statusPartial;
            default: return colors.statusToDeliver;
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Dostarczone': return colors.statusDeliveredText;
            case 'Dostarczone w części': return colors.statusPartialText;
            default: return colors.statusToDeliverText;
        }
    };

    const renderItem = ({ item }: { item: Delivery }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: item.id })}
        >
            <Card style={styles.card}>
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setSortByDateDesc(!sortByDateDesc)}
                >
                    <Text style={[styles.filterText, { color: colors.text }]}>Sortuj datą: {sortByDateDesc ? '↓' : '↑'}</Text>
                </TouchableOpacity>

                <View style={styles.toggleContainer}>
                    <Text style={[styles.filterText, { color: colors.text }]}>Archiwum</Text>
                    <Switch
                        value={showArchived}
                        onValueChange={setShowArchived}
                        trackColor={{ false: colors.border, true: colors.secondary }}
                        thumbColor={colors.statusToDeliver} // Using valid color
                    />
                </View>
            </View>

            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textLight }]}>Brak dostaw do wyświetlenia</Text>}
            />
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
});
