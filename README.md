# its2021d

Zadania dla studentów po kursie Programowanie Aplikacji Internetowych

* import danych publicznych do lokalnej bazy danych

* generator danych przykładowych

* tutorial integracji OpenStreetMaps ze środowiskiem laboratoryjnym (np. przez https://www.npmjs.com/package/angular-osm)

* tutorial integracji OAuth ze środowiskiem laboratoryjnym

* zbiór obiektów na canvas, parametryzowalnych przez zmienne kontrolera

# REST API

GET /collection                             wszystkie elementy z kolekcji

GET /collection?_id=ident                   element o identyfikatorze ident

POST /collection            { values... }   dodanie nowego obiektu do kolekcji

PUT /collection             { _id:"ident", values...}   aktualizacja istniejącego obiektu

DELETE /collection                          usunięcie wszystkich elementów z kolekcji

DELETE /collection?_id=ident                usunięcie elementu o identyfikatorze ident

