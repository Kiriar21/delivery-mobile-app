import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { mockDeliveries } from '../data/mockData';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const DeliveryConfirmationScreen = ({ route, navigation }: any) => {
    const { deliveryId } = route.params || {};
    const { colors } = useTheme();
    const delivery = mockDeliveries.find(d => d.id === deliveryId);

    // Local state for quantities and notes
    const [quantities, setQuantities] = useState<{ [key: string]: string }>(() => {
        const initial: { [key: string]: string } = {};
        delivery?.products.forEach(p => {
            initial[p.id] = (p.quantityDelivered ?? p.quantityOrdered).toString();
        });
        return initial;
    });

    const [notes, setNotes] = useState(delivery?.notes || '');
    const [submitting, setSubmitting] = useState(false);

    if (!delivery) return null;

    const handleQuantityChange = (id: string, value: string) => {
        setQuantities(prev => ({ ...prev, [id]: value }));
    };

    const handleConfirm = () => {
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            Alert.alert('Sukces', 'Dostawa została potwierdzona.', [
                { text: 'OK', onPress: () => navigation.popToTop() }
            ]);
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Card>
                    <Text style={[styles.header, { color: colors.text }]}>Potwierdzenie Dostawy</Text>
                    <Text style={[styles.subHeader, { color: colors.primary }]}>{delivery.deliveryNumber}</Text>
                    <Text style={[styles.date, { color: colors.textLight }]}>{delivery.date}</Text>
                    <Text style={[styles.address, { color: colors.text }]}>{delivery.address}</Text>
                </Card>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Produkty:</Text>
                    {delivery.products.map(p => (
                        <View key={p.id} style={[styles.productRow, { borderBottomColor: colors.border }]}>
                            <View style={styles.productInfo}>
                                <Text style={[styles.productName, { color: colors.text }]}>{p.name}</Text>
                                <Text style={[styles.productOrdered, { color: colors.textLight }]}>Zamówiono: {p.quantityOrdered}</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: colors.textLight }]}>Dostarczono:</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                                    keyboardType="numeric"
                                    value={quantities[p.id]}
                                    onChangeText={(val) => handleQuantityChange(p.id, val)}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Uwagi:</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        multiline
                        numberOfLines={4}
                        placeholder="Wpisz uwagi do dostawy..."
                        placeholderTextColor={colors.textLight}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                <Button
                    title="Zatwierdź i Zakończ"
                    onPress={handleConfirm}
                    loading={submitting}
                    style={styles.button}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
    },
    address: {
        fontSize: 16,
        marginTop: 4,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    productInfo: {
        flex: 1,
        paddingRight: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
    },
    productOrdered: {
        fontSize: 14,
        marginTop: 4,
    },
    inputContainer: {
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    input: {
        width: 80,
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        textAlign: 'center',
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    button: {
        marginTop: 32,
    },
});
