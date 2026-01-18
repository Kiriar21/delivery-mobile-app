import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamListExpanded } from '../types/types';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { DeliveryDetailsScreen } from '../screens/DeliveryDetailsScreen';
import { DeliveryConfirmationScreen } from '../screens/DeliveryConfirmationScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { CreateDeliveryScreen } from '../screens/CreateDeliveryScreen';
import { useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamListExpanded>();

export const RootNavigator = () => {
    const { colors } = useTheme();

    return (
        <AuthProvider>
            <RootNavigatorContent />
        </AuthProvider>
    );
};

const RootNavigatorContent = () => {
    const { colors } = useTheme();
    const { user, isLoading } = useAuth(); // If we want to auto-redirect based on user state, or we just rely on navigation

    if (isLoading) {
        // We could show a splash screen here
        return null;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            {user ? (
                // Authenticated Stack
                <>
                    <Stack.Screen
                        name="Main"
                        component={TabNavigator}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="DeliveryDetails"
                        component={DeliveryDetailsScreen}
                        options={{ title: 'Szczegóły Dostawy' }}
                    />
                    <Stack.Screen
                        name="DeliveryConfirmation"
                        component={DeliveryConfirmationScreen}
                        options={{ title: 'Potwierdzenie' }}
                    />
                    <Stack.Screen
                        name="CreateDelivery"
                        component={CreateDeliveryScreen}
                        options={{ title: 'Nowe Zamówienie' }}
                    />
                </>
            ) : (
                // Auth Stack
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ headerShown: false }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};
