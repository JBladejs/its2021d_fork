app.controller('Home', [ '$http', 'common', function($http, common) {
    let ctrl = this
    console.log('Kontroler Home wystartował')

    ctrl.session = common.session

    ctrl.test = function() {
        let options = { title: 'Tytuł', body: 'To jest treść okienka', noCancel: true }
        common.confirm(options, function(res, type) { console.log(res, type) })
    }
}])