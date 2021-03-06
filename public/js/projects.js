app.controller('Projects', [ '$http', 'common',  function($http, common) {
    let ctrl = this
    console.log('Kontroler Projects wystartował')

    // filtry
    ctrl.search = ''
    ctrl.data = { total: 0, filtered: 0, records: [] }
    ctrl.skip = 0
    ctrl.dataPortion = 10
    ctrl.limit = ctrl.dataPortion

    // porządek
    ctrl.sort = 'lastName'

    ctrl.selected = -1
    ctrl.newProject = { shortName: '', name: '' }
    ctrl.editedProject = { index: -1, shortName: '', name: '' }

    ctrl.pobierzWszystkie = function() {
        $http.get('/project?sort=' + ctrl.sort + '&search=' + ctrl.search + "&skip=" + ctrl.skip + "&limit=" + ctrl.limit).then(
            function(res) {
                ctrl.data = res.data
                ctrl.editedProject.index = -1
            },
            function(err) {}
        )
    }

    ctrl.pobierzWszystkieOdZera = function() {
        ctrl.skip = 0
        ctrl.pobierzWszystkie()
    }

    ctrl.wyslij = function() {
        $http.post('/project', ctrl.newProject).then(
            function(res) {
                ctrl.newProject.shortName = ''
                ctrl.newProject.name = ''
                ctrl.pobierzWszystkie()
                common.showAlert('success', 'Utworzono projekt ' + res.data.shortName)
            },
            function(err) {}
        )
    }

    ctrl.zeruj = function() {
        let options = { title: 'Uwaga', body: 'Czy na pewno chcesz usunąć wszystkie projekty?' }
        common.confirm(options, function(res) {
            if(res) {
                $http.delete('/project').then(
                    function(res) {
                        ctrl.pobierzWszystkieOdZera()
                        common.showAlert('success', 'Usunięto wszystkie projekty')
                    },
                    function(err) {}
                )
                }
        })
    }

    ctrl.wybierz = function(index) {
        $http.get('/project?_id=' + ctrl.data.records[index]._id).then(
            function(res) {
                ctrl.editedProject = res.data
                ctrl.editedProject.index = index
            },
            function(err) {}
        )
    }

    ctrl.zapisz = function() {
        delete ctrl.editedProject.index
        $http.put('/project', ctrl.editedProject).then(
            function(res) {
                common.showAlert('success', 'Zmodyfikowano projekt ' + res.data.shortName)
                ctrl.pobierzWszystkie()
            },
            function(err) {}
        )
    }

    ctrl.usun = function(index) {
        let to_del = ctrl.data.records[index].shortName
        $http.delete('/project?_id=' + ctrl.data.records[index]._id).then(
            function(res) {
                if(ctrl.skip + 1 >= ctrl.data.filtered)
                    ctrl.poprzedniaPorcja()
                else 
                    ctrl.pobierzWszystkie()
                common.showAlert('success', 'Usunięto projekt ' + to_del)
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
        return common.menu.find(function(el) { return el.route == '/projects' })
    }

    ctrl.opisProjektu = function(project) {
        let options = { project: project }
        common.dialog('projectDescription.html', 'ProjectDescription', options, function(res) {})
    }
}])