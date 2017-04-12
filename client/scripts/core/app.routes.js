(function () {
    'use strict';

    angular.module('app.core.routes', ['ui.router'])

    // UI-Router states

    // UI-Router Routing Config
        .config(function ($stateProvider, $urlRouterProvider) {

            // UI-Router Conditional Redirects
            $urlRouterProvider.otherwise('/apis/grid');
            $urlRouterProvider.when('/org/{orgId}/api/{svcId}/{versionId}', '/org/{orgId}/api/{svcId}/{versionId}/documentation');
            $urlRouterProvider.when('/org/{orgId}', '/org/{orgId}/plans');
            $urlRouterProvider.when('/org/{orgId}/application/{appId}/{versionId}', '/org/{orgId}/application/{appId}/{versionId}/overview');
            $urlRouterProvider.when('/org/{orgId}/service/{svcId}/{versionId}', '/org/{orgId}/service/{svcId}/{versionId}/overview');
            $urlRouterProvider.when('/org/{orgId}/plan/{planId}/{versionId}', '/org/{orgId}/plan/{planId}/{versionId}/policies');
            $urlRouterProvider.when('/org/{orgId}/dash', '/org/{orgId}/dash/applications');


            // UI-Router States
            $stateProvider

            // ERROR PAGE =====================================================================
                .state('root.error', {
                    templateUrl: '/views/error.html',
                    controller: 'ErrorCtrl'
                })
                .state('root.maintenance', {
                    templateUrl: '/views/maintenanceLogin.html',
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
                    templateUrl: '/views/logout.html',
                    controller: 'LogoutCtrl'
                })

                // ROOT STATE =====================================================================
                .state('root', {
                    templateUrl: '/views/partials/root.html',
                    resolve: {
                        currentUserModel: 'currentUserModel',
                        currentUserInfo: function (currentUserModel, loginHelper) {
                            if (loginHelper.checkJWTInSession()) return currentUserModel.refreshCurrentUserInfo(currentUserModel);
                            else {
                                return {};
                            }
                        },
                        notificationService: 'notificationService',
                        notifications: function (notificationService, loginHelper) {
                            if (loginHelper.checkLoggedIn()) return notificationService.getNotificationsForUser();
                            else return [];
                        },
                        pendingNotifications: function (notificationService, loginHelper) {
                            if (loginHelper.checkLoggedIn()) return notificationService.getPendingNotificationsForUser();
                            else return [];
                        }
                    },
                    controller: 'HeadCtrl as ctrl'
                })

                // MARKETPLACE CONSUMER DASHBOARD =================================================
                .state('root.market-dash', {
                    url: '/org/:orgId/dash',
                    templateUrl: '/views/market-dashboard.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, organizationId) {
                            return Organization.get({id: organizationId}).$promise;
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        }
                    },
                    controller: 'MarketDashCtrl'
                })
                .state('root.market-dash.applications', {
                    url: '/applications',
                    params: {
                        mode: null
                    },
                    templateUrl: '/views/partials/market/applications.html',
                    resolve: {
                        appData: function ($q, organizationId, currentUser) {
                            var appData = [];
                            return currentUser.getUserApps().then(function (results) {
                                angular.forEach(results, function (app) {
                                    if (app.organizationId === organizationId) {
                                        appData.push(app);
                                    }
                                });
                                return appData;
                            });
                        },
                        appService: 'appService',
                        appVersions: function ($q, appData, appService) {
                            var promises = [];

                            angular.forEach(appData, function (app) {
                                promises.push(appService.getAppVersions(app.organizationId, app.id).then(function (appVersions) {
                                    app.versions = appVersions;
                                }));
                            });
                            return $q.all(promises);
                        },
                        appVersionDetails: function ($q, appData, appVersions, appService) {
                            var promises = [];
                            
                            angular.forEach(appData, function (app) {
                                angular.forEach(app.versions, function (appVersion) {
                                    promises.push(
                                        appService.getAppVersionDetails(appVersion.organizationId, appVersion.id, appVersion.version).then(function (versionDetails) {
                                           appVersion.details = versionDetails; 
                                        }));
                                })
                            });
                            
                            return $q.all(promises);
                        },
                        appContracts: function ($q, appData, appVersions, appService) {
                            var promises = [];
                            angular.forEach(appData, function (app) {
                                angular.forEach(app.versions, function (appVersion) {
                                    promises.push(appService.getAppVersionContracts(appVersion.organizationId, appVersion.id, appVersion.version).then(function (versionContracts) {
                                        appVersion.contracts = versionContracts;
                                        appVersion.pendingContracts = [];
                                    }))
                                });
                            });
                            return $q.all(promises);
                        },
                        contractService: 'contractService',
                        pendingContracts: function (organizationId, contractService) {
                            return contractService.outgoingPendingForOrg(organizationId);
                        },
                        Gateways: 'Gateways',
                        gateways: function (Gateways) {
                            return Gateways.query().$promise;
                        }
                    },
                    controller: 'MarketAppsCtrl'
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
                        userService: 'userService',
                        requests: function ($q, $stateParams, memberService, userService) {
                            var deferred = $q.defer();
                            memberService.getPendingRequests($stateParams.orgId).then(function (requests) {
                                var promises = [];
                                requests.forEach(function (req) {
                                    promises.push(userService.getUserDetails(req.userId).then(function (results) {
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
                        apiService: 'apiService',
                        svcData: function (apiService) {
                            return apiService.getMarketplaceApis();
                        },
                        categories: function (apiService) {
                            return apiService.getPublishedCategories();
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
                        apiService: 'apiService',
                        svcData: function (apiService, $stateParams) {
                            return apiService.searchMarketplaceApis($stateParams.query);
                        }
                    },
                    controller: 'ApiSearchCtrl'
                })

                // API MARKETPLACE PAGE AND NESTED VIEWS ==============================================
                .state('root.api', {
                    url: '/org/:orgId/api/:svcId/:versionId',
                    templateUrl: 'views/api.html',
                    resolve: {
                        apiService: 'apiService',
                        svcData: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceVersion(organizationId, serviceId, versionId);
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
                        versions: function (apiService, organizationId, serviceId) {
                            return apiService.getServiceVersions(organizationId, serviceId);
                        },
                        support: function (apiService, organizationId, serviceId) {
                            return apiService.getServiceSupportTickets(organizationId, serviceId);
                        },
                        endpoint: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceEndpoint(organizationId, serviceId, versionId);
                        },
                        svcPolicies: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceVersionPolicies(organizationId, serviceId, versionId);
                        },
                        oAuthPolicy: function ($q, apiService, svcPolicies, organizationId, serviceId, versionId) {
                            var oAuthPolicy = {};
                            var promises = [];

                            angular.forEach(svcPolicies, function (policy) {
                                if (policy.policyDefinitionId === 'OAuth2') {
                                    promises.push(apiService.getServiceVersionPolicy(organizationId, serviceId, versionId, policy.id));
                                }
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (details) {
                                    oAuthPolicy = details;
                                });
                                return oAuthPolicy;
                            });
                        }
                    },
                    controller: 'ApiDocCtrl'
                })
                // Announcements Tab
                .state('root.api.announcements', {
                    url: '/announcements',
                    templateUrl: 'views/partials/api/announcements.html',
                    resolve: {
                        apiService: 'apiService',
                        announcements: function (apiService, organizationId, serviceId) {
                            return apiService.getServiceAnnouncements(organizationId,serviceId);
                        }
                    },
                    controller: 'AnnouncementCtrl'
                })
                // Documentation Tab
                .state('root.api.documentation', {
                    url: '/documentation',
                    templateUrl: 'views/partials/api/documentation.html',
                    resolve: {
                        apiService: 'apiService',
                        loginHelper: 'loginHelper',
                        serviceVersion: function (apiService, loginHelper, organizationId, serviceId, versionId) {
                            if (loginHelper.checkLoggedIn()) {
                                return apiService.getServiceVersion(organizationId, serviceId, versionId);
                            } else {
                                return null;
                            }
                        },
                        svcContracts: function (apiService, loginHelper, organizationId, serviceId, versionId) {
                            if (loginHelper.checkLoggedIn()) {
                                return apiService.getServiceVersionContracts(organizationId, serviceId, versionId);
                            } else {
                                return [];
                            }
                        },
                        svcPolicies: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceVersionPolicies(organizationId, serviceId, versionId);
                        },
                        oAuthPolicy: function ($q, apiService, svcPolicies, organizationId, serviceId, versionId) {
                            var oAuthPolicy = {};
                            var promises = [];

                            angular.forEach(svcPolicies, function (policy) {
                                if (policy.policyDefinitionId === 'OAuth2') {
                                    promises.push(apiService.getServiceVersionPolicy(organizationId, serviceId, versionId, policy.id));
                                }
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (details) {
                                    oAuthPolicy = details;
                                });
                                return oAuthPolicy;
                            });
                        },
                        jwtEnabled: function (svcPolicies, serviceVersion) {
                            var jwt = false;
                            angular.forEach(svcPolicies, function (policy) {
                                if (policy.policyDefinitionId === 'JWT') {
                                    jwt = true;
                                }
                                if (serviceVersion && serviceVersion.service && serviceVersion.service.admin) {
                                    jwt = true;
                                }
                            });
                            return jwt;
                        },
                        currentUser: 'currentUser',
                        userApps: function (currentUser, loginHelper) {
                            if (loginHelper.checkLoggedIn()) return currentUser.getUserApps();
                            else return [];
                        }
                    },
                    controller: 'DocumentationCtrl'
                })
                // Plans Tab
                .state('root.api.plans', {
                    url: '/plans',
                    templateUrl: 'views/partials/api/plans.html',
                    resolve: {
                        policyService: 'policyService',
                        svcPolicies: function (policyService, organizationId, serviceId, versionId) {
                            return policyService.getServicePoliciesWithDetailsForMarket(organizationId, serviceId, versionId);
                        },
                        planData: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServicePlans(organizationId, serviceId, versionId);
                        }
                    },
                    controller: 'SvcPlanCtrl'
                })
                // Scopes Tab
                .state('root.api.scopes', {
                    url: '/scopes',
                    templateUrl: 'views/partials/api/scopes.html',
                    resolve: {
                        apiService: 'apiService',
                        serviceMarketplaces: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceAvailability(organizationId, serviceId, versionId);
                        },
                        servicePolicies: function(apiService, organizationId, serviceId, versionId){
                            return apiService.getServicePolicies(organizationId, serviceId, versionId);
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


                // ADMINISTRATION OVERVIEW PAGE =================================================
                .state('root.administration', {
                    url: '/administration',
                    templateUrl: 'views/administration.html',
                    controller: 'AdministrationCtrl'
                })
                // Admin Users View
                .state('root.administration.users', {
                    url: '/admins',
                    templateUrl: 'views/partials/administration/users.html',
                    resolve: {
                        Admins: 'Admins',
                        adminData: function(Admins){
                            return Admins.query().$promise;
                        }
                    },
                    controller: 'AdminUsersCtrl'
                })
                .state('root.administration.branding', {
                    url: '/branding',
                    templateUrl: 'views/partials/administration/branding.html',
                    resolve: {
                        BrandingService: 'BrandingService',
                        brandingData: function(BrandingService){
                            return BrandingService.getBrandings();
                        }
                    },
                    controller: 'AdminBrandingCtrl'
                })
                .state('root.administration.security', {
                    url: '/expiration',
                    templateUrl: 'views/partials/administration/security.html',
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
                .state('root.administration.terms', {
                    url: '/terms',
                    templateUrl: 'views/partials/administration/terms.html',
                    resolve: {
                        adminHelper: 'adminHelper',
                        currentTerms: function (adminHelper) {
                            return adminHelper.getDefaultTerms();
                        }
                    },
                    controller: 'AdminTermsCtrl'
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
                        currentUser: 'currentUser',
                        appOrgData: function (currentUser) {
                            return currentUser.getUserAppOrgs();
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
                    params: {
                        mode: null
                    },
                    templateUrl: 'views/my-organizations.html',
                    resolve: {
                        currentUser: 'currentUser',
                        appOrgData: function (currentUser) {
                            return currentUser.getUserAppOrgs();
                        }
                    },
                    controller: 'MyOrganizationsCtrl'
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
                        },
                        ApplicationContract: 'ApplicationContract',
                        contractData: function (ApplicationContract, organizationId, applicationId, versionId) {
                            return ApplicationContract.query({
                                orgId: organizationId,
                                appId: applicationId,
                                versionId: versionId
                            }).$promise;
                        },
                        Gateways : 'Gateways',
                        gateways: function (Gateways) {
                            return Gateways.query().$promise;
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
                    controller: 'ContractsCtrl'
                })
                // APIs Tab
                .state('root.application.apis', {
                    url: '/apis',
                    templateUrl: 'views/partials/application/apis.html',
                    controller: 'ApisCtrl'
                })
                .state('root.application.security', {
                    url: '/security',
                    templateUrl: 'views/partials/application/security.html',
                    resolve: {
                        appService: 'appService',
                        tokens: function (appService, organizationId, applicationId, versionId) {
                            return appService.getAppVersionTokens(organizationId, applicationId, versionId);
                        }
                    },
                    controller: 'AppSecurityCtrl'
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
                })
                .state('root.user.security', {
                    url: '/connected',
                    templateUrl: 'views/partials/user/security.html',
                    resolve: {
                        currentUser: 'currentUser',
                        userGrants: function (currentUser) {
                            return currentUser.getUserGrants();
                        }
                    },
                    controller: 'UserSecurityCtrl'
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
