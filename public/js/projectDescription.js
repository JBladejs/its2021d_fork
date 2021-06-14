app.controller('ProjectDescription', [ '$http', '$uibModalInstance', 'options', function($http, $uibModalInstance, options) {
    let ctrl = this
    console.log('Kontroler ProjectDescription wystartował')
    ctrl.options = options
    ctrl.persons = []

    ctrl.ok = function() {
        $uibModalInstance.close()
    }

    $http.get('/person').then(function(res) {
        // poniżej coś wstydliwego - filtrowanie we frontendzie - niedopuszczalne w zadaniu 5!
        ctrl.persons = res.data.records.filter(function(el) { return el.projects.map(function(el) { return el._id }).includes(ctrl.options.project._id) })
    }, function(err) {})
}])