let app = angular.module('its2021d', [])

app.controller('Ctrl', [ '$http', function($http) {
    let ctrl = this
    console.log('Kontroler wystartował')

    let n = 0

    ctrl.x = 17
    ctrl.y = 'ala'
    ctrl.a = 'ola'
    ctrl.b = 18

    ctrl.interakcja = function() {
        n++
        console.log('Interakcja', n)
    }

    ctrl.wyslij = function() {
        $http.post('/endpoint?x=' + ctrl.x + '&y=' + ctrl.y, { a: ctrl.a, b: ctrl.b }).then(
            function(res) {},
            function(err) {}
        )
    }
}])