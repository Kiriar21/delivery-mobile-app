import { Delivery } from '../types/types';

export const mockDeliveries: Delivery[] = [
    // Today
    {
        id: '1',
        deliveryNumber: 'DEL-001',
        date: '2025-12-06',
        address: 'ul. Kwiatowa 15, Warszawa',
        status: 'Do dostarczenia',
        products: [
            { id: 'p1', name: 'Mleko 3.2%', quantityOrdered: 10 },
            { id: 'p2', name: 'Chleb Żytni', quantityOrdered: 5 },
        ],
        archived: false,
    },
    {
        id: '2',
        deliveryNumber: 'DEL-002',
        date: '2025-12-06',
        address: 'Al. Jerozolimskie 100, Warszawa',
        status: 'Dostarczone',
        products: [
            { id: 'p3', name: 'Woda Mineralna', quantityOrdered: 24, quantityDelivered: 24 },
        ],
        archived: false,
    },
    // Past (Archived)
    {
        id: '3',
        deliveryNumber: 'DEL-003',
        date: '2025-12-05',
        address: 'ul. Marszałkowska 50, Warszawa',
        status: 'Dostarczone w części',
        products: [
            { id: 'p4', name: 'Sok Pomarańczowy', quantityOrdered: 12, quantityDelivered: 10 },
        ],
        archived: true,
    },
    {
        id: '4',
        deliveryNumber: 'DEL-004',
        date: '2025-12-01',
        address: 'ul. Polna 2, Pruszków',
        status: 'Dostarczone',
        products: [
            { id: 'p5', name: 'Ziemniaki 5kg', quantityOrdered: 2, quantityDelivered: 2 },
        ],
        archived: true,
    },
    // Future
    {
        id: '5',
        deliveryNumber: 'DEL-005',
        date: '2025-12-10',
        address: 'ul. Długa 44, Warszawa',
        status: 'Do dostarczenia',
        products: [
            { id: 'p6', name: 'Kawa Ziarnista 1kg', quantityOrdered: 5 },
            { id: 'p7', name: 'Cukier Biały', quantityOrdered: 10 },
        ],
        archived: false,
    },
    {
        id: '6',
        deliveryNumber: 'DEL-006',
        date: '2025-12-12',
        address: 'Plac Bankowy 1, Warszawa',
        status: 'Do dostarczenia',
        products: [
            { id: 'p8', name: 'Herbata Czarna', quantityOrdered: 20 },
        ],
        archived: false,
    },
    {
        id: '7',
        deliveryNumber: 'DEL-007',
        date: '2025-12-15',
        address: 'ul. Targowa 12, Warszawa',
        status: 'Do dostarczenia',
        products: [
            { id: 'p9', name: 'Mąka Pszenna', quantityOrdered: 50 },
        ],
        archived: false,
    },
];
