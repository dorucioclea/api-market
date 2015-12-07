(function (angular) {
    'use strict';

    angular.module('app', [
            /* Angular modules */
            'ngAnimate',
            'ngResource',
            'ngSanitize',
            'ngAria',
            'ngMaterial',

            /* 3rd party modules */
            'ui.router',
            'ngStorage',
            'ui.bootstrap',
            'angular-loading-bar',
            'FBAngular',
            'matchMedia',
            'ngTagsInput',
            'schemaForm',
            'angular-clipboard',
            'flow',
            'gridshore.c3js.chart',
            'textAngular',
            'relativeDate',
            'angular-jwt',
            'jp.ng-bs-animated-button',

            /* custom modules */
            'app.ctrls',
            'app.config',
            'app.constants',
            'app.directives',
            'app.services',
            'app.filters',
            'app.apiEngine',
            'app.ctrl.auth.oauth',
            'app.ctrl.login',
            'app.ctrl.dashboard',
            'app.ctrl.modals',
            'app.ctrl.modals.lifecycle',
            'app.ctrl.modals.support',
            'app.ctrl.api',
            'app.ctrl.service',
            'app.ctrl.application',
            'app.ctrl.organization',
            'app.ctrl.plan',
            'app.ctrl.policy',
            'app.ctrl.user'

        ])

        // disable spinner in loading-bar
        .config(function (cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.latencyThreshold = 100;
        })

        // ngStorage key config
        .config(function ($localStorageProvider) {
            $localStorageProvider.setKeyPrefix('apim-');
        })
        .config(function ($sessionStorageProvider) {
            $sessionStorageProvider.setKeyPrefix('apim_session-');
        })

        // UI-Router states
        .config(function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/');
            $urlRouterProvider.when('/', '/my-organizations');
            $urlRouterProvider.when('/org/{orgId}/api/{svcId}/{versionId}',
                '/org/{orgId}/api/{svcId}/{versionId}/documentation');
            $urlRouterProvider.when('/org/{orgId}', '/org/{orgId}/plans');
            $urlRouterProvider.when('/org/{orgId}/', '/org/{orgId}/plans');
            $urlRouterProvider.when('/org/{orgId}/application/{appId}/{versionId}',
                '/org/{orgId}/application/{appId}/{versionId}/overview');
            $urlRouterProvider.when('/org/{orgId}/service/{svcId}/{versionId}',
                '/org/{orgId}/service/{svcId}/{versionId}/overview');
            $urlRouterProvider.when('/org/{orgId}/plan/{planId}/{versionId}',
                '/org/{orgId}/plan/{planId}/{versionId}/policies');

            $stateProvider

            // ERROR PAGE =====================================================================
                .state('error', {
                    templateUrl: '/views/error.html',
                    controller: 'ErrorCtrl'
                })

                // OAUTH GRANT PAGE ===============================================================
                .state('oauth', {
                    url: '/oauth?response_type&client_id&org_id&service_id&version&authenticatedUserId&scopes&apikey',
                    templateUrl: '/views/oauth.html',
                    controller: 'OAuthCtrl'
                })

                // LOGOUT PAGE ====================================================================
                .state('logout', {
                    url: '/logout',
                    templateUrl: '/views/logout.html'
                })

                // ROOT STATE =====================================================================
                .state('root', {
                    templateUrl: '/views/partials/root.html',
                    resolve: {
                        CurrentUserInfo: 'CurrentUserInfo',
                        currentUser: function (CurrentUserInfo) {
                            return CurrentUserInfo.get().$promise;
                        }
                    },
                    controller: 'HeadCtrl'
                })

                // MARKETPLACE CONSUMER DASHBOARD =================================================
                .state('root.market-dash', {
                    url: '/org/:orgId/applications',
                    templateUrl: '/views/market-dashboard.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, organizationId) {
                            return Organization.get({id: organizationId}).$promise;
                        },
                        CurrentUserApps: 'CurrentUserApps',
                        ApplicationVersion: 'ApplicationVersion',
                        ApplicationContract: 'ApplicationContract',
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        appData: function ($q, organizationId, CurrentUserApps) {
                            var appData = [];
                            var promises = [];

                            promises.push(CurrentUserApps.query().$promise);

                            return $q.all(promises)
                                .then(function (results) {
                                    angular.forEach(results, function (value) {
                                        angular.forEach(value, function (app) {
                                            if (app.organizationId === organizationId) {
                                                appData.push(app);
                                            }
                                        });

                                    });
                                    return appData;
                                });
                        },
                        appVersions: function ($q, appData, ApplicationVersion) {
                            var appVersions = {};
                            var promises = [];

                            angular.forEach(appData, function (app) {
                                promises.push(ApplicationVersion.query(
                                    {orgId: app.organizationId, appId: app.id}).$promise);
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (value) {
                                    appVersions[value[0].id] = value[0];
                                });
                                return appVersions;
                            });
                        },
                        appVersionDetails: function ($q, appVersions, ApplicationVersion) {
                            var appVersionDetails = {};
                            var promises = [];

                            angular.forEach(appVersions, function (value) {
                                promises.push(
                                    ApplicationVersion.get({
                                        orgId: value.organizationId,
                                        appId: value.id,
                                        versionId: value.version}).$promise);
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (value) {
                                    appVersionDetails[value.application.id] = value;
                                });
                                return appVersionDetails;
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
                                    // Check if at least one contract was found,
                                    // so we can add by application Id of the first contract
                                    if (angular.isDefined(value[0])) {
                                        appContracts[value[0].appId] = value;
                                    }
                                });
                                return appContracts;
                            });
                        }
                    },
                    controller: 'MarketDashCtrl'
                })

                // MARKETPLACE MEMBER MANAGEMENT
                .state('root.market-dash.members', {
                    url: '/members',
                    templateUrl: '/views/partials/market/members.html',
                    resolve: {
                        Member: 'Member',
                        memberData: function (Member, organizationId) {
                            return Member.query({orgId: organizationId}).$promise;
                        },
                        Users: 'Users',
                        memberDetails: function ($q, memberData, Users) {
                            var memberDetails = [];
                            var promises = [];

                            angular.forEach(memberData, function (member) {
                                promises.push(Users.get(
                                    {userId: member.userId}).$promise);
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (details) {
                                    memberDetails[details.username] = details;
                                });
                                return memberDetails;
                            });
                        },
                        Roles: 'Roles',
                        roleData: function (Roles) {
                            return Roles.query().$promise;
                        }
                    },
                    controller: 'MarketMembersCtrl'
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
                        PublishedCategories: 'PublishedCategories',
                        categories: function (PublishedCategories) {
                            return PublishedCategories.query().$promise;
                        }
                    },
                    controller: 'DashboardCtrl'
                })
                // API Grid View
                .state('root.apis.grid', {
                    url: '/grid',
                    templateUrl: 'views/partials/dashboard/grid.html'

                })
                // API List View
                .state('root.apis.list', {
                    url: '/list',
                    templateUrl: 'views/partials/dashboard/list.html'
                })

                // MARKETPLACE API SEARCH ============================================================
                .state('root.search', {
                    url: '/search?query',
                    templateUrl: '/views/search.html',
                    resolve: {
                        SearchSvcs: 'SearchSvcs',
                        svcData: function (SearchSvcs, $stateParams) {
                            return SearchSvcs.query({},
                                {filters: [{name: 'name', value: '%' + $stateParams.query + '%', operator: 'like'}]}
                            ).$promise;
                        }
                    },
                    controller: 'ApiSearchCtrl'
                })

                // API MARKETPLACE PAGE AND NESTED VIEWS ==============================================
                .state('root.api', {
                    url: '/org/:orgId/api/:svcId/:versionId',
                    templateUrl: 'views/api.html',
                    resolve: {
                        ServiceVersion: 'ServiceVersion',
                        svcData: function (ServiceVersion, organizationId, serviceId, versionId) {
                            return ServiceVersion.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        serviceId: function ($stateParams) {
                            return $stateParams.svcId;
                        },
                        versionId: function ($stateParams) {
                            return $stateParams.versionId;
                        },
                        ServiceSupportTickets: 'ServiceSupportTickets',
                        support: function (ServiceSupportTickets, organizationId, serviceId) {
                            return ServiceSupportTickets.query({orgId: organizationId, svcId: serviceId}).$promise;
                        }
                    },
                    controller: 'ApiDocCtrl'
                })
                // Announcements Tab
                .state('root.api.announcements', {
                    url: '/announcements',
                    templateUrl: 'views/partials/api/announcements.html',
                    resolve: {
                        ServiceAnnouncementsAll: 'ServiceAnnouncementsAll',
                        announcements: function (ServiceAnnouncementsAll, organizationId, serviceId) {
                            return ServiceAnnouncementsAll.query({orgId: organizationId, svcId: serviceId}).$promise;
                        }
                    },
                    controller: 'AnnouncementCtrl'
                })
                // Documentation Tab
                .state('root.api.documentation', {
                    url: '/documentation',
                    templateUrl: 'views/partials/api/documentation.html',
                    resolve: {
                        ServiceEndpoint: 'ServiceEndpoint',
                        endpoint: function (ServiceEndpoint, organizationId, serviceId, versionId) {
                            return ServiceEndpoint.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        },
                        ServiceVersionContracts: 'ServiceVersionContracts',
                        svcContracts: function (ServiceVersionContracts, organizationId, serviceId, versionId) {
                            return ServiceVersionContracts.query(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        },
                        ServiceVersionPolicy: 'ServiceVersionPolicy',
                        oAuthPolicy: function ($q, ServiceVersionPolicy, organizationId, serviceId, versionId) {
                            return ServiceVersionPolicy.query(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise
                                .then(function (result) {
                                    var oAuthPolicy = {};
                                    var promises = [];

                                    angular.forEach(result, function (policy) {
                                        if (policy.policyDefinitionId === 'OAuth2') {
                                            promises.push(ServiceVersionPolicy.get(
                                                {orgId: organizationId,
                                                    svcId: serviceId,
                                                    versionId: versionId,
                                                    policyId: policy.id}).$promise);
                                        }
                                    });

                                    return $q.all(promises).then(function (results) {
                                        angular.forEach(results, function (details) {
                                            oAuthPolicy = details;
                                        });
                                        return oAuthPolicy;
                                    });

                                });
                        },
                        jwtEnabled: function ($q, ServiceVersionPolicy, organizationId, serviceId, versionId) {
                            return ServiceVersionPolicy.query(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise
                                .then(function (result) {
                                    var jwt = false;
                                    angular.forEach(result, function (policy) {
                                        if (policy.policyDefinitionId === 'JWT') {
                                            jwt = true;
                                        }
                                    });
                                    return jwt;
                                });
                        },
                        CurrentUserApps: 'CurrentUserApps',
                        userApps: function (CurrentUserApps) {
                            return CurrentUserApps.query().$promise;
                        }
                    },
                    controller: 'DocumentationCtrl'
                })
                // Plans Tab
                .state('root.api.plans', {
                    url: '/plans',
                    templateUrl: 'views/partials/api/plans.html',
                    resolve: {
                        ServiceVersionPolicy: 'ServiceVersionPolicy',
                        svcPolicies: function (ServiceVersionPolicy, organizationId, serviceId, versionId) {
                            return ServiceVersionPolicy.query(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        },
                        ServicePlans: 'ServicePlans',
                        planData: function (ServicePlans, organizationId, serviceId, versionId) {
                            return ServicePlans.query(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
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
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        }
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
                        },
                        ServiceVersion: 'ServiceVersion',
                        svcVersions: function ($q, svcData, ServiceVersion) {
                            var svcVersions = {};
                            var promises = [];

                            angular.forEach(svcData, function (svc) {
                                promises.push(ServiceVersion.query(
                                    {orgId: svc.organizationId, svcId: svc.id}).$promise);
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (value) {
                                    svcVersions[value[0].id] = value[0];
                                });
                                return svcVersions;
                            });
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
                        },
                        PlanVersion: 'PlanVersion',
                        planVersions: function ($q, planData, PlanVersion) {
                            var planVersions = {};
                            var promises = [];

                            angular.forEach(planData, function (plan) {
                                promises.push(PlanVersion.query(
                                    {orgId: plan.organizationId, planId: plan.id}).$promise);
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (value) {
                                    planVersions[value[0].id] = value[0];
                                });
                                return planVersions;
                            });
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
                        },
                        Users: 'Users',
                        memberDetails: function ($q, memberData, Users) {
                            var memberDetails = [];
                            var promises = [];

                            angular.forEach(memberData, function (member) {
                                promises.push(Users.get(
                                    {userId: member.userId}).$promise);
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (details) {
                                    memberDetails[details.username] = details;
                                });
                                return memberDetails;
                            });
                        },
                        Roles: 'Roles',
                        roleData: function (Roles) {
                            return Roles.query().$promise;
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
                        CurrentUserSvcOrgs: 'CurrentUserSvcOrgs',
                        appOrgData: function (CurrentUserAppOrgs) {
                            return CurrentUserAppOrgs.query().$promise;
                        },
                        svcOrgData: function (CurrentUserSvcOrgs) {
                            return CurrentUserSvcOrgs.query().$promise;
                        }
                    },
                    controller: 'MyOrganizationsCtrl'
                })

                // PLAN OVERVIEW PAGE AND NESTED VIEWS ====================================
                .state('root.plan', {
                    url: '/org/:orgId/plan/:planId/:versionId',
                    templateUrl: 'views/plan.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, organizationId) {
                            return Organization.get({id: organizationId}).$promise;
                        },
                        PlanVersion: 'PlanVersion',
                        planData: function (PlanVersion, organizationId, planId, versionId) {
                            return PlanVersion.get(
                                {orgId: organizationId, planId: planId, versionId: versionId}).$promise;
                        },
                        planVersions: function (PlanVersion, organizationId, planId) {
                            return PlanVersion.query({orgId: organizationId, planId: planId}).$promise;
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        planId: function ($stateParams) {
                            return $stateParams.planId;
                        },
                        versionId: function ($stateParams) {
                            return $stateParams.versionId;
                        }
                    },
                    controller: 'PlanCtrl'
                })
                // Policies Tab
                .state('root.plan.policies', {
                    url: '/policies',
                    templateUrl: 'views/partials/plan/policies.html',
                    resolve: {
                        PlanVersionPolicy: 'PlanVersionPolicy',
                        policyData: function (PlanVersionPolicy, organizationId, planId, versionId) {
                            return PlanVersionPolicy.query(
                                {orgId: organizationId, planId: planId, versionId: versionId}).$promise;
                        },
                        policyConfig: 'policyConfig',
                        policyConfiguration: function ($q, policyData, organizationId, planId,
                                                       policyConfig, versionId, PlanVersionPolicy) {
                            var policyConfiguration = [];
                            var promises = [];

                            angular.forEach(policyData, function (policy) {
                                promises.push(PlanVersionPolicy.get(
                                    {orgId: organizationId,
                                        planId: planId,
                                        versionId: versionId,
                                        policyId: policy.id}).$promise);
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (value) {
                                    policyConfiguration[value.id] = policyConfig.createConfigObject(value);
                                });
                                return policyConfiguration;
                            });
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
                        PlanVersionActivity: 'PlanVersionActivity',
                        activityData: function (PlanVersionActivity, organizationId, planId, versionId) {
                            return PlanVersionActivity.get(
                                {orgId: organizationId, planId: planId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'PlanActivityCtrl'
                })

                // APPLICATION OVERVIEW PAGE AND NESTED VIEWS =====================================
                .state('root.application', {
                    url: '/org/:orgId/application/:appId/:versionId',
                    templateUrl: 'views/application.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, organizationId) {
                            return Organization.get({id: organizationId}).$promise;
                        },
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
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        applicationId: function ($stateParams) {
                            return $stateParams.appId;
                        },
                        versionId: function ($stateParams) {
                            return $stateParams.versionId;
                        }
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
                        ApplicationVersionActivity: 'ApplicationVersionActivity',
                        activityData: function (ApplicationVersionActivity, organizationId, applicationId, versionId) {
                            return ApplicationVersionActivity.get(
                                {orgId: organizationId, appId: applicationId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ActivityCtrl'
                })
                // Metrics Tab
                .state('root.application.metrics', {
                    url: '/metrics',
                    templateUrl: 'views/partials/application/metrics.html',
                    controller: 'AppMetricsCtrl'
                })

                // SERVICE OVERVIEW PAGE AND NESTED VIEWS ====================================
                .state('root.service', {
                    url: '/org/:orgId/service/:svcId/:versionId',
                    templateUrl: 'views/service.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, organizationId) {
                            return Organization.get({id: organizationId}).$promise;
                        },
                        ServiceVersion: 'ServiceVersion',
                        svcData: function (ServiceVersion, organizationId, serviceId, versionId) {
                            return ServiceVersion.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        },
                        svcVersions: function (ServiceVersion, organizationId, serviceId) {
                            return ServiceVersion.query({orgId: organizationId, svcId: serviceId}).$promise;
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        serviceId: function ($stateParams) {
                            return $stateParams.svcId;
                        },
                        versionId: function ($stateParams) {
                            return $stateParams.versionId;
                        },
                        ServiceSupportTickets: 'ServiceSupportTickets',
                        support: function (ServiceSupportTickets, organizationId, serviceId) {
                            return ServiceSupportTickets.query({orgId: organizationId, svcId: serviceId}).$promise;
                        }
                    },
                    controller: 'ServiceCtrl'
                })
                // Overview Tab
                .state('root.service.overview', {
                    url: '/overview',
                    templateUrl: 'views/partials/service/overview.html',
                    resolve: {
                        ServiceVersionContracts: 'ServiceVersionContracts',
                        svcContracts: function (ServiceVersionContracts, organizationId, serviceId, versionId) {
                            return ServiceVersionContracts.query(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ServiceOverviewCtrl'
                })
                // Implementation Tab
                .state('root.service.implementation', {
                    url: '/implementation',
                    templateUrl: 'views/partials/service/implementation.html',
                    resolve: {
                        ServiceVersion: 'ServiceVersion',
                        svcData: function (ServiceVersion, organizationId, serviceId, versionId) {
                            return ServiceVersion.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ServiceImplementationCtrl'
                })
                // Definition Tab
                .state('root.service.definition', {
                    url: '/definition',
                    templateUrl: 'views/partials/service/definition.html',
                    resolve: {
                        ServiceEndpoint: 'ServiceEndpoint',
                        endpoint: function (ServiceEndpoint, organizationId, serviceId, versionId) {
                            return ServiceEndpoint.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
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
                        },
                        policyConfig: 'policyConfig',
                        policyConfiguration: function ($q, policyData, organizationId, serviceId, versionId,
                                                       policyConfig, ServiceVersionPolicy) {
                            var policyConfiguration = [];
                            var promises = [];

                            angular.forEach(policyData, function (policy) {
                                promises.push(ServiceVersionPolicy.get(
                                    {orgId: organizationId,
                                        svcId: serviceId,
                                        versionId: versionId,
                                        policyId: policy.id}).$promise);
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (value) {
                                    policyConfiguration[value.id] = policyConfig.createConfigObject(value);
                                });
                                return policyConfiguration;
                            });
                        }
                    },
                    data: {
                        type: 'service'
                    },
                    controller: 'ServicePoliciesCtrl'
                })
                // Terms Tab
                .state('root.service.terms', {
                    url: '/terms',
                    templateUrl: 'views/partials/service/terms.html',
                    controller: 'ServiceTermsCtrl'
                })
                // Announcements Tab
                .state('root.service.announcements', {
                    url: '/announcements',
                    templateUrl: 'views/partials/service/announcements.html',
                    resolve: {
                        ServiceAnnouncementsAll: 'ServiceAnnouncementsAll',
                        announcements: function (ServiceAnnouncementsAll, organizationId, serviceId) {
                            return ServiceAnnouncementsAll.query({orgId: organizationId, svcId: serviceId}).$promise;
                        }
                    },
                    controller: 'ServiceAnnouncementsCtrl'
                })
                // Support Tab
                .state('root.service.support', {
                    url: '/support',
                    templateUrl: 'views/partials/service/support.html',
                    resolve: {
                    },
                    controller: 'ServiceSupportCtrl'
                })
                // Activity Tab
                .state('root.service.activity', {
                    url: '/activity',
                    templateUrl: 'views/partials/service/activity.html',
                    resolve: {
                        ServiceVersionActivity: 'ServiceVersionActivity',
                        activityData: function (ServiceVersionActivity, organizationId, serviceId, versionId) {
                            return ServiceVersionActivity.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ServiceActivityCtrl'
                })
                // Metrics Tab
                .state('root.service.metrics', {
                    url: '/metrics',
                    templateUrl: 'views/partials/service/metrics.html',
                    controller: 'ServiceMetricsController'
                })

                // USER PROFILE AND SETTINGS PAGE AND NESTED VIEWS ================================
                .state('root.user', {
                    url: '/user',
                    templateUrl: 'views/user.html',
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
                });
        })

        .run(function($state, $rootScope) {
            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                event.preventDefault();
                if (angular.isObject(error)) {
                    switch (error.status) {
                        case 401: // Unauthorized
                            console.log('Unauthorized');
                            break;
                        default:
                            $state.get('error').error = error;
                            $state.go('error');
                            break;
                    }
                }
                else {
                    // unexpected error
                    $state.go('error');
                }
            });
        })

        .factory('apikeyInjector', function(CONFIG) {
            return {
                request: function (config) {
                    config.headers.apikey = CONFIG.SECURITY.API_KEY;
                    return config;
                }
            };
        })

        .config(function ($httpProvider, jwtInterceptorProvider) {
            // We're annotating the function so that the $injector works when the file is minified (known issue)
            jwtInterceptorProvider.tokenGetter = ['$sessionStorage', '$state', '$http', 'jwtHelper', 'loginHelper', 'CONFIG',
                function($sessionStorage, $state, $http, jwtHelper, loginHelper, CONFIG) {
                    if ($sessionStorage.jwt) {
                        if (jwtHelper.isTokenExpired($sessionStorage.jwt)) {
                            // Token is expired, user needs to relogin
                            console.log('Token expired, redirect to login');
                            delete $sessionStorage.jwt;
                            loginHelper.redirectToLogin();
                        } else {
                            // Token is still valid, check if we need to refresh
                            var date = jwtHelper.getTokenExpirationDate($sessionStorage.jwt);
                            date.setMinutes(date.getMinutes() - 5);
                            if (date < new Date()) {
                                // do refresh, then return new jwt
                                console.log('Refreshing token');
                                var refreshUrl = CONFIG.AUTH.URL + '/login/idp/token/refresh';
                                return $http({
                                    url: refreshUrl,
                                    // This makes it so that this request doesn't send the JWT
                                    skipAuthorization: true,
                                    method: 'POST',
                                    data: {
                                        originalJWT: $sessionStorage.jwt
                                    }
                                }).then(function(response) {
                                    $sessionStorage.jwt = response.data.jwt;
                                    return $sessionStorage.jwt;
                                });
                            } else {
                                return $sessionStorage.jwt;
                            }
                        }
                    } else {
                        loginHelper.redirectToLogin();
                    }
                }];
            $httpProvider.interceptors.push('jwtInterceptor');
            $httpProvider.interceptors.push('apikeyInjector');
        })

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
            });
        });
}(window.angular));
