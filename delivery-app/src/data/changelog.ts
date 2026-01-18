
interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const changelog: ChangelogEntry[] = [
    {
        version: '1.3.0',
        date: '2026-01-18', // Assuming today is the date of release
        changes: [
            'Dostawy Częściowe: Pełna obsługa delivered/pending quantity, potwierdzanie częściowe przez klienta.',
            'Zaawansowane Uwagi: Automatyczne logi systemowe (Utworzono, Zgłoszono Dostarczenie, Potwierdzono).',
            'Zgłaszanie Problemów: Możliwość dodania opisu problemu przez klienta; nowa zakładka "Zgłoszenia" w panelu Admina.',
            'Panel Administratora: Zarządzanie użytkownikami (blokada), statystyki i podgląd spornych dostaw.',
            'Przewidywany Czas: Automatyczne ustawianie (+1 dzień), edycja tylko dla przypisanego kuriera/admina.',
            'Tworzenie Dostawy: Ulepszony formularz (usuwanie wierszy, walidacja webowa, auto-data).',
            'Walidacja Danych: Blokada zerowych dostaw, sanitizacja inputów liczbowych, wymóg min. 1 produktu.',
            'Interfejs Kuriera: Zakładki (Moje/Do przyjęcia/Historia), historia uwag w potwierdzeniu.',
            'UX/UI: Odświeżanie danych przy nawigacji, persistent dark mode, poprawki etykiet w historii.'
        ]
    },
    {
        version: '1.2.0',
        date: '2025-01-18',
        changes: [
            'Wdrożono pełną integrację z bazą danych SQLite backendu.',
            'Dodano obsługę ról: Klient, Kurier, Admin.',
            'Klient: Rozdzielono widok na menu dolne: "Zamówienia" (aktywne) i "Do Odbioru" (historia/potwierdzenie).',
            'Klient: Dodano wymóg potwierdzenia odbioru dostawy ("waiting_for_client").',
            'Klient: Możliwość zgłoszenia problemu z dostawą ("disputed").',
            'Kurier: System zakładek "Moje" i "Do przyjęcia" dla lepszej organizacji pracy.',
            'Kurier: Zmiana przepływu - zakończenie dostawy ustawia status oczekiwania na klienta.',
            'Admin: Pełny podgląd wszystkich dostaw w systemie.',
            'Dodano autorski system statusów i kolorów (oczekujące, sporne, częściowe).',
            'Poprawiono interfejs Web (obsługa alertów i nawigacji).',
            'Zoptymalizowano tryb ciemny (wysoki kontrast).',
            'Dodano zabezpieczenia inputów (tylko liczby w ilościach).',
            'Environment: Dodano konfigurację .env i autodetekcję IP dla Android/Web.'
        ]
    },
    {
        version: '1.1.0',
        date: '2025-01-10',
        changes: [
            'Dodano ekran rejestracji użytkownika.',
            'Zintegrowano tokeny JWT do autoryzacji.',
            'Stworzono podstawowy szkielet API node.js.'
        ]
    },
    {
        version: '1.0.0',
        date: '2025-01-01',
        changes: [
            'Inicjalizacja projektu React Native Expo.',
            'Stworzenie podstawowych widoków UI (Login, Lista Dostaw).',
            'Konfiguracja nawigacji.'
        ]
    }
];

export const getLatestVersion = () => changelog[0].version;
