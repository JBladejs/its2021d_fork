let app = angular.module('its2021d', [ 'ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap' ])

// menu routera
app.constant('routes', [
	{ route: '/', templateUrl: 'home.html', controller: 'Home', controllerAs: 'ctrl', title: '<i class="fa fa-lg fa-home"></i>' },
	{ route: '/persons', templateUrl: 'persons.html', controller: 'Persons', controllerAs: 'ctrl', title: 'Osoby', roles: [ 2 ] },
	{ route: '/projects', templateUrl: 'projects.html', controller: 'Projects', controllerAs: 'ctrl', title: 'Projekty', roles: [ 1, 2 ] }
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
app.service('common', [ '$http', '$location', '$uibModal', 'routes', function($http, $location, $uibModal, routes) {
	let common = this
	console.log('Usługa common wystartowała')

	common.session = { login: null }
	common.menu = []

	common.whoami = function() {
		$http.get('/auth').then(
			function(res) {
				common.session.login = res.data.login
				common.session.roles = res.data.roles
				common.rebuildMenu()
			},
			function(err) {}
		)
	}

	common.rebuildMenu = function() {
		common.menu.length = 0
		for(var i in routes) {
			// trasa nie ma przypisanych ról lub role trasy w przecięciu z rolami użytkownika dają zbiór niepusty
			let intersection = []
			if(!routes[i].roles) {
				intersection = [ 0 ]
			} else {
				for(var j in common.session.roles) {
					if(routes[i].roles.includes(common.session.roles[j])) intersection.push(common.session.roles[j])
				}
			}
			if(intersection.length) {
				common.menu.push({ route: routes[i].route, title: routes[i].title })
			}
		}
		$location.path('/')
    }

	common.lastLogin = ''

	common.alert = { type: 'alert-default', text: '' }
	common.closeAlert = function() {
		common.alert.text = ''
	}
	common.showAlert = function(type, text) {
		common.alert.type = 'alert-' + type
		common.alert.text = text
	}

	common.dialog = function(templateUrl, controllerName, options, nextTick) {

        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title-top',
            ariaDescribedBy: 'modal-body-top',
            templateUrl: templateUrl,
            controller: controllerName,
            controllerAs: 'ctrl',
            resolve: {
                options: function () {
                    return options
                }
            }
        })

        modalInstance.result.then(
            function() { nextTick(true) },
            function(ret) { nextTick(false, ret) }
        )
    }

	common.confirm = function(options, nextTick) {
		common.dialog('confirmation.html', 'Confirmation', options, nextTick)
	}

	common.whoami()

}])

app.controller('Confirmation', [ '$uibModalInstance', 'options', function($uibModalInstance, options) {
    let ctrl = this
	ctrl.options = options
    console.log('Kontroler Confirmation wystartował')

	ctrl.ok = function() {
		$uibModalInstance.close()
	}

	ctrl.cancel = function() { 
		$uibModalInstance.dismiss('cancel')
	}
}])

app.controller('LoginForm', [ '$http', '$uibModalInstance', 'options', 'common', function($http, $uibModalInstance, options, common) {
    let ctrl = this
	ctrl.options = options
    console.log('Kontroler LoginForm wystartował')

	ctrl.error = ''

	ctrl.ok = function() {
		// wyślij kredencjały
		if(ctrl.options.login) {
			$http.post('/auth', ctrl.options).then(
				function(res) {
					common.whoami()
					common.lastLogin = res.data.login
					$uibModalInstance.close()		

				},
				function(err) {
					ctrl.error = 'Logowanie nieudane'
				}
			)
		}
	}

	ctrl.cancel = function() { 
		$uibModalInstance.dismiss('cancel')
	}
}])

// kontroler całej strony
app.controller('Index', [ '$http', '$location', '$scope', 'routes', 'common', function($http, $location, $scope, routes, common) {
    let ctrl = this
	console.log('Kontroler Index wystartował')
	
	ctrl.alert = common.alert
	ctrl.closeAlert = common.closeAlert
	ctrl.session = common.session
	ctrl.menu = common.menu

	ctrl.doLogin = function() {
		if(!common.session.login) {
			let options = { login: common.lastLogin }
			common.dialog('loginForm.html', 'LoginForm', options, function(res) {})
		} else {
			let options = { title: 'Wylogowywanie', body: 'Czy na pewno chcesz się wylogować?' }
			common.confirm(options, function(answer) {
				if(answer) {
					$http.delete('/auth').then(
						function(res) {
							common.whoami()
						},
						function(err) {}
					)
				}
			})
		}
	}
	
    ctrl.navClass = function(page) {
        return page === $location.path() ? 'active' : ''
    }

	ctrl.isCollapsed = true
    $scope.$on('$routeChangeSuccess', function () {
        ctrl.isCollapsed = true
    })

}])