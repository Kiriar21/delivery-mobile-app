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
  - Podgląd trasy na mapie (zewnętrzna aplikacja).
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
   - **Na telefonie:** Zeskanuj kod QR za pomocą aplikacji **Expo Go** (Android) lub kamery (iOS). *Upewnij się, że telefon i komputer są w tej samej sieci Wi-Fi.*
   - **W przeglądarce (Web):** Naciśnij klawisz `w` w terminalu.
   - **Na emulatorze:** Naciśnij `a` (Android) lub `i` (iOS).

## Struktura Plików

- `backend/` - Kod serwera Node.js, API, baza danych SQLite.
- `src/`
  - `screens/` - Ekrany aplikacji (Logowanie, Lista, Szczegóły).
  - `components/` - Komponenty wielokrotnego użytku (Karty, Przyciski).
  - `context/` - Zarządzanie stanem (Auth, Theme).
  - `types/` - Definicje typów TypeScript.

## Uwagi dla Deweloperów

- Jeśli masz problemy z połączeniem na telefonie (błąd Network Error), upewnij się, że w pliku `backend/server.js` lub w konfiguracji klienta (Frontend) adres IP serwera jest poprawny (zamiast `localhost` użyj lokalnego IP komputera, np. `192.168.x.x`, jeśli testujesz na fizycznym urządzeniu).
- Plik bazy danych `backend/delivery.sqlite` jest ignorowany przez git.

## Domyślne Dane Logowania (Seed Data)

Po pierwszym uruchomieniu backendu, baza zostanie zasilona przykładowymi danymi. Przykładowe konta (jeśli zostały utworzone przez skrypt `database.js`):

- **Kurier:** `driver1` / `password`
- **Klient:** `client1` / `password`
- **Admin:** `admin1` / `password`
