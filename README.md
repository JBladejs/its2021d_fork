# its2021d

Projekty na zaliczenie

* (na 3) nowa kolekcja "tasks"; task to obiekt z datą, krótką nazwą i nazwą; widok tej kolekcji, wraz z filtrowaniem i edycją; widok tasków i endpoint dostarczający ich danych dostępne są dla roli 1.

* (na 4) każde zadanie trzeba przypisać do jednego projektu; osoba nie jest przypisana do projektów, tylko do zadań.

* (na 5) opracować endpointy zasilające okienko opisu projektu; musi być w nim widać listę zadań projektu oraz listę osób które poszczególne zadania wykonują; ponieważ danych do wyświetlenia jest tu bardzo dużo, chcę aby dane o osobach zatrudnionych przy zadaniu były zdobywane na żądanie (czyli wtedy gdy mają być wyświetlone); wszystkie listy obiektów wyświetlane powinny być z uwzględnieniem porcjowanie danych, aby uniknąć skrolowania okienka przeglądarki; będę zwracał uwagę czy nie filtrujecie danych we frontendzie!

Zadania dla studentów po kursie Programowanie Aplikacji Internetowych

* import danych publicznych do lokalnej bazy danych

* generator danych przykładowych

* tutorial integracji OpenStreetMaps ze środowiskiem laboratoryjnym (np. przez https://www.npmjs.com/package/angular-osm)

* tutorial integracji OAuth ze środowiskiem laboratoryjnym

* zbiór obiektów na canvas, parametryzowalnych przez zmienne kontrolera

# REST API

GET /collection                                         wszystkie elementy z kolekcji

GET /collection?_id=ident                               element o identyfikatorze ident

POST /collection            { values... }               dodanie nowego obiektu do kolekcji

PUT /collection             { "_id":"ident", values...} aktualizacja istniejącego obiektu

DELETE /collection                                      usunięcie wszystkich elementów z kolekcji

DELETE /collection?_id=ident                            usunięcie elementu o identyfikatorze ident

