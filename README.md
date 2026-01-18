# Delivery Mobile App

Aplikacja mobilna (React Native + Expo) oraz serwer backendowy (Node.js) do zarządzania procesem dostaw. System obsługuje trzy role użytkowników: Klient, Kurier oraz Administrator.

## Funkcjonalności

- **Logowanie:** Role-based access control (Admin, Kurier, Klient).
- **Klient:**
  - Podgląd swoich zamówień.
  - Usuwanie nowych (nieprzypisanych) zamówień.
  - Potwierdzanie odbioru dostawy.
  - Zgłaszanie problemów z dostawą.
- **Kurier:**
  - Przeglądanie dostępnych zamówień.
  - Pobieranie (przypisywanie) zamówień do realizacji.
  - Rezygnacja z przypisanego zamówienia (jeśli nie rozpoczęto dostarczania).
  - Zmiana statusów (Dostarczone, Problem rozwiązany).
  - Edycja przewidywanej daty dostawy.
  - Rozwiązywanie problemów zgłoszonych przez klientów.
- **Admin:**
  - Pełny wgląd we wszystkie zamówienia i statystyki.
  - Blokowanie użytkowników.
- **System:**
  - Automatyczne generowanie notatek systemowych przy kluczowych zdarzeniach (utworzenie zamówienia, przypisanie kuriera).
  - Statystyki zablokowanych użytkowników dla Administratora.

## Wymagania

- **Node.js** (wersja LTS zalecana)
- **npm** lub **yarn**
- Aplikacja **Expo Go** na telefonie (Android/iOS) lub emulator (Android Studio / Xcode).

## Instalacja i Uruchomienie

Projekt składa się z dwóch części: Backend (serwer) i Frontend (aplikacja mobilna). Obie części muszą działać jednocześnie.

### 1. Pobranie projektu

Sklonuj repozytorium lub pobierz pliki projektu.

### 2. Uruchomienie Backend (Serwer)

Backend zarządza bazą danych (SQLite) i API.

1. Otwórz terminal w głównym katalogu projektu.
2. Przejdź do katalogu backendu:
   ```bash
   cd backend
   ```
3. Zainstaluj zależności:
   ```bash
   npm install
   ```
4. Skonfiguruj zmienne środowiskowe:
   - Skopiuj plik `.env.example` i zmień jego nazwę na `.env`.
   - (Opcjonalnie) Edytuj wartości w `.env`, jeśli chcesz zmienić port lub klucz JWT.
   ```bash
   cp .env.example .env
   # lub ręcznie utwórz plik .env
   ```
5. Uruchom serwer:
   ```bash
   npm start
   ```
   Serwer powinien działać na porcie 3000 (np. `http://localhost:3000`).
   *Baza danych `delivery.sqlite` zostanie utworzona automatycznie przy pierwszym uruchomieniu.*

### 3. Uruchomienie Frontend (Aplikacja Mobilna/Web)

1. Otwórz **nowe okno terminala** w głównym katalogu projektu (`delivery-app`).
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Uruchom aplikację Expo:
   ```bash
   npx expo start --clear
   ```
4. **Opcje uruchomienia:**
   - **Emulator Android (ZALECANE):** Naciśnij `a` w terminalu Expo. Wymaga Android Studio z zainstalowanym emulatorem.
   - **W przeglądarce (Web):** Naciśnij klawisz `w` w terminalu.
   - **Na fizycznym telefonie:** Zeskanuj kod QR za pomocą aplikacji **Expo Go** (Android) lub kamery (iOS). 
     - **UWAGA:** Telefon i komputer muszą być w tej samej sieci Wi-Fi.
     - Jeśli masz problemy z połączeniem, zmień `API_URL` w pliku `src/context/AuthContext.tsx` na IP swojego komputera (np. `http://192.168.1.100:3000`).

## Struktura Plików

- `backend/` - Kod serwera Node.js, API, baza danych SQLite.
  - `server.js` - Główny plik serwera z endpointami API.
  - `database.js` - Konfiguracja bazy danych i seed data.
  - `.env.example` - Przykładowa konfiguracja zmiennych środowiskowych.
- `src/`
  - `screens/` - Ekrany aplikacji (Logowanie, Lista, Szczegóły).
  - `components/` - Komponenty wielokrotnego użytku (Karty, Przyciski).
  - `context/` - Zarządzanie stanem (Auth, Theme).
  - `types/` - Definicje typów TypeScript.
  - `navigation/` - Konfiguracja nawigacji React Navigation.

## Rozwiązywanie Problemów

### Błąd połączenia na fizycznym urządzeniu
Jeśli aplikacja nie może połączyć się z backendem:
1. Upewnij się, że backend działa (`npm start` w katalogu `backend`).
2. Sprawdź czy telefon i komputer są w tej samej sieci Wi-Fi.
3. Zmień `API_URL` w `src/context/AuthContext.tsx`:
   ```typescript
   export const API_URL = 'http://TWOJE_IP:3000'; // np. 192.168.1.100
   ```
4. Zrestartuj Expo (`npx expo start --clear`).

### Expo Go - "Failed to download remote update"
Jeśli widzisz ten błąd, użyj **emulatora Android Studio** zamiast Expo Go na fizycznym urządzeniu.

### Firewall blokuje połączenia
Na Windows, dodaj wyjątek dla Node.js w Windows Defender Firewall na porcie 3000.

## Domyślne Dane Logowania (Seed Data)

Po pierwszym uruchomieniu backendu, baza zostanie zasilona przykładowymi danymi. Przykładowe konta:

- **Kurier:** `driver1` / `password`
- **Klient:** `client1` / `password`
- **Admin:** `admin1` / `password`

## Technologie

- **Frontend:** React Native, Expo, TypeScript, React Navigation, Axios
- **Backend:** Node.js, Express, SQLite, JWT, bcrypt
- **Narzędzia:** Expo CLI, Android Studio (emulator)

