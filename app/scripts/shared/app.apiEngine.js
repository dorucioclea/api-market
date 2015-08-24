;(function() {
  "use strict";


  angular.module("app.apiEngine", ["ngResource"])


  /// ########## API Engine BaseUrl ######################
    .factory('EngineUrl', function () {
      return 'http://localhost:8080/API-Engine-web/v1';
    })



  /// ########### ENDPOINT FACTORIES #####################

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
    .factory('Service', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId', { orgId: '@organizationId', svcId: '@id' });
    }])
    .factory('ServiceVersion', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:svcId/versions/:versionId');
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
