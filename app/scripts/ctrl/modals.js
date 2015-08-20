;(function() {
  "use strict";


angular.module("app.ctrl.modals", [])

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
