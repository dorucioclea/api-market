;(function() {
	"use strict";

	angular.module("app", [
		/* Angular modules */
		"ngAnimate",
    "ngResource",
		"ngSanitize",
		"ngAria",
		"ngMaterial",

		/* 3rd party modules */
    "ui.router",
    "ngStorage",
		"oc.lazyLoad",
		"ui.bootstrap",
		"angular-loading-bar",
		"FBAngular",
    "matchMedia",

		/* custom modules */
		"app.ctrls",
		"app.directives",
    "app.services",
    "app.filters",
    "app.apiEngine",
    "app.ctrl.modals",
    "app.ctrl.service",
    "app.ctrl.application",
    "app.ctrl.organization",
    "app.ctrl.contract",
		"app.ui.ctrls",
		"app.ui.directives",
		"app.form.ctrls",
		"app.table.ctrls",
		"app.email.ctrls",
		"app.todo"

	])


	// disable spinner in loading-bar
	.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	    cfpLoadingBarProvider.includeSpinner = false;
	     cfpLoadingBarProvider.latencyThreshold = 500;
	}])

  // ngStorage key config
  .config(['$localStorageProvider',
    function ($localStorageProvider) {
      $localStorageProvider.setKeyPrefix('apim');
  }])
  .config(['$sessionStorageProvider',
    function ($sessionStorageProvider) {
      $sessionStorageProvider.setKeyPrefix('apim_session');
  }])

  // UI-Router states
  .config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home/grid');

    $stateProvider

      // HOME STATES (DASHBOARD) AND NESTED VIEWS =======================================
      .state('home', {
        abstract: true,
        url: '/home',
        templateUrl: '/views/dashboard.html',
        controller: 'DashboardCtrl'
      })
      // API Grid View
      .state('home.grid', {
        url: '/grid',
        templateUrl: 'views/templates/apigrid.html'
      })
      // API List View
      .state('home.list', {
        url: '/list',
        templateUrl: 'views/templates/apilist.html'
      })

      // API DETAILS PAGE AND NESTED VIEWS ==============================================
      .state('service', {
        url: '/organization/:orgId/service/:svcId',
        templateUrl: 'views/api.html',
        resolve: {
          Service: 'Service',
          svcData: function(Service, $stateParams){

            var orgId = $stateParams.orgId;
            var svcId = $stateParams.svcId;

            return Service.get({orgId: orgId, svcId: svcId}).$promise;
          }
        },
        controller: 'ApiDocCtrl'
      })
      // Announcements Tab
      .state('service.announcements', {
        url: '/announcements',
        templateUrl: 'views/partials/api/announcements.html'
      })
      // Documentation Tab
      .state('service.documentation', {
        url: '/documentation',
        templateUrl: 'views/partials/api/documentation.html'
      })
      // Plans Tab
      .state('service.plans', {
        url: '/plans',
        templateUrl: 'views/partials/api/plans.html'
      })
      // Support Tab
      .state('service.support', {
        url: '/support',
        templateUrl: 'views/partials/api/support.html'
      })
      // Terms Tab
      .state('service.terms', {
        url: '/terms',
        templateUrl: 'views/partials/api/terms.html'
      })

      // CONTRACT CREATION PAGE =========================================================
      .state('contract', {
        params: { appOrgId: {}, appId: {}, svcOrgId: {}, svcId: {} },
        templateUrl: 'views/contract.html',
        resolve: {
          Application: 'Application',
          Service: 'Service',
          appData: function(Application, $stateParams) {
            var orgId = $stateParams.appOrgId;
            var appId = $stateParams.appId;

            return Application.get({orgId: orgId, appId: appId}).$promise;
          },
          svcData: function(Service, $stateParams) {
            var orgId = $stateParams.svcOrgId;
            var svcId = $stateParams.svcId;

            return Service.get({orgId: orgId, svcId: svcId}).$promise;
          }
        },
        controller: 'ContractCtrl'
      })

      // ORGANIZATION OVERVIEW PAGE AND NESTED VIEWS ====================================
      .state('organization', {
        url: '/organization/:orgId',
        templateUrl: 'views/organization.html',
        resolve: {
          Organization: 'Organization',
          orgData: function(Organization, $stateParams){

            var orgId = $stateParams.orgId;

            return Organization.get({id: orgId}).$promise;
          }
        },
        controller: 'OrganizationCtrl'
      })
      // Applications View
      .state('organization.applications', {
        url: '/applications',
        templateUrl: 'views/partials/organization/applications.html'
      })
      // Services View
      .state('organization.services', {
        url: '/services',
        templateUrl: 'views/partials/organization/services.html'
      })
      // Plans View
      .state('organization.plans', {
        url: '/plans',
        templateUrl: 'views/partials/organization/plans.html'
      })
      // Members View
      .state('organization.members', {
        url: '/members',
        templateUrl: 'views/partials/organization/members.html'
      })

      // ORGANIZATIONS SEARCH PAGE ======================================================
      .state('organizations', {
        url: '/organizations',
        templateUrl: 'views/organizations.html',
        controller: 'OrganizationsCtrl'
      })

      // MY ORGANIZATIONS OVERVIEW PAGE =================================================
      .state('myOrganizations', {
        url: '/my-organizations',
        templateUrl: 'views/my-organizations.html',
        resolve: {
          CurrentUserAppOrgs: 'CurrentUserAppOrgs',
          appOrgData: function(CurrentUserAppOrgs){
            return CurrentUserAppOrgs.query().$promise;
          }
        },
        controller: 'MyOrganizationsCtrl'
      })

      // APPLICATION OVERVIEW PAGE AND NESTED VIEWS =====================================
      .state('application', {
        url: '/organization/:orgId/application/:appId',
        templateUrl: 'views/application.html',
        resolve: {
          Application: 'Application',
          appData: function(Application, $stateParams){

            var orgId = $stateParams.orgId;
            var appId = $stateParams.appId;

            return Application.get({orgId: orgId, appId: appId}).$promise;
          }
        },
        controller: 'ApplicationCtrl'
      })
      // Overview Tab
      .state('application.overview', {
        url: '/overview',
        templateUrl: 'views/partials/application/overview.html'
      })
      // Contracts Tab
      .state('application.contracts', {
        url: '/contracts',
        templateUrl: 'views/partials/application/contracts.html'
      })
      // APIs Tab
      .state('application.apis', {
        url: '/apis',
        templateUrl: 'views/partials/application/apis.html'
      })
      // Activity Tab
      .state('application.activity', {
        url: '/activity',
        templateUrl: 'views/partials/application/activity.html'
      })

      // USER PROFILE AND SETTINGS PAGE AND NESTED VIEWS ================================
      .state('user', {
        url: '/user',
        templateUrl: 'views/user.html'
      })
      // Account Tab
      .state('user.account', {
        url: 'user/account',
        templateUrl: 'views/partials/user/account.html'
      })
      // Email Tab
      .state('user.email', {
        url: 'user/email',
        templateUrl: 'views/partials/user/email.html'
      })
      // Notifications Tab
      .state('user.notifications', {
        url: 'user/notifications',
        templateUrl: 'views/partials/user/notifications.html'
      })
      // Profile Tab
      .state('user.profile', {
        url: 'user/profile',
        templateUrl: 'views/partials/user/profile.html'
      })

  })

  // Define Force Reload
  .config(function($provide) {
    $provide.decorator('$state', function($delegate, $stateParams) {
      $delegate.forceReload = function() {
        return $delegate.go($delegate.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        });
      };
      return $delegate;
    })
  })

	// lazy loading scripts references of angular modules only
	.config(["$ocLazyLoadProvider", function($oc) {
		$oc.config({
			debug: true,
			event: false,
			modules: [{
				name: "angularBootstrapNavTree",
				files: ["scripts/lazyload/abn_tree_directive.js", "styles/lazyload/abn_tree.css"]
			},
			{
				name: "ui.calendar",
				serie: true,	// load files in series
				files: [
					"scripts/lazyload/moment.min.js",
					"scripts/lazyload/fullcalendar.min.js",
					"styles/lazyload/fullcalendar.css",
					"scripts/lazyload/calendar.js"
				]
			},
			{
				name: "ui.select",
				files: ["scripts/lazyload/select.min.js", "styles/lazyload/select.css"]
			},
			{
				name: "ngTagsInput",
				files: ["scripts/lazyload/ng-tags-input.min.js", "styles/lazyload/ng-tags-input.css"]
			},
			{
				name: "colorpicker.module",
				files: ["scripts/lazyload/bootstrap-colorpicker-module.min.js", "styles/lazyload/colorpicker.css"]
			},
			{
				name: "ui.slider",
				serie: true,
				files: ["scripts/lazyload/bootstrap-slider.min.js", "scripts/lazyload/directives/bootstrap-slider.directive.js", "styles/lazyload/bootstrap-slider.css"]
			},
			{
				name: "textAngular",
				serie: true,
				files: ["scripts/lazyload/textAngular-rangy.min.js",  "scripts/lazyload/textAngular.min.js", "scripts/lazyload/textAngularSetup.js", "styles/lazyload/textAngular.css"]
			},
			{
				name: "flow",
				files: ["scripts/lazyload/ng-flow-standalone.min.js"]
			},
			{
				name: "ngImgCrop",
				files: ["scripts/lazyload/ng-img-crop.js", "styles/lazyload/ng-img-crop.css"]
			},
			{
				name: "ngMask",
				files: ["scripts/lazyload/ngMask.min.js"]
			},
			{
				name: "angular-c3",
				files: ["scripts/lazyload/directives/c3.directive.js"]
			},
			{
				name: "easypiechart",
				files: ["scripts/lazyload/angular.easypiechart.min.js"]
			},
			{
				name: "ngMap",
				files: ["scripts/lazyload/ng-map.min.js"]
			}
			]
		});
	}])


	// jquery/javascript and css for plugins via lazy load
	.constant("JQ_LOAD", {
		fullcalendar: [],
		moment: ["scripts/lazyload/moment.min.js"],
		sparkline: ["scripts/lazyload/jquery.sparkline.min.js"],
		c3: ["scripts/lazyload/d3.min.js", "scripts/lazyload/c3.min.js", "styles/lazyload/c3.css"],
		gmaps: ["https://maps.google.com/maps/api/js"]
	})



}());


