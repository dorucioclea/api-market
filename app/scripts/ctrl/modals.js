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
              svcOrgId: $stateParams.orgId, svcId: $stateParams.svcId, svcVersion: $stateParams.versionId
            });
          $scope.$close();
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewApplication Controller
    .controller("NewApplicationCtrl", ["$scope", "$modal", "$state", "$stateParams", "orgScreenModel", "Application",
      function ($scope, $modal, $state, $stateParams, orgScreenModel, Application) {

        $scope.org = orgScreenModel.organization;

        $scope.createApplication = function (application) {
          Application.save({ orgId: $stateParams.orgId }, application, function (app) {
            $scope.modalClose();
            $state.forceReload();
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewService Controller
    .controller("NewServiceCtrl", ["$scope", "$modal", "$state", "$stateParams", "orgScreenModel", "Service",
      function ($scope, $modal, $state, $stateParams, orgScreenModel, Service) {

        $scope.org = orgScreenModel.organization;


        $scope.createService = function (svc, categories) {
          var cats = [];
          for (var i = 0; i < categories.length; i++) {
            cats.push(categories[i].text);
          }
          svc.categories = cats;
          Service.save({ orgId: $stateParams.orgId }, svc, function (data) {
            $scope.modalClose();
            $state.forceReload();
          })
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewOrganization Controller
    .controller("NewOrganizationCtrl", ["$scope", "$modal", "$state", "Organization",
      function ($scope, $modal, $state, Organization) {

        $scope.createOrganization = function (org) {
          Organization.save(org, function (data) {
            $scope.modalClose();
            $state.forceReload();
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }]);

  // #end
})();
