; (function () {
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
    "app.ctrl.login",
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
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
      cfpLoadingBarProvider.latencyThreshold = 500;
    }])

    // ngStorage key config
    .config(['$localStorageProvider',
      function ($localStorageProvider) {
        $localStorageProvider.setKeyPrefix('apim-');
      }])
    .config(['$sessionStorageProvider',
      function ($sessionStorageProvider) {
        $sessionStorageProvider.setKeyPrefix('apim_session-');
      }])

    // UI-Router states
    .config(function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.otherwise('/dashboard');
      $urlRouterProvider.when('/org/{orgId}/api/{svcId}/{versionId}', '/org/{orgId}/api/{svcId}/{versionId}/documentation');
      $urlRouterProvider.when('/org/{orgId}', '/org/{orgId}/plans');
      $urlRouterProvider.when('/org/{orgId}/application/{appId}/{versionId}', '/org/{orgId}/application/{appId}/{versionId}/overview');
      $urlRouterProvider.when('/org/{orgId}/service/{svcId}/{versionId}', '/org/{orgId}/service/{svcId}/{versionId}/overview');
      $urlRouterProvider.when('/org/{orgId}/plan/{planId}/{versionId}', '/org/{orgId}/plan/{planId}/{versionId}/overview');


      $stateProvider

        // LOGIN PAGE =====================================================================
        .state('login', {
          url: '/login',
          templateUrl: '/views/signin.html',
          controller: 'LoginCtrl'
        })

        // ROOT STATE =====================================================================
        .state('root', {
          templateUrl: '/views/partials/root.html'
        })


        // MARKETPLACE CONSUMER DASHBOARD =================================================
        .state('root.market-dash', {
          url: '/dashboard',
          templateUrl: '/views/market-dashboard.html',
          resolve: {
            CurrentUserApps: 'CurrentUserApps',
            ApplicationVersion: 'ApplicationVersion',
            ApplicationContract: 'ApplicationContract',
            appData: function (CurrentUserApps) {
              return CurrentUserApps.query().$promise;
            },
            appVersions: function ($q, appData, ApplicationVersion) {
              var appVersions = {};
              var promises = [];

              angular.forEach(appData, function (app) {
                promises.push(ApplicationVersion.query({orgId: app.organizationId, appId: app.id}).$promise);
              });

              return $q.all(promises).then(function (results) {
                angular.forEach(results, function (value) {
                  appVersions[value[0].id] = value[0];
                });
                return appVersions;
              });
            },
            appContracts: function ($q, appVersions, ApplicationContract) {
              var appContracts = {};
              var promises = [];

              angular.forEach(appVersions, function (value) {
                promises.push(ApplicationContract.query({
                  orgId: value.organizationId,
                  appId: value.id,
                  versionId: value.version
                }).$promise);
              });

              return $q.all(promises).then(function (results) {
                angular.forEach(results, function (value) {
                  // Check if at least one contract was found, so we can add by application Id of the first contract
                  if (angular.isDefined(value[0])) {
                    appContracts[value[0].appId] = value;
                  }
                });
                return appContracts;
              })

            }
          },
          controller: 'MarketDashCtrl'
        })

        // MARKETPLACE API EXPLORER AND NESTED VIEWS =======================================
        .state('root.apis', {
          abstract: true,
          url: '/apis',
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
        .state('root.apis.grid', {
          url: '/grid',
          templateUrl: 'views/templates/apigrid.html'


        })
        // API List View
        .state('root.apis.list', {
          url: '/list',
          templateUrl: 'views/templates/apilist.html'
        })

        // API MARKETPLACE PAGE AND NESTED VIEWS ==============================================
        .state('root.api', {
          url: '/org/:orgId/api/:svcId/:versionId',
          templateUrl: 'views/api.html',
          resolve: {
            ServiceVersion: 'ServiceVersion',
            svcData: function (ServiceVersion, $stateParams) {

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
        .state('root.api.announcements', {
          url: '/announcements',
          templateUrl: 'views/partials/api/announcements.html',
          controller: 'AnnouncementCtrl'
        })
        // Documentation Tab
        .state('root.api.documentation', {
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
        .state('root.api.plans', {
          url: '/plans',
          templateUrl: 'views/partials/api/plans.html',
          controller: 'SvcPlanCtrl'
        })
        // Support Tab
        .state('root.api.support', {
          url: '/support',
          templateUrl: 'views/partials/api/support.html',
          controller: 'SupportCtrl'
        })
        // Terms Tab
        .state('root.api.terms', {
          url: '/terms',
          templateUrl: 'views/partials/api/terms.html',
          controller: 'TermsCtrl'
        })

        // CONTRACT CREATION CONFIRMATION PAGE =========================================================
        .state('root.contract', {
          params: {appVersion: {}, planVersion: {}, svcVersion: {}},
          templateUrl: 'views/contract.html',
          controller: 'ContractCtrl as ctrl'
        })

        // ORGANIZATION OVERVIEW PAGE AND NESTED VIEWS ====================================
        .state('root.organization', {
          url: '/org/:orgId',
          templateUrl: 'views/organization.html',
          resolve: {
            Organization: 'Organization',
            orgData: function (Organization, $stateParams) {

              var orgId = $stateParams.orgId;

              return Organization.get({id: orgId}).$promise;
            },
            organizationId: ['$stateParams', function ($stateParams) {
              return $stateParams.orgId;
            }]
          },
          controller: 'OrganizationCtrl'
        })
        // Services View
        .state('root.organization.services', {
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
        .state('root.organization.plans', {
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
        .state('root.organization.members', {
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
        .state('root.organizations', {
          url: '/organizations',
          templateUrl: 'views/organizations.html',
          controller: 'OrganizationsCtrl'
        })

        // MY ORGANIZATIONS OVERVIEW PAGE =================================================
        .state('root.myOrganizations', {
          url: '/my-organizations',
          templateUrl: 'views/my-organizations.html',
          resolve: {
            CurrentUserAppOrgs: 'CurrentUserAppOrgs',
            appOrgData: function (CurrentUserAppOrgs) {
              return CurrentUserAppOrgs.query().$promise;
            }
          },
          controller: 'MyOrganizationsCtrl'
        })

        // PLAN OVERVIEW PAGE AND NESTED VIEWS ====================================
        .state('root.plan', {
          url: '/org/:orgId/plan/:planId/:versionId',
          templateUrl: 'views/plan.html',
          resolve: {
            PlanVersion: 'PlanVersion',
            planData: function (PlanVersion, organizationId, planId, versionId) {
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
        .state('root.plan.overview', {
          url: '/overview',
          templateUrl: 'views/partials/plan/overview.html',
          controller: 'PlanOverviewCtrl'
        })
        // Policies Tab
        .state('root.plan.policies', {
          url: '/policies',
          templateUrl: 'views/partials/plan/policies.html',
          resolve: {
            PlanVersionPolicy: 'PlanVersionPolicy',
            policyData: function (PlanVersionPolicy, organizationId, planId, versionId) {
              return PlanVersionPolicy.query({orgId: organizationId, planId: planId, versionId: versionId}).$promise;
            }
          },
          data: {
            type: 'plan'
          },
          controller: 'PlanPoliciesCtrl'
        })
        // Activity Tab
        .state('root.plan.activity', {
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
        .state('root.application', {
          url: '/org/:orgId/application/:appId/:versionId',
          templateUrl: 'views/application.html',
          resolve: {
            ApplicationVersion: 'ApplicationVersion',
            appData: function (ApplicationVersion, organizationId, applicationId, versionId) {
              return ApplicationVersion.get({
                orgId: organizationId,
                appId: applicationId,
                versionId: versionId
              }).$promise;
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
        .state('root.application.overview', {
          url: '/overview',
          templateUrl: 'views/partials/application/overview.html',
          controller: 'OverviewCtrl'
        })
        // Contracts Tab
        .state('root.application.contracts', {
          url: '/contracts',
          templateUrl: 'views/partials/application/contracts.html',
          resolve: {
            ApplicationContract: 'ApplicationContract',
            contractData: function (ApplicationContract, organizationId, applicationId, versionId) {
              return ApplicationContract.query({
                orgId: organizationId,
                appId: applicationId,
                versionId: versionId
              }).$promise;
            }
          },
          controller: 'ContractsCtrl'
        })
        // APIs Tab
        .state('root.application.apis', {
          url: '/apis',
          templateUrl: 'views/partials/application/apis.html',
          resolve: {
            ApplicationContract: 'ApplicationContract',
            contractData: function (ApplicationContract, organizationId, applicationId, versionId) {
              return ApplicationContract.query({
                orgId: organizationId,
                appId: applicationId,
                versionId: versionId
              }).$promise;
            }
          },
          controller: 'ApisCtrl'
        })
        // Activity Tab
        .state('root.application.activity', {
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
        .state('root.service', {
          url: '/org/:orgId/service/:svcId/:versionId',
          templateUrl: 'views/service.html',
          resolve: {
            ServiceVersion: 'ServiceVersion',
            svcData: function (ServiceVersion, organizationId, serviceId, versionId) {
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
        .state('root.service.overview', {
          url: '/overview',
          templateUrl: 'views/partials/service/overview.html',
          controller: 'ServiceOverviewCtrl'
        })
        // Implementation Tab
        .state('root.service.implementation', {
          url: '/implementation',
          templateUrl: 'views/partials/service/implementation.html',
          resolve: {},
          controller: 'ServiceImplementationCtrl'
        })
        // Definition Tab
        .state('root.service.definition', {
          url: '/definition',
          templateUrl: 'views/partials/service/definition.html',
          resolve: {},
          controller: 'ServiceDefinitionCtrl'
        })
        // Plans Tab
        .state('root.service.plans', {
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
        .state('root.service.policies', {
          url: '/policies',
          templateUrl: 'views/partials/service/policies.html',
          resolve: {
            ServiceVersionPolicy: 'ServiceVersionPolicy',
            policyData: function (ServiceVersionPolicy, organizationId, serviceId, versionId) {
              return ServiceVersionPolicy.query({
                orgId: organizationId,
                svcId: serviceId,
                versionId: versionId
              }).$promise;
            }
          },
          data: {
            type: 'service'
          },
          controller: 'ServicePoliciesCtrl'
        })
        // Activity Tab
        .state('root.service.activity', {
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
        .state('root.user', {
          url: '/user',
          templateUrl: 'views/user.html',
          resolve: {
            CurrentUserInfo: 'CurrentUserInfo',
            userInfo: function (CurrentUserInfo) {
              return CurrentUserInfo.get().$promise;
            }
          },
          controller: 'UserCtrl'
        })
        // Email Tab
        .state('root.user.email', {
          url: '/email',
          templateUrl: 'views/partials/user/email.html',
          controller: 'UserEmailCtrl'
        })
        // Notifications Tab
        .state('root.user.notifications', {
          url: '/notifications',
          templateUrl: 'views/partials/user/notifications.html',
          controller: 'UserNotificationsCtrl'
        })
        // Profile Tab
        .state('root.user.profile', {
          url: '/profile',
          templateUrl: 'views/partials/user/profile.html',
          controller: 'UserProfileCtrl'
        })
    })

  .factory('sessionInjector', ['$sessionStorageProvider', function($sessionStorageProvider) {
    var sessionInjector = {
      request: function(config) {
        config.headers['apikey'] = $sessionStorageProvider.apikey;
        return config;
      }
    };
    return sessionInjector;
  }])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('sessionInjector');
  }])

    // Define Force Reload
    .config(function ($provide) {
      $provide.decorator('$state', function ($delegate, $stateParams) {
        $delegate.forceReload = function () {
          return $delegate.go($delegate.current, $stateParams, {
            reload: true,
            inherit: false,
            notify: true
          });
        };
        return $delegate;
      })
    })

}());


