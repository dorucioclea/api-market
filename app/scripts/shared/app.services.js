;(function() {
  "use strict";


  angular.module("app.services", ["ngResource"])



    .factory('Organization', ['$resource', function ($resource) {
      return $resource('http://localhost:8080/API-Engine-web/v1/organizations/:id', { id: '@id' }, {
        update: {
          method: 'PUT'
        }
      });
    }])

    .factory('Plan', ['$resource', function ($resource) {
      return $resource('http://localhost:8080/API-Engine-web/v1/organizations/:orgId/plans/:planId', { orgId: '@organizationId', planId: '@id' });
    }])
    .factory('Service', ['$resource', function ($resource) {
      return $resource('http://localhost:8080/API-Engine-web/v1/organizations/:orgId/services/:serviceId', { orgId: '@organizationId', serviceId: '@id' });
    }])
    .factory('Application', ['$resource', function ($resource) {
      return $resource('http://localhost:8080/API-Engine-web/v1/organizations/:orgId/applications/:appId', { orgId: '@organizationId', appId: '@id' });
    }])
    .factory('Member', ['$resource', function ($resource) {
      return $resource('http://localhost:8080/API-Engine-web/v1/organizations/:orgId/members');
    }])



    .service("apiService", function() {
      var selectedApi = {};
      var selectedVersion = null;

      var setSelectedApi = function(api) {
        selectedApi = api;
      };

      var getSelectedApi = function() {
        return selectedApi;
      };

      var selectVersion = function(version) {
        selectedVersion = version;
      };

      var getSelectedVersion = function() {
        if (selectedVersion === null) {
          selectVersion('v1');
        }
        return selectedVersion;
      };

      return {
        selectApi: setSelectedApi,
        getSelectedApi: getSelectedApi,
        selectVersion: selectVersion,
        getSelectedVersion: getSelectedVersion
      };
    })

    .service("organizationService", function() {
      var selectedOrganization = {};

      var setSelectedOrganization = function(organizationId) {
        selectedOrganization = organizationId;
      };

      var getSelectedOrganization = function() {
        return selectedOrganization;
      };

      return {
        selectOrganization: setSelectedOrganization,
        getSelectedOrganization: getSelectedOrganization
      };
    })

    .service("applicationService", function() {
      var selectedApplication = {};
      var selectedVersion = {};

      var setSelectedApplication = function(application) {
        selectedApplication = application;
      };

      var getSelectedApplication = function() {
        return selectedApplication;
      };

      var setSelectedVersion = function(version) {
        selectedVersion = version;
      };

      var getSelectedVersion = function() {
        return selectedVersion;
      };

      return {
        selectApplication: setSelectedApplication,
        getSelectedApplication: getSelectedApplication,
        selectVersion: setSelectedVersion,
        getSelectedVersion: getSelectedVersion
      };
    });

})();
