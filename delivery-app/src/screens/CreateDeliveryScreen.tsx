import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../context/AuthContext';

export const CreateDeliveryScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const [address, setAddress] = useState('');
    // Date is now handled automatically backend/implicitly
    const [notes, setNotes] = useState('');

    // Simple item management
    const [items, setItems] = useState<{ name: string, quantity: string }[]>([{ name: '', quantity: '' }]);
    const [loading, setLoading] = useState(false);

    const addItem = () => setItems([...items, { name: '', quantity: '' }]);

    const updateItem = (index: number, field: 'name' | 'quantity', value: string) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleCreate = async () => {
        if (Platform.OS === 'web') {
            if (!address) {
                window.alert('Podaj adres dostawy.');
                return;
            }
            for (let i = 0; i < items.length; i++) {
                if (!items[i].name) {
                    window.alert(`Podaj nazwę produktu w wierszu ${i + 1}.`);
                    return;
                }
                if (!items[i].quantity) {
                    window.alert(`Podaj ilość produktu w wierszu ${i + 1}.`);
                    return;
                }
                const qty = parseInt(items[i].quantity);
                if (isNaN(qty) || qty < 1) {
                    window.alert(`Ilość produktu w wierszu ${i + 1} musi wynosić minimum 1.`);
                    return;
                }
            }
        } else {
            // Native fallback
            if (!address || items.some(i => !i.name || !i.quantity || parseInt(i.quantity) < 1)) {
                Alert.alert('Błąd', 'Uzupełnij wszystkie wymagane pola. Ilość musi być min. 1.');
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                address,
                date: new Date().toISOString().split('T')[0],
                notes,
                items: items.map(i => ({ name: i.name, quantity: parseInt(i.quantity) }))
            };

            await axios.post(`${API_URL}/deliveries`, payload);
            if (Platform.OS === 'web') {
                const confirm = window.confirm('Sukces: Dostawa utworzona. Czy chcesz wrócić?');
                if (confirm) navigation.goBack();
            } else {
                Alert.alert('Sukces', 'Dostawa utworzona', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Błąd', 'Nie udało się utworzyć dostawy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.header, { color: colors.text }]}>Nowa Dostawa</Text>

                <Input label="Adres" value={address} onChangeText={setAddress} placeholder="Ulica, Miasto" />

                <Text style={[styles.sectionHeader, { color: colors.text }]}>Produkty</Text>
                {items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={{ flex: 2, marginRight: 8 }}>
                            <Input
                                placeholder="Nazwa produktu"
                                value={item.name}
                                onChangeText={(t) => updateItem(index, 'name', t)}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Input
                                placeholder="Ilość"
                                keyboardType="numeric"
                                value={item.quantity}
                                onChangeText={(t) => updateItem(index, 'quantity', t.replace(/[^0-9]/g, ''))}
                            />
                        </View>
                        {items.length > 1 && (
                            <TouchableOpacity onPress={() => removeItem(index)} style={styles.removeButton}>
                                <Text style={{ color: colors.error || 'red', fontWeight: 'bold', fontSize: 20 }}>×</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                <Button title="+ Dodaj produkt" onPress={addItem} variant="secondary" style={styles.addButton} />

                <Input
                    label="Uwagi"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    style={{ height: 80, textAlignVertical: 'top' }}
                />

                <Button title="Utwórz Dostawę" onPress={handleCreate} loading={loading} style={{ marginTop: 24 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flexGrow: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    addButton: {
        marginBottom: 16,
    },
    removeButton: {
        justifyContent: 'center',
        paddingLeft: 12,
        paddingRight: 4
    }
});
