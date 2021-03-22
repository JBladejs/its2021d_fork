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
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.pobierzWszystkie()
}])