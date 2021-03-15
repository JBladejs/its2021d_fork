let app = angular.module('its2021d', [])

app.controller('Ctrl', [ function() {
    let ctrl = this
    console.log('Kontroler wystartował')

    let n = 0

    ctrl.interakcja = function() {
        n++
        console.log('Interakcja', n)
    }
}])