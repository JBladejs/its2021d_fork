let app = angular.module('its2021d', [])

app.controller('Ctrl', [ '$http', function($http) {
    let ctrl = this
    console.log('Kontroler wystartował')

    // filtry
    ctrl.search = ''
    ctrl.data = { total: 0, filtered: 0, records: [] }
    ctrl.skip = 0
    ctrl.dataPortion = 10
    ctrl.limit = ctrl.dataPortion

    // porządek
    ctrl.sort = 'lastName'

    ctrl.selected = -1
    ctrl.lastChanged = null
    ctrl.newPerson = { firstName: '', lastName: '', email: '' }
    ctrl.editedPerson = { index: -1, firstName: '', lastName: '', email: '' }

    ctrl.pobierzWszystkie = function() {
        $http.get('/person?sort=' + ctrl.sort + '&search=' + ctrl.search + "&skip=" + ctrl.skip + "&limit=" + ctrl.limit).then(
            function(res) {
                ctrl.data = res.data
                ctrl.editedPerson.index = -1
            },
            function(err) {}
        )
    }

    ctrl.pobierzWszystkieOdZera = function() {
        ctrl.skip = 0
        ctrl.pobierzWszystkie()
    }

    ctrl.wyslij = function() {
        $http.post('/person', ctrl.newPerson).then(
            function(res) {
                setLastChanged(res.data._id, function() {
                    ctrl.newPerson.firstName = ''
                    ctrl.newPerson.lastName = ''
                    ctrl.newPerson.email = ''
                    ctrl.pobierzWszystkie()    
                })
            },
            function(err) {}
        )
    }

    ctrl.zeruj = function() {
        $http.delete('/person').then(
            function(res) {
                ctrl.lastChanged = null
                ctrl.pobierzWszystkieOdZera()
            },
            function(err) {}
        )
    }

    ctrl.wybierz = function(index) {
        $http.get('/person?_id=' + ctrl.data.records[index]._id).then(
            function(res) {
                ctrl.editedPerson = res.data
                ctrl.editedPerson.index = index
                ctrl.lastChanged = null
            },
            function(err) {}
        )
    }

    ctrl.zapisz = function() {
        delete ctrl.editedPerson.index
        $http.put('/person', ctrl.editedPerson).then(
            function(res) {
                setLastChanged(ctrl.editedPerson._id, function() {
                    ctrl.pobierzWszystkie()
                })
            },
            function(err) {}
        )
    }

    ctrl.usun = function(index) {
        $http.delete('/person?_id=' + ctrl.data.records[index]._id).then(
            function(res) {
                ctrl.lastChanged = null
                if(ctrl.skip + 1 >= ctrl.data.filtered)
                    ctrl.poprzedniaPorcja()
                else 
                    ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.pobierzWszystkie()

    ctrl.doczytaj = function() {
        ctrl.limit += ctrl.dataPortion
        ctrl.pobierzWszystkie()
    }

    ctrl.poprzedniaPorcja = function() {
        ctrl.skip -= ctrl.limit
        if(ctrl.skip < 0) ctrl.skip = 0
        ctrl.pobierzWszystkie()
    }

    ctrl.nastepnaPorcja = function() {
        ctrl.skip += ctrl.limit
        ctrl.pobierzWszystkie()
    }

    var setLastChanged = function(_id, nextTick) {
        $http.get('/person?search=' + ctrl.search).then(
            function(res) {
                let index = res.data.records.findIndex(function(el) { return el._id == _id } )
                if(index < 0) {
                    ctrl.lastChanged = null
                } else {
                    ctrl.lastChanged = _id
                    ctrl.skip = Math.floor(index / ctrl.limit) * ctrl.limit
                }
                nextTick()
            },
            function(err) {
                nextTick()
            }
        )
    }

    ctrl.resort = function(field) {
        ctrl.sort = field
        ctrl.pobierzWszystkieOdZera()
    }
}])