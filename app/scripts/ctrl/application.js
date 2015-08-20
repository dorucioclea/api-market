;(function() {
  "use strict";


  angular.module("app.ctrl.application", [])


/// ==== Application Controller
.controller("ApplicationCtrl", ["$scope", "$localStorage", "$stateParams", "appData",
  function ($scope, $localStorage, $stateParams, appData) {

    $scope.$storage = $localStorage;
    $scope.$storage.selectedApp = appData;

  }])

  // +++ Application Screen Subcontrollers +++
  /// ==== Activity Controller
  .controller("ActivityCtrl", ["$scope", "$localStorage", "ApplicationActivity", function ($scope, $localStorage, ApplicationActivity) {

    $scope.$storage = $localStorage;

    ApplicationActivity.get({orgId: $scope.$storage.selectedApp.organization.id, appId: $scope.$storage.selectedApp.id}, function (data) {
      $scope.activities = data.beans;
    });

  }])
  /// ==== APIs Controller
  .controller("ApisCtrl", ["$scope", "$localStorage", "Plan", function ($scope, $localStorage, Plan) {

    $scope.$storage = $localStorage;

    Plan.query({orgId: $scope.$storage.selectedOrg.id}, function (data) {
      $scope.plans = data;
    });

  }])
  /// ==== Contracts Controller
  .controller("ContractsCtrl", ["$scope", "$localStorage", "Plan", function ($scope, $localStorage, Plan) {

    $scope.$storage = $localStorage;

    Plan.query({orgId: $scope.$storage.selectedOrg.id}, function (data) {
      $scope.plans = data;
    });

  }]);

  // #end
})();
