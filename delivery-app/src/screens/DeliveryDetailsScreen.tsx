import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL, useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DeliveryStatus } from '../types/types';

export const DeliveryDetailsScreen = ({ route, navigation }: any) => {
    const { deliveryId } = route.params || {};
    const { colors } = useTheme();
    const [delivery, setDelivery] = useState<any>(null); // Using any for simplicity or reuse type map
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Need user role

    // Date Editing State
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [newEstimatedDate, setNewEstimatedDate] = useState('');

    // Problem Reporting State
    const [isReportingProblem, setIsReportingProblem] = useState(false);
    const [problemNote, setProblemNote] = useState('');

    const handleSaveDate = async () => {
        try {
            await axios.patch(`${API_URL}/deliveries/${deliveryId}/estimated-date`, {
                date: newEstimatedDate
            });
            Alert.alert('Sukces', 'Zaktualizowano datę dostawy');
            setIsEditingDate(false);
            fetchDetails();
        } catch (e) {
            Alert.alert('Błąd', 'Nie udało się zaktualizować daty');
        }
    };

    const fetchDetails = React.useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/deliveries/${deliveryId}`);
            // Map API to UI model
            const d = response.data;
            const mapped: any = { // Using simplified object for this screen or reusing Delivery type
                id: d.id,
                deliveryNumber: d.id,
                date: d.date,
                estimated_date: d.estimated_date,
                address: d.address,
                status: d.status === 'new' ? 'Do dostarczenia' :
                    d.status === 'delivered' ? 'Dostarczone' :
                        d.status === 'assigned' ? 'W drodze' :
                            d.status === 'waiting_for_client' ? 'Oczekuje na potwierdzenie' :
                                d.status === 'disputed' ? 'Zgłoszono problem' :
                                    'Dostarczone w części',
                statusCode: d.status, // raw status
                clientName: d.clientName,
                courier_name: d.courier_name,
                courier_username: d.courier_username,
                notes: d.notes,
                items: (d.items || []).map((i: any) => ({
                    id: i.id,
                    name: i.name,
                    quantityOrdered: i.quantity,
                    quantityDelivered: i.delivered_quantity || 0,
                    quantityPending: i.pending_quantity || 0 // New field
                })),
                products: (d.items || []).map((i: any) => ({
                    id: i.id,
                    name: i.name,
                    quantityOrdered: i.quantity,
                    quantityDelivered: i.delivered_quantity || 0,
                    quantityPending: i.pending_quantity || 0 // New field
                })),
            };
            setDelivery(mapped);
        } catch (error) {
            console.error('Fetch details error', error);
        } finally {
            setLoading(false);
        }
    }, [deliveryId]);

    useFocusEffect(
        React.useCallback(() => {
            fetchDetails();
        }, [fetchDetails])
    );

    const handleAssign = async () => {
        try {
            setLoading(true);
            await axios.patch(`${API_URL}/deliveries/${deliveryId}/assign`);
            Alert.alert('Sukces', 'Przypisano dostawę do Ciebie');
            fetchDetails(); // refresh
        } catch (e) {
            Alert.alert('Błąd', 'Nie udało się przypisać dostawy');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text }}>Ładowanie...</Text>
            </View>
        );
    }

    if (!delivery) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>Nie znaleziono dostawy.</Text>
            </View>
        );
    }

    // Status options removed as this is read-only view now

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Card>
                <Text style={[styles.label, { color: colors.textLight }]}>Numer Dostawy:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{delivery.deliveryNumber}</Text>

                <Text style={[styles.label, { color: colors.textLight }]}>Adres:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{delivery.address}</Text>

                <Text style={[styles.label, { color: colors.textLight }]}>Data Zamówienia:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{delivery.date}</Text>

                <Text style={[styles.label, { color: colors.textLight }]}>Przewidywana Dostawa:</Text>
                {/* Edit Mode for Courier */}
                {isEditingDate ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <TextInput
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 4,
                                padding: 8,
                                color: colors.text,
                                marginRight: 8,
                                backgroundColor: colors.surface
                            }}
                            value={newEstimatedDate}
                            onChangeText={setNewEstimatedDate}
                            placeholder="DD.MM.YYYY"
                            placeholderTextColor={colors.textLight}
                        />
                        <Button
                            title="OK"
                            onPress={handleSaveDate}
                            style={{ marginRight: 4, paddingHorizontal: 16, paddingVertical: 8 }}
                        />
                        <TouchableOpacity onPress={() => setIsEditingDate(false)}>
                            <Text style={{ color: colors.error, padding: 8 }}>Anuluj</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={[styles.value, { color: colors.primary, fontWeight: 'bold', marginBottom: 0, marginRight: 10 }]}>
                            {delivery.estimated_date || 'Brak danych'}
                        </Text>

                        {/* Only allow edit if:
                            1. User is Admin
                            2. OR User is Courier AND delivery is assigned (not 'new')
                            AND delivery is not yet delivered/completed 
                        */}
                        {((user?.role === 'admin') || (user?.role === 'courier' && delivery.statusCode !== 'new'))
                            && delivery.statusCode !== 'delivered' && (
                                <TouchableOpacity onPress={() => {
                                    setNewEstimatedDate(delivery.estimated_date || '');
                                    setIsEditingDate(true);
                                }}>
                                    <Text style={{ color: colors.primary, fontSize: 13, textDecorationLine: 'underline' }}>Zmień</Text>
                                </TouchableOpacity>
                            )}
                    </View>
                )}

                {delivery.clientName && (
                    <>
                        <Text style={[styles.label, { color: colors.textLight }]}>Zamawiający:</Text>
                        <Text style={[styles.value, { color: colors.text }]}>{delivery.clientName}</Text>
                    </>
                )}

                {delivery.courier_name && (
                    <>
                        <Text style={[styles.label, { color: colors.textLight }]}>Kurier:</Text>
                        <Text style={[styles.value, { color: colors.text }]}>
                            {delivery.courier_name} {delivery.courier_username ? `(@${delivery.courier_username})` : ''}
                        </Text>
                    </>
                )}

                {delivery.notes && (
                    <>
                        <Text style={[styles.label, { color: colors.textLight }]}>Uwagi:</Text>
                        <Text style={[styles.value, { color: colors.text, fontStyle: 'italic' }]}>{delivery.notes}</Text>
                    </>
                )}
            </Card>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Status:</Text>
                <Text style={[
                    styles.statusText,
                    { color: delivery.status === 'Do dostarczenia' ? colors.text : delivery.status === 'Dostarczone' ? colors.success : colors.warning, textAlign: 'left', fontWeight: 'bold' }
                ]}>
                    {delivery.status}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Produkty:</Text>
                {delivery.products.map((p: any) => (
                    <View key={p.id} style={[styles.productRow, { borderBottomColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.productName, { color: colors.text }]}>{p.name}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.productQty, { color: colors.textLight, fontSize: 12 }]}>Zam: {p.quantityOrdered}</Text>
                            <Text style={[styles.productQty, { color: colors.success, fontSize: 12 }]}>Dost: {p.quantityDelivered}</Text>
                            {p.quantityPending > 0 && (
                                <Text style={[styles.productQty, { color: colors.warning, fontWeight: 'bold' }]}>
                                    W drodze: +{p.quantityPending}
                                </Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>

            {/* Action Buttons */}

            {/* Client - Delete Order (If new) */}
            {(user?.role === 'client' || user?.role === 'admin') && delivery.statusCode === 'new' && (
                <Button
                    title="Usuń zamówienie"
                    onPress={() => {
                        const deleteOrder = async () => {
                            try {
                                await axios.delete(`${API_URL}/deliveries/${deliveryId}`);
                                if (Platform.OS === 'web') {
                                    window.alert('Sukces: Zamówienie usunięte.');
                                } else {
                                    Alert.alert('Sukces', 'Zamówienie usunięte.');
                                }
                                navigation.goBack();
                            } catch (e) {
                                if (Platform.OS === 'web') {
                                    window.alert('Błąd: Nie udało się usunąć zamówienia.');
                                } else {
                                    Alert.alert('Błąd', 'Nie udało się usunąć zamówienia.');
                                }
                            }
                        };

                        if (Platform.OS === 'web') {
                            if (window.confirm('Czy na pewno chcesz usunąć to zamówienie?')) {
                                deleteOrder();
                            }
                        } else {
                            Alert.alert(
                                'Potwierdzenie',
                                'Czy na pewno chcesz usunąć to zamówienie?',
                                [
                                    { text: 'Nie', style: 'cancel' },
                                    { text: 'Tak, usuń', style: 'destructive', onPress: deleteOrder }
                                ]
                            );
                        }
                    }}
                    style={{ backgroundColor: colors.error, marginBottom: 50, marginTop: 20 }}
                />
            )}

            {/* Courier - Pick Up (Assign) */}
            {user?.role === 'courier' && (delivery.statusCode === 'new') && (
                <Button
                    title="Pobierz paczkę (Przypisz do mnie)"
                    onPress={handleAssign}
                    style={styles.confirmButton}
                />
            )}

            {/* Courier - Abandon (Unassign) if assigned to ME and not delivered */}
            {user?.role === 'courier' && delivery.statusCode === 'assigned' && delivery.items.every((i: any) => i.quantityDelivered === 0) && (
                <View style={{ marginBottom: 20 }}>
                    <TouchableOpacity onPress={() => {
                        const abandonOrder = async () => {
                            try {
                                await axios.patch(`${API_URL}/deliveries/${deliveryId}/unassign`);
                                if (Platform.OS === 'web') {
                                    window.alert('Sukces: Zrezygnowano z zamówienia.');
                                } else {
                                    Alert.alert('Sukces', 'Zrezygnowano z zamówienia.');
                                }
                                navigation.goBack();
                            } catch (e: any) {
                                const msg = e.response?.data || 'Nie udało się zrezygnować.';
                                if (Platform.OS === 'web') {
                                    window.alert(`Błąd: ${msg}`);
                                } else {
                                    Alert.alert('Błąd', msg);
                                }
                            }
                        };

                        if (Platform.OS === 'web') {
                            if (window.confirm('Czy na pewno chcesz zrezygnować z tego zamówienia? Trafi ono z powrotem do puli wolnych zleceń.')) {
                                abandonOrder();
                            }
                        } else {
                            Alert.alert(
                                'Potwierdzenie',
                                'Czy na pewno chcesz zrezygnować z tego zamówienia? Trafi ono z powrotem do puli wolnych zleceń.',
                                [
                                    { text: 'Nie', style: 'cancel' },
                                    { text: 'Tak, rezygnuję', style: 'destructive', onPress: abandonOrder }
                                ]
                            );
                        }
                    }}>
                        <Text style={{ color: colors.error, textAlign: 'center', fontWeight: 'bold', textDecorationLine: 'underline', padding: 10 }}>
                            Rezygnuj z zamówienia (pomyłka)
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {(user?.role === 'courier' || user?.role === 'admin') &&
                (delivery.statusCode === 'assigned' || delivery.statusCode === 'delivered_partial') && (
                    <Button
                        title="Zgłoś Dostarczenie / Szczegóły"
                        onPress={() => navigation.navigate('DeliveryConfirmation', { deliveryId })}
                        style={styles.confirmButton}
                    />
                )}

            {/* Courier Resolve Problem Action */}
            {(user?.role === 'courier' || user?.role === 'admin') && delivery.statusCode === 'disputed' && (
                <View style={{ marginBottom: 50 }}>
                    <Text style={{ textAlign: 'center', marginBottom: 12, color: colors.error, fontWeight: 'bold' }}>
                        Klient zgłosił problem.
                    </Text>
                    <Button
                        title="Rozwiązano Problem"
                        onPress={async () => {
                            try {
                                await axios.post(`${API_URL}/deliveries/${deliveryId}/resolve-problem`);
                                Alert.alert('Sukces', 'Problem oznaczony jako rozwiązany. Klient musi teraz ponownie potwierdzić.');
                                fetchDetails();
                            } catch (e) { Alert.alert('Błąd', 'Nie udało się oznaczyć problemu jako rozwiązany'); }
                        }}
                        style={{ backgroundColor: colors.success }}
                    />
                </View>
            )}

            {/* Client Actions: Confirm Receipt or Report Problem */}
            {(user?.role === 'client' || user?.role === 'admin') && delivery.statusCode === 'disputed' && (
                <Text style={{ textAlign: 'center', marginBottom: 50, color: colors.error, fontWeight: 'bold', fontSize: 16 }}>
                    Oczekiwanie na rozwiązanie problemu przez kuriera.
                </Text>
            )}

            {(user?.role === 'client' || user?.role === 'admin') && delivery.statusCode === 'waiting_for_client' && (
                <View style={{ marginBottom: 50 }}>
                    <Text style={{ textAlign: 'center', marginBottom: 12, color: colors.warning, fontWeight: 'bold' }}>
                        Kurier oznaczył dostawę jako zakończoną. Potwierdź odbiór.
                    </Text>
                    <Button
                        title="Potwierdzam Odbiór"
                        onPress={async () => {
                            try {
                                await axios.post(`${API_URL}/deliveries/${deliveryId}/client-confirm`);
                                Alert.alert('Sukces', 'Dostawa zakończona pomyślnie.');
                                fetchDetails();
                            } catch (e) { Alert.alert('Błąd', 'Nie udało się potwierdzić'); }
                        }}
                        style={{ marginBottom: 12, backgroundColor: colors.success }}
                    />

                    {/* Report Problem Section */}
                    {!isReportingProblem ? (
                        <Button
                            title="Zgłoś Problem"
                            onPress={() => setIsReportingProblem(true)}
                            variant="secondary"
                            style={{ backgroundColor: colors.error }}
                            textStyle={{ color: 'white' }}
                        />
                    ) : (
                        <View style={{ marginTop: 12, padding: 12, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.error }}>
                            <Text style={{ color: colors.error, fontWeight: 'bold', marginBottom: 8 }}>Opisz problem:</Text>
                            <TextInput
                                style={{
                                    backgroundColor: colors.background,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 4,
                                    padding: 8,
                                    color: colors.text,
                                    height: 80,
                                    textAlignVertical: 'top',
                                    marginBottom: 12
                                }}
                                multiline
                                value={problemNote}
                                onChangeText={setProblemNote}
                                placeholder="Np. uszkodzone opakowanie, brak elementu..."
                                placeholderTextColor={colors.textLight}
                            />
                            <Button
                                title="Wyślij Zgłoszenie"
                                onPress={async () => {
                                    if (!problemNote.trim()) {
                                        Alert.alert('Błąd', 'Podaj opis problemu.');
                                        return;
                                    }
                                    try {
                                        await axios.post(`${API_URL}/deliveries/${deliveryId}/report-problem`, {
                                            notes: problemNote
                                        });
                                        Alert.alert('Zgłoszono', 'Status dostawy zmieniony na sporny.');
                                        setIsReportingProblem(false);
                                        setProblemNote('');
                                        fetchDetails();
                                    } catch (e) { Alert.alert('Błąd', 'Nie udało się zgłosić problemu'); }
                                }}
                                style={{ marginBottom: 8, backgroundColor: colors.error }}
                            />
                            <Button
                                title="Anuluj"
                                onPress={() => {
                                    setIsReportingProblem(false);
                                    setProblemNote('');
                                }}
                                variant="secondary"
                            />
                        </View>
                    )}
                </View>
            )}
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
