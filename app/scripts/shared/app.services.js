;(function() {
  "use strict";


  angular.module("app.services", [])

    .service("apiService", function() {
      var selectedApi = {};
      var selectedEnvironment = null;
      var selectedVersion = null;

      var setSelectedApi = function(api) {
        selectedApi = api;
      };

      var getSelectedApi = function() {
        return selectedApi;
      };

      var setSelectedEnvironment = function(environment) {
        selectedEnvironment = environment;
      };

      var getSelectedEnvironment = function() {
        if (selectedEnvironment === null) {
          setSelectedEnvironment('dev');
        }
        return selectedEnvironment;
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
        selectEnvironment: setSelectedEnvironment,
        getSelectedEnvironment: getSelectedEnvironment,
        selectVersion: selectVersion,
        getSelectedVersion: getSelectedVersion
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
