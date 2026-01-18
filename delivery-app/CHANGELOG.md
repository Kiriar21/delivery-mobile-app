# Changelog

Wszystkie znaczące zmiany w tym projekcie będą dokumentowane w tym pliku.

## [Unreleased]

### Dodano
- **Web Support:**
  - Pełna obsługa przeglądarek internetowych.
  - Zastosowano `Platform.OS` do warunkowego wyświetlania alertów (`window.alert`/`window.confirm` dla Web vs `Alert.alert` dla Native).
- **Backend:**
  - Plik `.env.example` z przykładową konfiguracją środowiska.
  - Automatyczne dodawanie notatek systemowych:
    - Przy utworzeniu zamówienia: `[Data Czas] [KLIENT]: UTWORZONO zamówienie.`
    - Przy przypisaniu kuriera: `[Data Czas] [KURIER]: Przyjęto do realizacji.`
  - Nowe endpointy API:
    - `DELETE /deliveries/:id` - umożliwia klientowi usunięcie zamówienia o statusie `new`.
    - `PATCH /deliveries/:id/unassign` - umożliwia kurierowi rezygnację z przypisanego zamówienia (o ile nie rozpoczęto dostarczania).
- **Frontend:**
  - **DeliveryDetailsScreen:**
    - Przycisk "Usuń zamówienie" dla klienta (tylko dla statusu `new`).
    - Przycisk "Rezygnuj z zamówienia (pomyłka)" dla kuriera (zwalnia przypisanie).
  - **AdminDashboardScreen:**
    - Wyświetlanie liczby zablokowanych klientów i kurierów w statystykach.

### Zmieniono
- **LoginScreen:** Usunięto zahardcodowane dane logowania (pola są teraz domyślnie puste).
- **Konfiguracja:** Zaktualizowano `.gitignore` o pliki backendowe (`backend/.env`, `backend/node_modules`) i pliki bazy danych (`*.sqlite`, `*.db`).
- **Dokumentacja:** Utworzono szczegółowy plik `README.md` w języku polskim.

### Naprawiono
- **Błędy Web:** Naprawiono błąd `Uncaught ReferenceError: user is not defined` występujący w wersji przeglądarkowej aplikacji.
- **Logika Alertów:** Naprawiono brakujące okna dialogowe potwierdzenia akcji na platformie Web.
