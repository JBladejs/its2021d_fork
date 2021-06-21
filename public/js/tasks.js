app.controller('Tasks', [ '$http', 'common',  function($http, common) {
    let ctrl = this
    console.log('Kontroler Tasks wystartował')

    // filtry
    ctrl.search = ''
    ctrl.data = { total: 0, filtered: 0, records: [] }
    ctrl.skip = 0
    ctrl.dataPortion = 10
    ctrl.limit = ctrl.dataPortion

    // porządek
    ctrl.sort = 'shortName'

    ctrl.selected = -1
    ctrl.newTask = { shortName: '', name: '', date: '' }
    ctrl.editedTask = { index: -1, shortName: '', name: '', date: '' }

    ctrl.convert = function(date) {
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        if (day < 10) day = "0" + day
        if (month < 10) month = "0" + month
        return day + "/" + month + "/" + year
    }

    ctrl.pobierzWszystkie = function() {
        $http.get('/task?sort=' + ctrl.sort + '&search=' + ctrl.search + "&skip=" + ctrl.skip + "&limit=" + ctrl.limit).then(
            function(res) {
                ctrl.data = res.data
                ctrl.editedTask.index = -1
            },
            function(err) {}
        )
    }

    ctrl.pobierzWszystkieOdZera = function() {
        ctrl.skip = 0
        ctrl.pobierzWszystkie()
    }

    ctrl.wyslij = function() {
        ctrl.newTask.date = ctrl.convert(ctrl.newTask.date)
        $http.post('/task', ctrl.newTask).then(
            function(res) {
                ctrl.newTask.shortName = ''
                ctrl.newTask.name = ''
                ctrl.newTask.date = ''
                ctrl.pobierzWszystkie()
                common.showAlert('success', 'Utworzono zadanie ' + res.data.shortName)
            },
            function(err) {}
        )
    }

    ctrl.zeruj = function() {
        let options = { title: 'Uwaga', body: 'Czy na pewno chcesz usunąć wszystkie zadania?' }
        common.confirm(options, function(res) {
            if(res) {
                $http.delete('/task').then(
                    function(res) {
                        ctrl.pobierzWszystkieOdZera()
                        common.showAlert('success', 'Usunięto wszystkie zadania')
                    },
                    function(err) {}
                )
                }
        })
    }

    ctrl.wybierz = function(index) {
        $http.get('/task?_id=' + ctrl.data.records[index]._id).then(
            function(res) {
                ctrl.editedTask = res.data
                ctrl.editedTask.index = index
            },
            function(err) {}
        )
    }

    ctrl.zapisz = function() {
        ctrl.editedTask.date = ctrl.convert(ctrl.editedTask.date)
        delete ctrl.editedTask.index
        $http.put('/task', ctrl.editedTask).then(
            function(res) {
                common.showAlert('success', 'Zmodyfikowano zadanie ' + res.data.shortName)
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.usun = function(index) {
        let to_del = ctrl.data.records[index].shortName
        $http.delete('/task?_id=' + ctrl.data.records[index]._id).then(
            function(res) {
                if(ctrl.skip + 1 >= ctrl.data.filtered)
                    ctrl.poprzedniaPorcja()
                else 
                    ctrl.pobierzWszystkie()
                common.showAlert('success', 'Usunięto zadanie ' + to_del)
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

    ctrl.resort = function(field) {
        ctrl.sort = field
        ctrl.pobierzWszystkieOdZera()
    }

    ctrl.isVisible = function() {
        return common.menu.find(function(el) { return el.route == '/tasks' })
    }

    //TODO: use later for a higher grade
    // ctrl.opisProjektu = function(project) {
    //     let options = { project: project }
    //     common.dialog('projectDescription.html', 'ProjectDescription', options, function(res) {})
    // }
}])