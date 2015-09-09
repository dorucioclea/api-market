;(function() {
  "use strict";


  angular.module("app.ctrl.application", [])


/// ==== Application Controller
    .controller("ApplicationCtrl", ["$scope", "$state", "$stateParams", "appData", "appVersions", "appScreenModel", "headerModel", "ApplicationContract",
      function ($scope, $state, $stateParams, appData, appVersions, appScreenModel, headerModel, ApplicationContract) {
        headerModel.setIsButtonVisible(true, true);
        $scope.applicationVersion = appData;
        appScreenModel.updateApplication(appData);
        $scope.versions = appVersions;
        $scope.displayTab = appScreenModel;
        $scope.isReady = $scope.applicationVersion.status === 'Ready';
        $scope.isRegistered = $scope.applicationVersion.status === 'Registered' || $scope.applicationVersion.status === 'Retired';
        $scope.isRetired = $scope.applicationVersion.status === 'Retired';

        $scope.selectVersion = function (version) {
          $state.go($state.$current.name, { orgId: $stateParams.orgId, appId: $stateParams.appId, versionId: version.version});
        };

        $scope.breakContract = function (contract) {
          ApplicationContract.delete({orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion, contractId: contract.contractId}, function (reply) {
            $state.forceReload();
          });
        };

      }])

    // +++ Application Screen Subcontrollers +++
    /// ==== Activity Controller
    .controller("ActivityCtrl", ["$scope", "activityData", "appScreenModel", function ($scope, activityData, appScreenModel) {

      $scope.activities = activityData.beans;
      appScreenModel.updateTab('Activity');

    }])
    /// ==== APIs Controller
    .controller("ApisCtrl", ["$scope", "contractData", "appScreenModel", function ($scope, contractData, appScreenModel) {

      $scope.contracts = contractData;
      appScreenModel.updateTab('APIs');

      $scope.toggle = function () {
        $scope.apiExpanded = !$scope.apiExpanded;
      };

    }])
    /// ==== Contracts Controller
    .controller("ContractsCtrl", ["$scope", "contractData", "appScreenModel", function ($scope, contractData, appScreenModel) {

      $scope.contracts = contractData;
      appScreenModel.updateTab('Contracts');

    }])

    /// ==== Overview Controller
    .controller("OverviewCtrl", ["$scope", "appScreenModel", function ($scope, appScreenModel) {

      appScreenModel.updateTab('Overview');

    }]);

  // #end
})();
