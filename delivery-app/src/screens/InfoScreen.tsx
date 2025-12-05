import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/Card';
import { changelogData, getLatestVersion } from '../data/changelog';

export const InfoScreen = () => {
    const { colors } = useTheme();

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
            <Card>
                <Text style={[styles.label, { color: colors.textLight }]}>Nazwa Aplikacji</Text>
                <Text style={[styles.value, { color: colors.text }]}>Impost Inc.</Text>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={[styles.label, { color: colors.textLight }]}>Autor</Text>
                <Text style={[styles.value, { color: colors.text }]}>Artur</Text>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={[styles.label, { color: colors.textLight }]}>Rok Wydania</Text>
                <Text style={[styles.value, { color: colors.text }]}>2025</Text>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={[styles.label, { color: colors.textLight }]}>Wersja</Text>
                <Text style={[styles.value, { color: colors.text }]}>{getLatestVersion()}</Text>
            </Card>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dziennik Zmian (Changelog)</Text>

            {changelogData.map((log, index) => (
                <Card key={index} style={styles.changelogCard}>
                    <View style={[styles.versionRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.versionText, { color: colors.primary }]}>{log.version}</Text>
                        <Text style={[styles.dateText, { color: colors.textLight }]}>{log.date}</Text>
                    </View>
                    {log.changes.map((change, i) => (
                        <Text key={i} style={[styles.changeText, { color: colors.text }]}>• {change}</Text>
                    ))}
                </Card>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
    },
    label: {
        fontSize: 14,
        marginTop: 8,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 4,
    },
    changelogCard: {
        padding: 16,
        marginBottom: 16,
    },
    versionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    versionText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 14,
    },
    changeText: {
        fontSize: 15,
        marginBottom: 6,
        lineHeight: 22,
    },
});
