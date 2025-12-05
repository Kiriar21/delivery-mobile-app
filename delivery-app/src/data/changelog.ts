export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const changelogData: ChangelogEntry[] = [
    {
        version: 'v1.1.0',
        date: '2025-12-06',
        changes: [
            'Implementacja Ciemnego Motywu (Dark Mode) w stylu rider/vscode.',
            'Refaktoryzacja komponentów na dynamiczny ThemeContext.',
            'Dodanie przełącznika motywu na Ekranie Głównym.',
            'Wydzielenie changeloga do osobnego pliku.',
        ],
    },
    {
        version: 'v1.0.1',
        date: '2025-12-05',
        changes: [
            'Dodanie większej ilości dostaw (archiwum, przyszłe).',
            'Dodanie ScrollView do ekranów dla lepszej nawigacji.',
            'Implementacja sekcji Changelog.',
        ],
    },
    {
        version: 'v1.0.0',
        date: '2025-12-05',
        changes: [
            'Stworzenie podstawowego layoutu "Vanilla Cream".',
            'Implementacja nawigacji i głównych widoków.',
            'Obsługa logowania i listy dostaw.',
        ],
    },
];

export const getLatestVersion = (): string => {
    if (changelogData.length > 0) {
        return changelogData[0].version;
    }
    return 'v0.0.0';
};
