let app = angular.module('its2021d', [])

app.controller('Ctrl', [ '$http', function($http) {
    let ctrl = this
    console.log('Kontroler wystartował')

    ctrl.search = ''
    ctrl.skip = 0
    ctrl.limit = 3
    ctrl.selected = -1

    ctrl.newPerson = { firstName: '', lastName: '', email: '' }
    ctrl.editedPerson = { index: -1, firstName: '', lastName: '', email: '' }

    ctrl.persons = []

    ctrl.pobierzWszystkie = function() {
        $http.get('/person?search=' + ctrl.search + "&skip=" + ctrl.skip + "&limit=" + ctrl.limit).then(
            function(res) {
                ctrl.persons = res.data.data
            },
            function(err) {}
        )
    }

    ctrl.wyslij = function() {
        $http.post('/person', ctrl.newPerson).then(
            function(res) {
                ctrl.newPerson.firstName = ''
                ctrl.newPerson.lastName = ''
                ctrl.newPerson.email = ''
                ctrl.editedPerson.index = -1
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.zeruj = function() {
        $http.delete('/person').then(
            function(res) {
                ctrl.persons = res.data
            },
            function(err) {}
        )
    }

    ctrl.wybierz = function(index) {
        $http.get('/person?_id=' + ctrl.persons[index]._id).then(
            function(res) {
                ctrl.editedPerson = res.data
                ctrl.editedPerson.index = index
            },
            function(err) {}
        )
    }

    ctrl.zapisz = function() {
        delete ctrl.editedPerson.index
        $http.put('/person', ctrl.editedPerson).then(
            function(res) {
                ctrl.editedPerson.index = -1
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.usun = function(index) {
        $http.delete('/person?_id=' + ctrl.persons[index]._id).then(
            function(res) {
                ctrl.editedPerson.index = -1
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.pobierzWszystkie()

    ctrl.doczytaj = function() {
        ctrl.limit += 3
        ctrl.pobierzWszystkie()
    }

    ctrl.poprzedniaPorcja = function() {
        ctrl.skip -= ctrl.limit
        ctrl.pobierzWszystkie()
    }

    ctrl.nastepnaPorcja = function() {
        ctrl.skip += ctrl.limit
        ctrl.pobierzWszystkie()
    }
}])