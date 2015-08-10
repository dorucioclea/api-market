;(function() {
  "use strict";


  angular.module("app.services", [])

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
