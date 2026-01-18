export interface Product {
    id: string;
    name: string;
    quantityOrdered: number;
    quantityDelivered?: number; // Optional until set
}

export type DeliveryStatus = 'Do dostarczenia' | 'Dostarczone' | 'Dostarczone w części';

export interface Delivery {
    id: string;
    deliveryNumber: string;
    date: string; // ISO Date string YYYY-MM-DD
    address: string;
    status: DeliveryStatus | string; // Allow string for raw mapping or mapped values
    statusCode?: string; // Raw status from backend
    products: Product[];
    notes?: string;
    archived: boolean;
}

export interface User {
    id: string;
    username: string;
    role: 'admin' | 'user';
}

// Navigation Types
export type RootStackParamList = {
    Login: undefined;
    Main: undefined; // Tab Navigator
};

export type MainTabParamList = {
    Home: undefined;
    Deliveries: undefined;
    ClientActive: { filterType: 'client_active' };
    ClientConfirm: { filterType: 'client_confirm' };
    AdminDashboard: undefined;
    Info: undefined;
};

// Composite for nested stacks if needed, but keeping simple for now.
// We might need a Stack inside "Deliveries" tab for details?
// Actually user asked for: Deliveries List -> Details -> Confirmation.
// So "Deliveries" tab might need its own stack or we put all screens in RootStack but navigate from Tab.
// Let's put DeliveriesStack inside the Tab or just use RootStack for Details/Confirmation to keep tabs visible or not?
// Usually Details covers tabs. Let's put Details/Confirmation in RootStack for simplicity or a nested stack.
// Simpler: RootStack has [Login, MainTabs, DeliveryDetails, DeliveryConfirmation]
// This allows full screen details.

export type RootStackParamListExpanded = {
    Login: undefined;
    Main: undefined;
    DeliveryDetails: { deliveryId: string };
    DeliveryConfirmation: { deliveryId: string };
    CreateDelivery: undefined;
    Register: undefined;
};
