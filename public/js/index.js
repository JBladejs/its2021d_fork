let app = angular.module('its2021d', [ 'ngRoute', 'ngSanitize' ])

// router menu
app.constant('routes', [
	{ route: '/', templateUrl: 'home.html', controller: 'Home', controllerAs: 'ctrl', title: '<i class="fa fa-lg fa-home"></i>' },
	{ route: '/persons', templateUrl: 'persons.html', controller: 'Persons', controllerAs: 'ctrl', title: 'Osoby' }
])

// router installation
app.config(['$routeProvider', '$locationProvider', 'routes', function($routeProvider, $locationProvider, routes) {
    $locationProvider.hashPrefix('')
	for(var i in routes) {
		$routeProvider.when(routes[i].route, routes[i])
	}
	$routeProvider.otherwise({ redirectTo: '/' })
}])

app.controller('Index', [ '$location', '$scope', 'routes', function($location, $scope, routes) {
    let ctrl = this
	console.log('Kontroler Index wystartował')
	
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