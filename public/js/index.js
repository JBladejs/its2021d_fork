let app = angular.module('its2021d', [ 'ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap' ])

// menu routera
app.constant('routes', [
	{ route: '/', templateUrl: 'home.html', controller: 'Home', controllerAs: 'ctrl', title: '<i class="fa fa-lg fa-home"></i>' },
	{ route: '/persons', templateUrl: 'persons.html', controller: 'Persons', controllerAs: 'ctrl', title: 'Osoby' },
	{ route: '/projects', templateUrl: 'projects.html', controller: 'Projects', controllerAs: 'ctrl', title: 'Projekty' }
])

// instalacja routera
app.config(['$routeProvider', '$locationProvider', 'routes', function($routeProvider, $locationProvider, routes) {
    $locationProvider.hashPrefix('')
	for(var i in routes) {
		$routeProvider.when(routes[i].route, routes[i])
	}
	$routeProvider.otherwise({ redirectTo: '/' })
}])

// usługa wspólna
app.service('common', [ function() {
	let common = this
	console.log('Usługa common wystartowała')

	common.alert = { type: 'alert-default', text: '' }
	common.closeAlert = function() {
		common.alert.text = ''
	}
	common.showAlert = function(type, text) {
		common.alert.type = 'alert-' + type
		common.alert.text = text
	}
}])

// kontroler całej strony
app.controller('Index', [ '$location', '$scope', 'routes', 'common', function($location, $scope, routes, common) {
    let ctrl = this
	console.log('Kontroler Index wystartował')
	
	ctrl.alert = common.alert
	ctrl.closeAlert = common.closeAlert
	ctrl.menu = []

    ctrl.rebuildMenu = function() {
		ctrl.menu.length = 0
		for(var i in routes) {
			ctrl.menu.push({ route: routes[i].route, title: routes[i].title })
		}
		$location.path('/')
    }

    ctrl.navClass = function(page) {
        return page === $location.path() ? 'active' : ''
    }

	ctrl.isCollapsed = true
    $scope.$on('$routeChangeSuccess', function () {
        ctrl.isCollapsed = true
    })

	ctrl.rebuildMenu()
}])