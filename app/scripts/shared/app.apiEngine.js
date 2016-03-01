;(function() {
    'use strict';

    angular.module('app.apiEngine', ['ngResource'])

        /// ########### ENDPOINT FACTORIES #####################

        /// ========== ACTIONS ==========================================================================
        .factory('Action', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/actions');
        })

        .factory('SwaggerDocFetch', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/actions/swaggerdoc');
        })

        /// ========== ORGANIZATION =====================================================================

        .factory('Organization', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:id', {id: '@id'}, {
                update: {
                    method: 'PUT'
                }
            });
        })
        .factory('OrganizationActivity', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:id/activity');
        })
        .factory('OrganizationOwnershipTransfer', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/transfer');
        })
        .factory('Plan', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/plans/:planId',
                {orgId: '@organizationId', planId: '@id'}, {
                    update: {
                        method: 'PUT'
                    }
                });
        })
        .factory('PlanActivity', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/plans/:planId/activity');
        })
        .factory('PlanVersion', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/plans/:planId/versions/:versionId');
        })
        .factory('PlanVersionActivity', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/plans/:planId/versions/:versionId/activity');
        })
        .factory('PlanVersionPolicy', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/plans/:planId/versions/:versionId/policies/:policyId');
        })
        .factory('Member', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/members/:userId/:roleId', {}, {
                update: {
                    method: 'PUT',
                    isArray: true
                }
            });
        })
        .factory('Application', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/applications/:appId',
                {orgId: '@organizationId', appId: '@id'},
                {
                    update: {
                        method: 'PUT'
                    }
                });
        })
        .factory('ApplicationVersion', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/applications/:appId/versions/:versionId',
                {orgId: '@application.organisation.id', appId: '@application.id', versionId: '@id'});
        })
        .factory('ApplicationOAuthCallback', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/applications/:appId/versions/:versionId');
        })
        .factory('ApplicationActivity', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/applications/:appId/activity');
        })
        .factory('ApplicationVersionActivity', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/activity');
        })
        .factory('ApplicationContract', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/contracts/:contractId');
        })
        .factory('ApplicationMetrics', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/metrics/serviceUsage');
        })
        .factory('ApplicationApiRegistryJson', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/apiregistry/json');
        })
        .factory('ApplicationApiRegistryXml', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/applications/:appId/versions/:versionId/apiregistry/json');
        })
        .factory('Service', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId',
                {orgId: '@organizationId', svcId: '@id'},
                {
                    update: {
                        method: 'PUT'
                    }
                });
        })
        .factory('ServiceActivity', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/activity');
        })
        .factory('ServiceTerms', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/terms', {}, {
                update: {
                    method: 'PUT'
                }
            });
        })
        .factory('ServiceAnnouncements', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/announcement/:announcementId');
        })
        .factory('ServiceAnnouncementsAll', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/announcement/all');
        })
        .factory('ServiceFollowers', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/followers');
        })
        .factory('ServiceFollowerAdd', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/followers/add/:userId');
        })
        .factory('ServiceFollowerRemove', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/followers/remove/:userId');
        })
        .factory('ServiceVersion', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId', {}, {
                update: {
                    method: 'PUT'
                }
            });
        })
        .factory('ServiceVersionDefinition', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/definition',
                {}, {
                update: {
                    method: 'PUT'
                }
            });
        })
        .factory('ServiceVersionPolicy', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/services/:svcId/versions/:versionId/policies/:policyId');
        })
        .factory('ServiceVersionActivity', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/activity');
        })
        .factory('ServiceVersionContracts', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/contracts');
        })
        .factory('ServiceEndpoint', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/endpoint');
        })
        .factory('ServicePlans', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/plans/');
        })
        .factory('ServiceMkts', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/availability/');
        })
        .factory('ServicePolicies', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/plugins/');
        })
        .factory('ServiceMetricsResponse', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/services/:svcId/versions/:versionId/metrics/responseStats');
        })
        .factory('ServiceMetricsResponseSummary', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/services/:svcId/versions/:versionId/metrics/summaryResponseStats');
        })
        .factory('ServiceMetricsUsage', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/:orgId/services/:svcId/versions/:versionId/metrics/usage');
        })
        .factory('ServiceMarketInfo', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/versions/:versionId/market/info');
        })
        .factory('ServiceSupportTickets', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/organizations/:orgId/services/:svcId/support/:supportId', {},
                {
                    update: {
                        method: 'PUT'
                    }
                });
        })
        .factory('ServiceTicketComments', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL +
                '/organizations/services/support/:supportId/comments/:commentId' , {},
                {
                    update: {
                        method: 'PUT'
                    }
                });
        })
        .factory('ServiceOAuthAuthorize', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/oauth2/authorize');
        })
        .factory('ServiceOAuthToken', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/oauth2/token');
        })

        /// ========== CURRENTUSER ======================================================================

        .factory('CurrentUserInfo', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/info', {}, {
                update: {
                    method: 'PUT'
                }
            });
        })
        .factory('CurrentUserApps', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/applications');
        })

        .factory('CurrentUserAppOrgs', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/apporgs');
        })

        .factory('CurrentUserPlanOrgs', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/planorgs');
        })

        .factory('CurrentUserServices', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/services');
        })

        .factory('CurrentUserSvcOrgs', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/currentuser/svcorgs');
        })

        /// ========== USERS ============================================================================

        .factory('Users', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/users/:userId');
        })

        .factory('Admins', function ($resource, CONFIG){
            return $resource(CONFIG.BASE.URL + '/users/admins');
        })

        .factory('AdminUser', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/users/admins/:id', {id: '@id'}, {
                update: {
                    method: 'PUT'
                }
            });
        })

        .factory('UserSearch', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/users/search');
        })
        /// ========== LOGIN/LOGOUT/TOKEN REFRESH =======================================================

        .factory('LogOutRedirect', function ($resource, CONFIG) {
            return $resource(CONFIG.AUTH.URL + '/login/idp/logout');
        })
        .factory('UserSearch', function ($resource, CONFIG) {
            return $resource(CONFIG.AUTH.URL + '/login/idp/user/name');
        })
        .factory('EmailSearch', function ($resource, CONFIG) {
            return $resource(CONFIG.AUTH.URL + '/login/idp/user/mail');
        })

        /// ========== POLICYDEFS =======================================================================

        .factory('PolicyDefs', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/policyDefs/:policyId');
        })

        /// ========== ROLES ============================================================================
        .factory('Roles', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/roles/:roleId');
        })

        /// ========== SEARCH ===========================================================================

        .factory('SearchApps', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/applications');
        })
        .factory('Categories', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/service/categories/all');
        })
        .factory('PublishedCategories', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/service/categories/published');
        })
        .factory('SearchOrgs', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/organizations');
        })
        .factory('SearchSvcs', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/services', {}, {
                query: {
                    method: 'POST'
                }
            });
        })
        .factory('SearchPublishedSvcsInCategories', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/services/versions', {}, {
                query: {
                    method: 'POST', isArray: true
                }
            });
        })
        .factory('SearchSvcsWithStatus', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/search/services/:status');
        })

        /// ========== SYSTEM ============================================================================
        .factory('AvailableMkts', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/system/marketplaces');
        })
        .factory('BlacklistRecords', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/system/blacklist/records');
        })
        .factory('WhitelistRecords', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/system/whitelist/records');
        })
        .factory('StatusInfo', function ($resource, CONFIG) {
            return $resource(CONFIG.BASE.URL + '/system/status');
        })

        /// ========== OAUTH ============================================================================

        .factory('ApplicationOAuth', function ($resource, CONFIG) {
            return $resource(CONFIG.AUTH.URL +
                '/oauth/application/:clientId/target/organization/:orgId/service/:svcId/version/:versionId');
        })
        .factory('OAuthConsumer', function ($resource, CONFIG) {
            return $resource(CONFIG.AUTH.URL +
                '/oauth/consumer', {}, {
                create: {
                    method: 'POST'
                }
            });
        });

})();
