import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { mockDeliveries } from '../data/mockData';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DeliveryStatus } from '../types/types';

export const DeliveryDetailsScreen = ({ route, navigation }: any) => {
    const { deliveryId } = route.params || {};
    const { colors } = useTheme();
    const delivery = mockDeliveries.find(d => d.id === deliveryId);

    // Local state for demo purposes - in real app this would sync with backend/context
    const [status, setStatus] = useState<DeliveryStatus>(delivery?.status || 'Do dostarczenia');

    if (!delivery) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>Nie znaleziono dostawy.</Text>
            </View>
        );
    }

    const statusOptions: DeliveryStatus[] = ['Do dostarczenia', 'Dostarczone', 'Dostarczone w części'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Dostarczone': return colors.success;
            case 'Dostarczone w części': return colors.warning;
            default: return colors.text;
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Card>
                <Text style={[styles.label, { color: colors.textLight }]}>Numer Dostawy:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{delivery.deliveryNumber}</Text>

                <Text style={[styles.label, { color: colors.textLight }]}>Adres:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{delivery.address}</Text>

                <Text style={[styles.label, { color: colors.textLight }]}>Data:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{delivery.date}</Text>
            </Card>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Status:</Text>
                <View style={styles.statusContainer}>
                    {statusOptions.map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            style={[
                                styles.statusOption,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                                status === opt && {
                                    backgroundColor: colors.background,
                                    borderColor: getStatusColor(opt),
                                    borderWidth: 2
                                }
                            ]}
                            onPress={() => setStatus(opt)}
                        >
                            <Text style={[
                                styles.statusText,
                                { color: colors.text },
                                status === opt && { color: getStatusColor(opt), fontWeight: 'bold' }
                            ]}>
                                {opt}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Produkty:</Text>
                {delivery.products.map(p => (
                    <View key={p.id} style={[styles.productRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.productName, { color: colors.text }]}>{p.name}</Text>
                        <Text style={[styles.productQty, { color: colors.text }]}>{p.quantityOrdered} szt.</Text>
                    </View>
                ))}
            </View>

            <Button
                title="Potwierdź Dostawę / Szczegóły"
                onPress={() => navigation.navigate('DeliveryConfirmation', { deliveryId })}
                style={styles.confirmButton}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    label: {
        fontSize: 14,
        marginTop: 8,
    },
    value: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
    },
    section: {
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statusContainer: {
        flexDirection: 'column',
    },
    statusOption: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 16,
        textAlign: 'center',
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    productName: {
        fontSize: 16,
        flex: 1,
    },
    productQty: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmButton: {
        marginTop: 32,
        marginBottom: 50,
    },
});
