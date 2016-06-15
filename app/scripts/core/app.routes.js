(function () {
    'use strict';

    angular.module('app.routes', ['ui.router'])

    // UI-Router states

        // UI-Router Routing Config
        .config(function ($stateProvider, $urlRouterProvider, CONFIG) {
            
            // UI-Router Conditional Redirects
            $urlRouterProvider.otherwise('/');
            if (CONFIG.APP.PUBLISHER_MODE) $urlRouterProvider.when('/', '/my-organizations');
            else $urlRouterProvider.when('/', '/apis/grid');
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


            // UI-Router States
            $stateProvider

            // ERROR PAGE =====================================================================
                .state('error', {
                    templateUrl: '/views/error.html',
                    controller: 'ErrorCtrl'
                })
                .state('accessdenied', {
                    templateUrl: '/views/accessdenied.html',
                    controller: 'AccessDeniedCtrl'
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
                        currentUser: 'currentUser',
                        currentUserInfo: function (currentUser, loginHelper) {
                            if (loginHelper.checkLoggedIn()) return currentUser.getInfo();
                            else {
                                if (loginHelper.checkJWTInUrl()) loginHelper.redirectToLogin();
                                else return {};
                            }
                        },
                        notificationService: 'notificationService',
                        notifications: function (notificationService) {
                            return notificationService.getNotificationsForUser();
                        },
                        pendingNotifications: function (notificationService) {
                            return notificationService.getPendingNotificationsForUser();
                        }
                    },
                    controller: 'HeadCtrl'
                })

                // UX Improvements testing state
                .state('root.ux', {
                    url: '/ux',
                    templateUrl: 'views/ux.html'
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
                        },
                        contractService: 'contractService',
                        pendingContracts: function (organizationId, contractService) {
                            return contractService.outgoingPendingForOrg(organizationId);
                        }
                    },
                    controller: 'MarketDashCtrl'
                })

                // MARKETPLACE MEMBER MANAGEMENT
                .state('root.market-dash.members', {
                    url: '/members',
                    templateUrl: '/views/partials/market/members.html',
                    resolve: {
                        memberService: 'memberService',
                        memberData: function (memberService, organizationId) {
                            return memberService.getMembersForOrg(organizationId);
                        },
                        Roles: 'Roles',
                        roleData: function (Roles) {
                            return Roles.query().$promise;
                        },
                        requests: function ($q, $stateParams, memberService) {
                            var deferred = $q.defer();
                            memberService.getPendingRequests($stateParams.orgId).then(function (requests) {
                                var promises = [];
                                requests.forEach(function (req) {
                                    promises.push(memberService.getMemberDetails(req.userId).then(function (results) {
                                        req.userDetails = results;
                                    }));
                                });
                                $q.all(promises).then(function () {
                                    deferred.resolve(requests);
                                });
                            });
                            return deferred.promise;
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
                        SearchLatestServiceVersions: 'SearchLatestServiceVersions',
                        svcData: function (SearchLatestServiceVersions) {
                            return SearchLatestServiceVersions.query({},
                                {filters: [{name: "status", value: "Published", operator: 'eq'}]}
                            ).$promise;
                        },
                        PublishedCategories: 'PublishedCategories',
                        categories: function (PublishedCategories) {
                            return PublishedCategories.query().$promise;
                        },
                        SearchLatestPublishedSvcsInCategories: 'SearchLatestPublishedSvcsInCategories'
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
                        SearchLatestServiceVersions: 'SearchLatestServiceVersions',
                        svcData: function (SearchLatestServiceVersions, $stateParams) {
                            return SearchLatestServiceVersions.query({},
                                {filters: [{name: 'name', value: '%' + $stateParams.query + '%', operator: 'like'},
                                    {name: 'status', value: 'Published', operator: 'eq'}]}
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
                        service: 'service',
                        svcData: function (service, organizationId, serviceId, versionId) {
                            return service.getVersion(organizationId, serviceId, versionId);
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
                // Scopes Tab
                .state('root.api.scopes', {
                    url: '/scopes',
                    templateUrl: 'views/partials/api/scopes.html',
                    resolve: {
                        ServiceMkts: 'ServiceMkts',
                        serviceMarketplaces: function (ServiceMkts, organizationId, serviceId, versionId) {
                            return ServiceMkts.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        },
                        ServicePolicies: 'ServicePolicies',
                        servicePolicies: function(ServicePolicies, organizationId, serviceId, versionId){
                            return ServicePolicies.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}
                            ).$promise;
                        }

                    },
                    controller: 'SvcScopeCtrl'
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
                        },
                        contractService: 'contractService',
                        pendingContracts: function ($stateParams, contractService) {
                            return contractService.incomingPendingForOrg($stateParams.orgId);
                        },
                        pendingMemberships: function ($q, $stateParams, memberService) {
                            var deferred = $q.defer();
                            memberService.getPendingRequests($stateParams.orgId).then(function (requests) {
                                var promises = [];
                                requests.forEach(function (req) {
                                    promises.push(memberService.getMemberDetails(req.userId).then(function (results) {
                                        req.userDetails = results;
                                    }));
                                });
                                $q.all(promises).then(function () {
                                    deferred.resolve(requests);
                                });
                            });
                            return deferred.promise;
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
                        ServiceVersion: 'ServiceVersion',
                        svcData: function ($q, Service, ServiceVersion, organizationId) {
                            var deferred = $q.defer();

                            Service.query({ orgId: organizationId }, function (services) {
                                var promises = [];
                                angular.forEach(services, function (svc) {
                                    promises.push(ServiceVersion.query(
                                        { orgId: svc.organizationId, svcId: svc.id }, function (reply) {
                                            svc.serviceVersionDetails = reply[0];
                                        }).$promise);
                                });
                                $q.all(promises).then(function () {
                                    deferred.resolve(services);
                                });
                            });
                            return deferred.promise;
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
                        memberService: 'memberService',
                        memberData: function (memberService, organizationId) {
                            return memberService.getMembersForOrg(organizationId);
                        },
                        Roles: 'Roles',
                        roleData: function (Roles) {
                            return Roles.query().$promise;
                        }
                    },
                    controller: 'MembersCtrl'
                })
                // Pending Members View
                .state('root.organization.pending', {
                    url: '/pending',
                    templateUrl: 'views/partials/organization/pending.html',
                    controller: 'PendingCtrl'
                })

                // ADMINISTRATION OVERVIEW PAGE =================================================
                .state('root.administration', {
                    url: '/administration',
                    templateUrl: 'views/administration.html',
                    controller: 'AdministrationCtrl'
                })
                // Admin Users View
                .state('root.administration.users', {
                    url: '/users',
                    templateUrl: 'views/partials/administration/users.html',
                    resolve: {
                        Admins: 'Admins',
                        adminData: function(Admins){
                            return Admins.query().$promise;
                        }
                    },
                    controller: 'AdminUsersCtrl'
                })
                .state('root.administration.expiration', {
                    url: '/expiration',
                    templateUrl: 'views/partials/administration/expiration.html',
                    resolve: {
                        OAuthCentralExpTime: 'OAuthCentralExpTime',
                        oauthExp: function(OAuthCentralExpTime){
                            return OAuthCentralExpTime.get().$promise;
                        },
                        JWTCentralExpTime: 'JWTCentralExpTime',
                        jwtExp: function(JWTCentralExpTime){
                            return JWTCentralExpTime.get().$promise;
                        }
                    },
                    controller: 'AdminExpirationCtrl'
                })

                // Admin Status View
                .state('root.administration.status', {
                    url: '/status',
                    templateUrl: 'views/partials/administration/status.html',
                    resolve: {
                        adminHelper: 'adminHelper',
                        status: function (adminHelper) {
                            return adminHelper.getStatus();
                        }
                    },
                    controller: 'AdminStatusCtrl'
                })

                // ORGANIZATIONS SEARCH PAGE ======================================================
                .state('root.organizations', {
                    url: '/organizations',
                    templateUrl: 'views/organizations.html',
                    resolve: {
                        CurrentUserAppOrgs: 'CurrentUserAppOrgs',
                        CurrentUserSvcOrgs: 'CurrentUserSvcOrgs',
                        appOrgData: function (CurrentUserAppOrgs) {
                            return CurrentUserAppOrgs.query().$promise;
                        },
                        svcOrgData: function (CurrentUserSvcOrgs) {
                            return CurrentUserSvcOrgs.query().$promise;
                        },
                        orgService: 'orgService',
                        orgs: function (orgService) {
                            return orgService.search();
                        },
                        notificationService: 'notificationService',
                        pendingOrgs: function (notificationService) {
                            return notificationService.getOrgsWithPendingRequest()
                        }
                    },
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
                // Pending Contracts Tab
                .state('root.service.pending', {
                    url: '/pending',
                    templateUrl: 'views/partials/service/pending.html',
                    controller: 'ServicePendingContractsCtrl'
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
                // Scope Tab
                .state('root.service.scopes', {
                    url: '/scopes',
                    templateUrl: 'views/partials/service/scopes.html',
                    resolve: {
                        AvailableMkts: 'AvailableMkts',
                        marketplaces: function (AvailableMkts) {
                            return AvailableMkts.get().$promise;
                        },
                        ServiceMkts: 'ServiceMkts',
                        serviceMarketplaces: function (ServiceMkts, organizationId, serviceId, versionId) {
                            return ServiceMkts.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ServiceScopeCtrl'
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
}());
