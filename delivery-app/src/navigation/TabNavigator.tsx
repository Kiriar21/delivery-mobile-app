import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MainTabParamList } from '../types/types';
import { HomeScreen } from '../screens/HomeScreen';
import { DeliveriesScreen } from '../screens/DeliveriesScreen';
import { InfoScreen } from '../screens/InfoScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ name, color }: { name: string; color: string }) => (
    <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>{name[0]}</Text>
);

export const TabNavigator = () => {
    const { colors } = useTheme();
    const { user } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border
                },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '600' },
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.border
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textLight,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Strona Główna',
                    tabBarIcon: ({ color }) => <TabIcon name="H" color={color} />
                }}
            />

            {/* Conditional Tabs */}
            {user?.role === 'client' ? (
                <>
                    <Tab.Screen
                        name="ClientActive"
                        component={DeliveriesScreen}
                        initialParams={{ filterType: 'client_active' }}
                        options={{
                            title: 'Zamówienia',
                            tabBarIcon: ({ color }) => <TabIcon name="Z" color={color} />
                        }}
                    />
                    <Tab.Screen
                        name="ClientConfirm"
                        component={DeliveriesScreen}
                        initialParams={{ filterType: 'client_confirm' }}
                        options={{
                            title: 'Do Odbioru',
                            tabBarIcon: ({ color }) => <TabIcon name="O" color={color} />
                        }}
                    />
                </>
            ) : (
                <Tab.Screen
                    name="Deliveries"
                    component={DeliveriesScreen}
                    options={{
                        title: 'Dostawy',
                        tabBarIcon: ({ color }) => <TabIcon name="D" color={color} />
                    }}
                />
            )}

            {/* Admin Dashboard Tab */}
            {user?.role === 'admin' && (
                <Tab.Screen
                    name="AdminDashboard"
                    component={AdminDashboardScreen}
                    options={{
                        title: 'Panel',
                        tabBarIcon: ({ color }) => <TabIcon name="P" color={color} />
                    }}
                />
            )}

            <Tab.Screen
                name="Info"
                component={InfoScreen}
                options={{
                    title: 'Informacje',
                    tabBarIcon: ({ color }) => <TabIcon name="I" color={color} />
                }}
            />
        </Tab.Navigator>
    );
};
