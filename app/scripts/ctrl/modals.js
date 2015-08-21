;(function() {
  "use strict";


angular.module("app.ctrl.modals", [])

/// ==== Application Selection Controller
  .controller("AppSelectCtrl", ["$scope", "$modal", "$state", "$stateParams", "$timeout", "svcModel", "Application", "ApplicationVersion", "CurrentUserAppOrgs",
    function ($scope, $modal, $state, $stateParams, $timeout, svcModel, Application, ApplicationVersion, CurrentUserAppOrgs) {

      $scope.orgSelected = false;
      $scope.appSelected = false;
      $scope.versionSelected = false;
      $scope.service = svcModel.getService();

      CurrentUserAppOrgs.query({}, function (data) {
        $scope.organizations = data;
      });

      $scope.getOrgApps = function (selectedOrg) {
        Application.query({orgId: selectedOrg.id}, function (data) {
          $scope.applications = data;
          $scope.orgSelected = true;
        })
      };

      $scope.getAppVersions = function (selectedApp) {
        ApplicationVersion.query({orgId: selectedApp.organizationId, appId: selectedApp.id}, function (data) {
          $scope.versions = data;
          $scope.appSelected = true;
        })
      };

      $scope.versionIsSelected = function () {
        $scope.versionSelected = true;
      };

      $scope.startCreateContract = function(selectedVersion) {
        $state.go('contract',
          { appOrgId: selectedVersion.organizationId, appId: selectedVersion.id, appVersion: selectedVersion.version,
            svcOrgId: $stateParams.orgId, svcId: $stateParams.svcId, svcVersion: 'v1'
          });
        $scope.$close();
      };

      $scope.modalClose = function() {
        $scope.$close();	// this method is associated with $modal scope which is this.
      };

    }])

/// ==== NewApplication Controller
.controller("NewApplicationCtrl", ["$scope", "$localStorage", "$modal", "$state", "$timeout", "Application",
  function ($scope, $localStorage, $modal, $state, $timeout, Application) {

    $scope.$storage = $localStorage;

    $scope.createApplication = function (application) {
      Application.save({ orgId: $scope.$storage.selectedOrg.id }, application, function (app) {
        $scope.$storage.selectedApp = app;
        $timeout( function() {
          $scope.modalClose();
          $state.forceReload();
        });
      });
    };

    $scope.modalClose = function() {
      $scope.$close();	// this method is associated with $modal scope which is this.
    };

  }])

/// ==== NewOrganization Controller
  .controller("NewOrganizationCtrl", ["$scope", "$localStorage", "$modal", "$state", "$timeout", "Organization",
    function ($scope, $localStorage, $modal, $state, $timeout, Organization) {

      $scope.$storage = $localStorage;

      $scope.createOrganization = function (org) {
        Organization.save(org, function (organization) {
          $scope.$storage.selectedOrg = organization;
          $timeout(function(){
            $scope.modalClose();
            $state.forceReload();
          });
        });
      };

      $scope.modalClose = function() {
        $scope.$close();	// this method is associated with $modal scope which is this.
      };

    }]);

  // #end
})();
