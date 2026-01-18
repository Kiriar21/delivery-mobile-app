import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const DeliveryConfirmationScreen = ({ route, navigation }: any) => {
    const { deliveryId } = route.params || {};
    const { colors } = useTheme();
    const [delivery, setDelivery] = useState<any>(null);
    const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch fresh details again to be sure
    React.useEffect(() => {
        const fetch = async () => {
            try {
                const response = await axios.get(`${API_URL}/deliveries/${deliveryId}`);
                const d = response.data;
                setDelivery(d);
                const initial: { [key: string]: string } = {};
                d.items.forEach((p: any) => {
                    const remaining = p.quantity - (p.delivered_quantity || 0);
                    initial[p.id] = remaining.toString();
                });
                setQuantities(initial);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();
    }, [deliveryId]);


    if (!delivery) return null;

    const handleQuantityChange = (id: string, text: string) => {
        const item = delivery.items.find((p: any) => p.id === id);
        if (!item) return;

        const maxRemaining = item.quantity - (item.delivered_quantity || 0);
        let cleaned = text.replace(/[^0-9]/g, '');

        // Prevent leading zeros issues if needed, but parseInt handles it check logic
        const numVal = parseInt(cleaned, 10);

        if (!isNaN(numVal) && numVal > maxRemaining) {
            cleaned = maxRemaining.toString();
            // Optional: User feedback could go here
        }

        setQuantities(prev => ({ ...prev, [id]: cleaned }));
    };

    const handleConfirm = async () => {
        // Calculate total pending quantity
        const totalPending = Object.values(quantities).reduce((acc, val) => {
            const num = parseInt(val) || 0;
            return acc + num;
        }, 0);

        if (totalPending <= 0) {
            if (Platform.OS === 'web') {
                window.alert('Musisz zgłosić dostarczenie przynajmniej jednego produktu.');
            } else {
                Alert.alert('Błąd', 'Musisz zgłosić dostarczenie przynajmniej jednego produktu.');
            }
            return;
        }

        // Confirmation before action (Web only for now, standard practice)
        if (Platform.OS === 'web') {
            const confirmAction = window.confirm("Czy na pewno chcesz zgłosić dostarczenie?");
            if (!confirmAction) return; // Stop if user clicks Cancel
        }

        setSubmitting(true);
        try {
            // Updated Flow:
            // 1. Send item updates (pending quantities)
            // 2. Complete delivery (change status to waiting_for_client)

            const itemsToUpdate = Object.keys(quantities).map(key => {
                const qtyInput = parseInt(quantities[key]);
                return {
                    id: key,
                    pending_quantity: isNaN(qtyInput) ? 0 : qtyInput
                };
            });

            await axios.patch(`${API_URL}/deliveries/${deliveryId}/items`, { items: itemsToUpdate });
            await axios.post(`${API_URL}/deliveries/${deliveryId}/complete`, {
                status: 'waiting_for_client',
                notes: notes // Send the notes entered by courier
            });

            const successMsg = 'Zgłoszono dostarczenie. Oczekiwanie na potwierdzenie klienta.';

            if (Platform.OS === 'web') {
                // Use alert for success, as there is nothing to "Cancel" anymore
                window.alert(`Sukces: ${successMsg}`);
                navigation.popToTop();
            } else {
                Alert.alert('Sukces', successMsg, [
                    { text: 'OK', onPress: () => navigation.popToTop() }
                ]);
            }
        } catch (e) {
            console.error(e);
            if (Platform.OS === 'web') {
                window.alert('Wystąpił błąd podczas zatwierdzania.');
            } else {
                Alert.alert('Błąd', 'Wystąpił błąd podczas zatwierdzania.');
            }
        } finally {
            setSubmitting(false);
        }
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
                    {delivery.items.map((p: any) => (
                        <View key={p.id} style={[styles.productRow, { borderBottomColor: colors.border }]}>
                            <View style={styles.productInfo}>
                                <Text style={[styles.productName, { color: colors.text }]}>{p.name}</Text>
                                <Text style={[styles.productOrdered, { color: colors.textLight }]}>Zamówiono: {p.quantity}</Text>
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

                {/* Display Existing Notes History */}
                {delivery.notes ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Historia Uwag:</Text>
                        <Card style={{ backgroundColor: colors.surface, padding: 12 }}>
                            <Text style={{ color: colors.text }}>{delivery.notes}</Text>
                        </Card>
                    </View>
                ) : null}

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
                    title="Zgłoś Dostarczenie (Czekaj na klienta)"
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
