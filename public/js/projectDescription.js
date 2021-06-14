app.controller('ProjectDescription', [ '$http', '$uibModalInstance', 'options', function($http, $uibModalInstance, options) {
    let ctrl = this
    console.log('Kontroler ProjectDescription wystartował')
    ctrl.options = options

    ctrl.ok = function() {
        $uibModalInstance.close()
    }
}])