;(function() {
  "use strict";


  angular.module("app.apiEngine", ["ngResource"])


  /// ########## API Engine BaseUrl ######################
    .factory('EngineUrl', function () {
      return 'http://apim.t1t.be:8000';
    })



  /// ########### ENDPOINT FACTORIES #####################

  /// ========== ACTIONS ==========================================================================
    .factory('Action', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/actions');
    }])


  /// ========== ORGANIZATION =====================================================================

    .factory('Organization', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:id', { id: '@id' }, {
        update: {
          method: 'PUT'
        }
      });
    }])
    .factory('OrganizationActivity', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:id/activity');
    }])
    .factory('Plan', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/plans/:planId', { orgId: '@organizationId', planId: '@id' });
    }])
    .factory('PlanActivity', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/plans/:planId/activity');
    }])
    .factory('PlanVersion', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/plans/:planId/versions/:versionId');
    }])
    .factory('PlanVersionActivity', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/plans/:planId/versions/:versionId/activity');
    }])
    .factory('PlanVersionPolicy', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/plans/:planId/versions/:versionId/policies/:policyId');
    }])
    .factory('Member', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/members');
    }])
    .factory('Application', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/applications/:appId', { orgId: '@organizationId', appId: '@id' });
    }])
    .factory('ApplicationVersion', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/applications/:appId/versions/:versionId', { orgId: '@application.organisation.id', appId: '@application.id', versionId: '@id'});
    }])
    .factory('ApplicationActivity', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/applications/:appId/activity');
    }])
    .factory('ApplicationContract', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/applications/:appId/versions/:versionId/contracts/:contractId');
    }])
    .factory('ApplicationApiRegistryJson', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/applications/:appId/versions/:versionId/apiregistry/json');
    }])
    .factory('ApplicationApiRegistryXml', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/applications/:appId/versions/:versionId/apiregistry/json');
    }])
    .factory('Service', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId', { orgId: '@organizationId', svcId: '@id' });
    }])
    .factory('ServiceActivity', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId/activity');
    }])
    .factory('ServiceVersion', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId/versions/:versionId', {}, {
        update: {
          method: 'PUT'
        }
      });
    }])
    .factory('ServiceVersionDefinition', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId/versions/:versionId/definition', {}, {
        update: {
          method: 'PUT'
        }
      });
    }])
    .factory('ServiceVersionPolicy', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId/versions/:versionId/policies/:policyId');
    }])
    .factory('ServiceVersionActivity', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId/versions/:versionId/activity');
    }])
    .factory('ServiceEndpoint', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId/versions/:versionId/endpoint');
    }])
    .factory('ServicePlans', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId/versions/:versionId/plans/');
    }])

  /// ========== CURRENTUSER ======================================================================

    .factory('CurrentUserInfo', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/currentuser/info', {}, {
        update: {
          method: 'PUT'
        }
      });
    }])
    .factory('CurrentUserApps', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/currentuser/applications');
    }])

    .factory('CurrentUserAppOrgs', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/currentuser/apporgs');
    }])

    .factory('CurrentUserPlanOrgs', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/currentuser/planorgs');
    }])

    .factory('CurrentUserServices', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/currentuser/services');
    }])

    .factory('CurrentUserSvcOrgs', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/currentuser/svcorgs');
    }])


  /// ========== POLICYDEFS =======================================================================

    .factory('PolicyDefs', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/policyDefs/:policyId');
    }])

  /// ========== SEARCH ===========================================================================

    .factory('SearchApps', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/search/applications');
    }])
    .factory('Categories', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/search/service/categories');
    }])
    .factory('SearchOrgs', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/search/organizations');
    }])
    .factory('SearchSvcs', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/search/services');
    }])
    .factory('SearchPublishedSvcsInCategories', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/search/services/versions', {}, {
        query: {
          method: 'POST', isArray: true
        }
      });
    }])
    .factory('SearchSvcsWithStatus', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/search/services/:status');
    }])


})();
