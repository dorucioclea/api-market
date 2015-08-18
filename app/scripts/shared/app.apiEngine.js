;(function() {
  "use strict";


  angular.module("app.apiEngine", ["ngResource"])


    /// #### API Engine BaseUrl ####
    .factory('EngineUrl', function () {
      return 'http://localhost:8080/API-Engine-web/v1';
    })



    /// #### ENDPOINT FACTORIES ####
    /// ==== Organization ====
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
    .factory('Service', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/services/:serviceId', { orgId: '@organizationId', serviceId: '@id' });
    }])
    .factory('Application', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/applications/:appId', { orgId: '@organizationId', appId: '@id' });
    }])
    .factory('Member', ['$resource', 'EngineUrl', function ($resource, EngineUrl) {
      return $resource(EngineUrl + '/organizations/:orgId/members');
    }])


    /// ==== CurrentUser ====
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

})();
