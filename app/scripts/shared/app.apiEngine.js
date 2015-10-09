;(function() {
    'use strict';

    angular.module('app.apiEngine', ['ngResource'])

        /// ########### ENDPOINT FACTORIES #####################

        /// ========== ACTIONS ==========================================================================
        .factory('Action', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/actions');
        }])

        /// ========== ORGANIZATION =====================================================================

        .factory('Organization', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:id', {id: '@id'}, {
                update: {
                    method: 'PUT'
                }
            });
        }])
        .factory('OrganizationActivity', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:id/activity');
        }])
        .factory('OrganizationMembers', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/members/:memberId');
        }])
        .factory('Plan', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/plans/:planId',
                {orgId: '@organizationId', planId: '@id'}, {
                    update: {
                        method: 'PUT'
                    }
                });
        }])
        .factory('PlanActivity', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/plans/:planId/activity');
        }])
        .factory('PlanVersion', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/plans/:planId/versions/:versionId');
        }])
        .factory('PlanVersionActivity', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/plans/:planId/versions/:versionId/activity');
        }])
        .factory('PlanVersionPolicy', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/plans/:planId/versions/:versionId/policies/:policyId');
        }])
        .factory('Member', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/members');
        }])
        .factory('Application', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/applications/:appId',
                {orgId: '@organizationId', appId: '@id'},
                {
                    update: {
                        method: 'PUT'
                    }
                });
        }])
        .factory('ApplicationVersion', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/applications/:appId/versions/:versionId',
                {orgId: '@application.organisation.id', appId: '@application.id', versionId: '@id'});
        }])
        .factory('ApplicationOAuthCallback', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/applications/:appId/versions/:versionId');
        }])
        .factory('ApplicationActivity', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/applications/:appId/activity');
        }])
        .factory('ApplicationVersionActivity', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/activity');
        }])
        .factory('ApplicationContract', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/contracts/:contractId');
        }])
        .factory('ApplicationMetrics', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/metrics/serviceUsage');
        }])
        .factory('ApplicationApiRegistryJson', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/apiregistry/json');
        }])
        .factory('ApplicationApiRegistryXml', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/apiregistry/json');
        }])
        .factory('Service', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId',
                {orgId: '@organizationId', svcId: '@id'},
                {
                    update: {
                        method: 'PUT'
                    }
                });
        }])
        .factory('ServiceActivity', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/activity');
        }])
        .factory('ServiceTerms', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/terms', {}, {
                update: {
                    method: 'PUT'
                }
            });
        }])
        .factory('ServiceAnnouncements', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/announcement/:announcementId');
        }])
        .factory('ServiceAnnouncementsAll', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/announcement/all');
        }])
        .factory('ServiceFollowers', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/followers');
        }])
        .factory('ServiceFollowerAdd', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/followers/add/:userId');
        }])
        .factory('ServiceFollowerRemove', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/followers/remove/:userId');
        }])
        .factory('ServiceVersion', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId', {}, {
                update: {
                    method: 'PUT'
                }
            });
        }])
        .factory('ServiceVersionDefinition', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/definition',
                {}, {
                update: {
                    method: 'PUT'
                }
            });
        }])
        .factory('ServiceVersionPolicy', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/services/:svcId/versions/:versionId/policies/:policyId');
        }])
        .factory('ServiceVersionActivity', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/activity');
        }])
        .factory('ServiceVersionContracts', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/contracts');
        }])
        .factory('ServiceEndpoint', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/endpoint');
        }])
        .factory('ServicePlans', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/plans/');
        }])
        .factory('ServiceMetricsResponse', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/services/:svcId/versions/:versionId/metrics/responseStats');
        }])
        .factory('ServiceMetricsResponseSummary', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/services/:svcId/versions/:versionId/metrics/summaryResponseStats');
        }])
        .factory('ServiceMetricsUsage', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/services/:svcId/versions/:versionId/metrics/usage');
        }])
        .factory('ServiceMarketInfo', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/market/info');
        }])
        .factory('ServiceSupportTickets', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/support/:supportId', {},
                {
                    update: {
                        method: 'PUT'
                    }
                });
        }])
        .factory('ServiceTicketComments', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/services/support/:supportId/comments/:commentId' , {},
                {
                    update: {
                        method: 'PUT'
                    }
                });
        }])
        .factory('ServiceOAuthAuthorize', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/oauth2/authorize');
        }])
        .factory('ServiceOAuthToken', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/oauth2/token');
        }])

        /// ========== CURRENTUSER ======================================================================

        .factory('CurrentUserInfo', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/info', {}, {
                update: {
                    method: 'PUT'
                }
            });
        }])
        .factory('CurrentUserApps', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/applications');
        }])

        .factory('CurrentUserAppOrgs', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/apporgs');
        }])

        .factory('CurrentUserPlanOrgs', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/planorgs');
        }])

        .factory('CurrentUserServices', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/services');
        }])

        .factory('CurrentUserSvcOrgs', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/svcorgs');
        }])

        /// ========== USERS ============================================================================

        .factory('Users', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/users/:userId');
        }])

        /// ========== USER LOGOUT ======================================================================

        .factory('LogOutRedirect', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/users/idp/logout');
        }])

        /// ========== POLICYDEFS =======================================================================

        .factory('PolicyDefs', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/policyDefs/:policyId');
        }])

        /// ========== SEARCH ===========================================================================

        .factory('SearchApps', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/applications');
        }])
        .factory('Categories', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/service/categories/all');
        }])
        .factory('PublishedCategories', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/service/categories/published');
        }])
        .factory('SearchOrgs', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/organizations');
        }])
        .factory('SearchSvcs', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/services', {}, {
                query: {
                    method: 'POST'
                }
            });
        }])
        .factory('SearchPublishedSvcsInCategories', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/services/versions', {}, {
                query: {
                    method: 'POST', isArray: true
                }
            });
        }])
        .factory('SearchSvcsWithStatus', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/services/:status');
        }])

        /// ========== OAUTH ============================================================================

        .factory('ApplicationOAuth', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.AUTH.URL +
                '/oauth/application/:clientId/target/organization/:orgId/service/:svcId/version/:versionId');
        }])
        .factory('OAuthConsumer', ['$resource', 'CONFIG', function ($resource, CONFIG) {
            return $resource(CONFIG.AUTH.URL +
                '/oauth/consumer', {}, {
                create: {
                    method: 'POST'
                }
            });
        }]);

})();
