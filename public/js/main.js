let app = angular.module('its2021d', [])

app.controller('Ctrl', [ '$http', function($http) {
    let ctrl = this
    console.log('Kontroler wystartował')

    ctrl.person = { firstName: '', lastName: '' }

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
        $http.post('/endpoint', ctrl.person).then(
            function(res) {
                ctrl.person.firstName = ''
                ctrl.person.lastName = ''
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
        $http.get('/endpoint?id=' + index).then(
            function(res) {
                console.log(res.data)
            },
            function(err) {}
        )
    }

    ctrl.pobierzWszystkie()
}])