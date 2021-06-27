app.controller('Persons', [ '$http', 'common', function($http, common) {
    let ctrl = this
    console.log('Kontroler Persons wystartował')

    // filtry
    ctrl.search = ''
    ctrl.data = { total: 0, filtered: 0, records: [] }
    ctrl.skip = 0
    ctrl.dataPortion = 10
    ctrl.limit = ctrl.dataPortion

    // porządek
    ctrl.sort = 'lastName'

    ctrl.selected = -1
    ctrl.newPerson = { shortName: '', lastName: '', email: '', tasks: [] }
    ctrl.editedPerson = { index: -1, firstName: '', lastName: '', email: '', tasks: [] }
    ctrl.tasks = []

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
                ctrl.pobierzWszystkie()
                common.showAlert('success', 'Utworzono osobę ' + res.data.firstName + ' ' + res.data.lastName)
                ctrl.newPerson.firstName = ''    
                ctrl.newPerson.lastName = ''
                ctrl.newPerson.email = ''
                ctrl.newPerson.tasks = []
            },
            function(err) {}
        )
    }

    ctrl.zeruj = function() {
        let options = { title: 'Uwaga', body: 'Czy na pewno chcesz usunąć wszystkie osoby?' }
        common.confirm(options, function(res) {
            if(res) {
                $http.delete('/person').then(
                    function(res) {
                        ctrl.pobierzWszystkieOdZera()
                        common.showAlert('success', 'Usunięto wszystkie osoby')
                    },
                    function(err) {}
                )        
            }
        })
    }

    ctrl.wybierz = function(index) {
        $http.get('/person?_id=' + ctrl.data.records[index]._id).then(
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
                ctrl.pobierzWszystkie()
                common.showAlert('success', 'Zmodyfikowano osobę ' + res.data.firstName + ' ' + res.data.lastName)
            },
            function(err) {}
        )
    }

    ctrl.usun = function(index) {
        let to_del = ctrl.data.records[index].firstName + ' ' + ctrl.data.records[index].lastName
        $http.delete('/person?_id=' + ctrl.data.records[index]._id).then(
            function(res) {
                if(ctrl.skip + 1 >= ctrl.data.filtered)
                    ctrl.poprzedniaPorcja()
                else 
                    ctrl.pobierzWszystkie()
                common.showAlert('success', 'Usunięto osobę ' + to_del)
            },
            function(err) {}
        )
    }

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

    ctrl.resort = function(field) {
        ctrl.sort = field
        ctrl.pobierzWszystkieOdZera()
    }

    ctrl.isVisible = function() {
        return common.menu.find(function(el) { return el.route == '/persons' })
    }

    ctrl.pobierzWszystkie()
    $http.get('/task').then(
        function(res) { ctrl.tasks = res.data.records },
        function(err) {}
    )

}])