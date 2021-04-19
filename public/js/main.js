let app = angular.module('its2021d', [])

app.controller('Ctrl', [ '$http', function($http) {
    let ctrl = this
    console.log('Kontroler wystartował')

    ctrl.selected = -1
    ctrl.edited = -1

    ctrl.newPerson = { firstName: '', lastName: '' }
    ctrl.editedPerson = { firstName: '', lastName: '' }

    ctrl.persons = []

    ctrl.pobierzWszystkie = function() {
        $http.get('/endpoint').then(
            function(res) {
                ctrl.persons = res.data
            },
            function(err) {}
        )
    }

    ctrl.wyslij = function() {
        $http.post('/endpoint', ctrl.newPerson).then(
            function(res) {
                ctrl.newPerson.firstName = ''
                ctrl.newPerson.lastName = ''
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.zeruj = function() {
        $http.delete('/endpoint').then(
            function(res) {
                ctrl.persons = res.data
            },
            function(err) {}
        )
    }

    ctrl.wybierz = function(index) {
        ctrl.edited = index
        $http.get('/endpoint?id=' + index).then(
            function(res) {
                ctrl.editedPerson = res.data
            },
            function(err) {}
        )
    }

    ctrl.zapisz = function(index) {
        ctrl.edited = -1
        $http.put('/endpoint?id=' + index, ctrl.editedPerson).then(
            function(res) {
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.usun = function(index) {
        ctrl.edited = -1
        $http.delete('/endpoint?id=' + index).then(
            function(res) {
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.pobierzWszystkie()
}])