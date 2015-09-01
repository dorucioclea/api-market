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
    "ngTagsInput",
    "schemaForm",

    /* custom modules */
    "app.ctrls",
    "app.directives",
    "app.services",
    "app.filters",
    "app.apiEngine",
    "app.ctrl.dashboard",
    "app.ctrl.modals",
    "app.ctrl.api",
    "app.ctrl.service",
    "app.ctrl.application",
    "app.ctrl.organization",
    "app.ctrl.plan",
    "app.ctrl.policy",
    "app.ctrl.contract",
    "app.ctrl.user",
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
      $urlRouterProvider.when('/org/{orgId}/api/{svcId}/{versionId}', '/org/{orgId}/api/{svcId}/{versionId}/documentation');
      $urlRouterProvider.when('/org/{orgId}', '/org/{orgId}/plans');
      $urlRouterProvider.when('/org/{orgId}/application/{appId}', '/org/{orgId}/application/{appId}/overview');
      $urlRouterProvider.when('/org/{orgId}/service/{svcId}/{versionId}', '/org/{orgId}/service/{svcId}/{versionId}/overview');
      $urlRouterProvider.when('/org/{orgId}/plan/{planId}/{versionId}', '/org/{orgId}/plan/{planId}/{versionId}/overview');



      $stateProvider

        // HOME STATES (DASHBOARD) AND NESTED VIEWS =======================================
        .state('home', {
          abstract: true,
          url: '/home',
          templateUrl: '/views/dashboard.html',
          resolve: {
            SearchSvcsWithStatus: 'SearchSvcsWithStatus',
            svcData: function (SearchSvcsWithStatus) {
              return SearchSvcsWithStatus.query({status: 'Published'}).$promise;
            },
            Categories: 'Categories',
            categories: function (Categories) {
              return Categories.query().$promise;
            }
          },
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

        // API MARKETPLACE PAGE AND NESTED VIEWS ==============================================
        .state('api', {
          url: '/org/:orgId/api/:svcId/:versionId',
          templateUrl: 'views/api.html',
          resolve: {
            ServiceVersion: 'ServiceVersion',
            svcData: function(ServiceVersion, $stateParams){

              var orgId = $stateParams.orgId;
              var svcId = $stateParams.svcId;
              var versionId = $stateParams.versionId;

              return ServiceVersion.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
            },
            organizationId: ['$stateParams', function ($stateParams) {
              return $stateParams.orgId;
            }],
            serviceId: ['$stateParams', function ($stateParams) {
              return $stateParams.svcId;
            }],
            versionId: ['$stateParams', function ($stateParams) {
              return $stateParams.versionId;
            }]
          },
          controller: 'ApiDocCtrl'
        })
        // Announcements Tab
        .state('api.announcements', {
          url: '/announcements',
          templateUrl: 'views/partials/api/announcements.html',
          controller: 'AnnouncementCtrl'
        })
        // Documentation Tab
        .state('api.documentation', {
          url: '/documentation',
          templateUrl: 'views/partials/api/documentation.html',
          resolve: {
            ServiceEndpoint: 'ServiceEndpoint',
            endpoint: function (ServiceEndpoint, organizationId, serviceId, versionId) {
              return ServiceEndpoint.get({orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
            }
          },
          controller: 'DocumentationCtrl'
        })
        // Plans Tab
        .state('api.plans', {
          url: '/plans',
          templateUrl: 'views/partials/api/plans.html',
          controller: 'SvcPlanCtrl'
        })
        // Support Tab
        .state('api.support', {
          url: '/support',
          templateUrl: 'views/partials/api/support.html',
          controller: 'SupportCtrl'
        })
        // Terms Tab
        .state('api.terms', {
          url: '/terms',
          templateUrl: 'views/partials/api/terms.html',
          controller: 'TermsCtrl'
        })

        // CONTRACT CREATION PAGE =========================================================
        .state('contract', {
          params: { appOrgId: {}, appId: {}, appVersion: {}, svcOrgId: {}, svcId: {}, svcVersion: {} },
          templateUrl: 'views/contract.html',
          resolve: {
            ServicePlans: 'ServicePlans',
            Application: 'Application',
            Service: 'Service',
            planData: function (ServicePlans, $stateParams) {
              var orgId = $stateParams.svcOrgId;
              var svcId = $stateParams.svcId;

              return ServicePlans.query({orgId: orgId, svcId: svcId, versionId: 'v1'}).$promise;
            },
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
          controller: 'ContractCtrl as ctrl'
        })

        // ORGANIZATION OVERVIEW PAGE AND NESTED VIEWS ====================================
        .state('organization', {
          abstract: true,
          url: '/org/:orgId',
          templateUrl: 'views/organization.html',
          resolve: {
            Organization: 'Organization',
            orgData: function(Organization, $stateParams){

              var orgId = $stateParams.orgId;

              return Organization.get({id: orgId}).$promise;
            },
            organizationId: ['$stateParams', function ($stateParams) {
              return $stateParams.orgId;
            }]
          },
          controller: 'OrganizationCtrl'
        })
        // Applications View
        .state('organization.applications', {
          url: '/applications',
          templateUrl: 'views/partials/organization/applications.html',
          resolve: {
            Application: 'Application',
            appData: function (Application, organizationId) {
              return Application.query({orgId: organizationId}).$promise;
            }
          },
          controller: 'ApplicationsCtrl'
        })
        // Services View
        .state('organization.services', {
          url: '/services',
          templateUrl: 'views/partials/organization/services.html',
          resolve: {
            Service: 'Service',
            svcData: function (Service, organizationId) {
              return Service.query({orgId: organizationId}).$promise;
            }
          },
          controller: 'ServicesCtrl'
        })
        // Plans View
        .state('organization.plans', {
          url: '/plans',
          templateUrl: 'views/partials/organization/plans.html',
          resolve: {
            Plan: 'Plan',
            planData: function (Plan, organizationId) {
              return Plan.query({orgId: organizationId}).$promise;
            }
          },
          controller: 'PlansCtrl'
        })
        // Members View
        .state('organization.members', {
          url: '/members',
          templateUrl: 'views/partials/organization/members.html',
          resolve: {
            Member: 'Member',
            memberData: function (Member, organizationId) {
              return Member.query({orgId: organizationId}).$promise;
            }
          },
          controller: 'MembersCtrl'
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

        // PLAN OVERVIEW PAGE AND NESTED VIEWS ====================================
        .state('plan', {
          url: '/org/:orgId/plan/:planId/:versionId',
          templateUrl: 'views/plan.html',
          resolve: {
            PlanVersion: 'PlanVersion',
            planData: function(PlanVersion, organizationId, planId, versionId){
              return PlanVersion.get({orgId: organizationId, planId: planId, versionId: versionId}).$promise;
            },
            planVersions: function (PlanVersion, organizationId, planId) {
              return PlanVersion.query({orgId: organizationId, planId: planId}).$promise;
            },
            organizationId: ['$stateParams', function ($stateParams) {
              return $stateParams.orgId;
            }],
            planId: ['$stateParams', function ($stateParams) {
              return $stateParams.planId;
            }],
            versionId: ['$stateParams', function ($stateParams) {
              return $stateParams.versionId;
            }]
          },
          controller: 'PlanCtrl'
        })
        // Overview Tab
        .state('plan.overview', {
          url: '/overview',
          templateUrl: 'views/partials/plan/overview.html',
          controller: 'PlanOverviewCtrl'
        })
        // Policies Tab
        .state('plan.policies', {
          url: '/policies',
          templateUrl: 'views/partials/plan/policies.html',
          resolve: {
            PlanVersionPolicy: 'PlanVersionPolicy',
            policyData: function (PlanVersionPolicy, organizationId, planId, versionId) {
              return PlanVersionPolicy.query({orgId: organizationId, planId: planId, versionId: versionId}).$promise;
            }
          },
          controller: 'PlanPoliciesCtrl'
        })
        // Activity Tab
        .state('plan.activity', {
          url: '/activity',
          templateUrl: 'views/partials/plan/activity.html',
          resolve: {
            PlanActivity: 'PlanActivity',
            activityData: function (PlanActivity, organizationId, planId) {
              return PlanActivity.get({orgId: organizationId, planId: planId}).$promise;
            }
          },
          controller: 'PlanActivityCtrl'
        })

        // APPLICATION OVERVIEW PAGE AND NESTED VIEWS =====================================
        .state('application', {
          abstract: true,
          url: '/org/:orgId/application/:appId/:versionId',
          templateUrl: 'views/application.html',
          resolve: {
            ApplicationVersion: 'ApplicationVersion',
            appData: function(ApplicationVersion, organizationId, applicationId, versionId){
              return ApplicationVersion.get({orgId: organizationId, appId: applicationId, versionId: versionId}).$promise;
            },
            appVersions: function (ApplicationVersion, organizationId, applicationId) {
              return ApplicationVersion.query({orgId: organizationId, appId: applicationId}).$promise;
            },
            organizationId: ['$stateParams', function ($stateParams) {
              return $stateParams.orgId;
            }],
            applicationId: ['$stateParams', function ($stateParams) {
              return $stateParams.appId;
            }],
            versionId: ['$stateParams', function ($stateParams) {
              return $stateParams.versionId;
            }]
          },
          controller: 'ApplicationCtrl'
        })
        // Overview Tab
        .state('application.overview', {
          url: '/overview',
          templateUrl: 'views/partials/application/overview.html',
          controller: 'OverviewCtrl'
        })
        // Contracts Tab
        .state('application.contracts', {
          url: '/contracts',
          templateUrl: 'views/partials/application/contracts.html',
          resolve: {
            ApplicationContract: 'ApplicationContract',
            contractData: function (ApplicationContract, organizationId, applicationId, versionId) {
              return ApplicationContract.query({orgId: organizationId, appId: applicationId, versionId: versionId}).$promise;
            }
          },
          controller: 'ContractsCtrl'
        })
        // APIs Tab
        .state('application.apis', {
          url: '/apis',
          templateUrl: 'views/partials/application/apis.html',
          resolve: {
            ApplicationContract: 'ApplicationContract',
            contractData: function (ApplicationContract, organizationId, applicationId, versionId) {
              return ApplicationContract.query({orgId: organizationId, appId: applicationId, versionId: versionId}).$promise;
            }
          },
          controller: 'ApisCtrl'
        })
        // Activity Tab
        .state('application.activity', {
          url: '/activity',
          templateUrl: 'views/partials/application/activity.html',
          resolve: {
            ApplicationActivity: 'ApplicationActivity',
            activityData: function (ApplicationActivity, organizationId, applicationId) {
              return ApplicationActivity.get({orgId: organizationId, appId: applicationId}).$promise;
            }
          },
          controller: 'ActivityCtrl'
        })

        // SERVICE OVERVIEW PAGE AND NESTED VIEWS ====================================
        .state('service', {
          url: '/org/:orgId/service/:svcId/:versionId',
          templateUrl: 'views/service.html',
          resolve: {
            ServiceVersion: 'ServiceVersion',
            svcData: function(ServiceVersion, organizationId, serviceId, versionId){
              return ServiceVersion.get({orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
            },
            svcVersions: function (ServiceVersion, organizationId, serviceId) {
              return ServiceVersion.query({orgId: organizationId, svcId: serviceId}).$promise;
            },
            organizationId: ['$stateParams', function ($stateParams) {
              return $stateParams.orgId;
            }],
            serviceId: ['$stateParams', function ($stateParams) {
              return $stateParams.svcId;
            }],
            versionId: ['$stateParams', function ($stateParams) {
              return $stateParams.versionId;
            }]
          },
          controller: 'ServiceCtrl'
        })
        // Overview Tab
        .state('service.overview', {
          url: '/overview',
          templateUrl: 'views/partials/service/overview.html',
          controller: 'ServiceOverviewCtrl'
        })
        // Definition Tab
        .state('service.definition', {
          url: '/definition',
          templateUrl: 'views/partials/service/definition.html',
          resolve: {
            ServiceVersionDefinition: 'ServiceVersionDefinition',
            definitionData: function(ServiceVersionDefinition, organizationId, serviceId, versionId) {
              return ServiceVersionDefinition.get({orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
            }
          },
          controller: 'ServiceDefinitionCtrl'
        })
        // Plans Tab
        .state('service.plans', {
          url: '/plans',
          templateUrl: 'views/partials/service/plans.html',
          resolve: {
            Plan: 'Plan',
            planData: function (Plan, organizationId) {
              return Plan.query({orgId: organizationId}).$promise;
            }
          },
          controller: 'ServicePlansCtrl'
        })
        // Policies Tab
        .state('service.policies', {
          url: '/policies',
          templateUrl: 'views/partials/service/policies.html',
          resolve: {
            ServiceVersionPolicy: 'ServiceVersionPolicy',
            policyData: function (ServiceVersionPolicy, organizationId, serviceId, versionId) {
              return ServiceVersionPolicy.query({orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
            }
          },
          controller: 'ServicePoliciesCtrl'
        })
        // Activity Tab
        .state('service.activity', {
          url: '/activity',
          templateUrl: 'views/partials/service/activity.html',
          resolve: {
            ServiceActivity: 'ServiceActivity',
            activityData: function (ServiceActivity, organizationId, serviceId) {
              return ServiceActivity.get({orgId: organizationId, svcId: serviceId}).$promise;
            }
          },
          controller: 'ServiceActivityCtrl'
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


