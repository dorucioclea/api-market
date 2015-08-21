;(function() {
  "use strict";


  angular.module("app.ctrl.application", [])


/// ==== Application Controller
.controller("ApplicationCtrl", ["$scope", "$localStorage", "$stateParams", "appData", "appTab",
  function ($scope, $localStorage, $stateParams, appData, appTab) {

    $scope.$storage = $localStorage;
    $scope.$storage.selectedApp = appData;
    $scope.displayTab = appTab;

  }])

  // +++ Application Screen Subcontrollers +++
  /// ==== Activity Controller
  .controller("ActivityCtrl", ["$scope", "activityData", "appTab", function ($scope, activityData, appTab) {

    $scope.activities = activityData.beans;
    appTab.updateTab('Activity');

  }])
  /// ==== APIs Controller
  .controller("ApisCtrl", ["$scope", "contractData", "appTab", function ($scope, contractData, appTab) {

    $scope.contracts = contractData;
    appTab.updateTab('APIs');

    $scope.toggle = function () {
      $scope.apiExpanded = !$scope.apiExpanded;
    };

  }])
  /// ==== Contracts Controller
  .controller("ContractsCtrl", ["$scope", "contractData", "appTab", function ($scope, contractData, appTab) {

    $scope.contracts = contractData;
    appTab.updateTab('Contracts');

  }])

  /// ==== Overview Controller
  .controller("OverviewCtrl", ["$scope", "appTab", function ($scope, appTab) {

    appTab.updateTab('Overview');

  }]);

  // #end
})();
