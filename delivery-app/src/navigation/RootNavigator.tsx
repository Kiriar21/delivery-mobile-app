import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamListExpanded } from '../types/types';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { DeliveryDetailsScreen } from '../screens/DeliveryDetailsScreen';
import { DeliveryConfirmationScreen } from '../screens/DeliveryConfirmationScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamListExpanded>();

export const RootNavigator = () => {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
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
        </Stack.Navigator>
    );
};
