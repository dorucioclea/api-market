;(function(angular) {
  "use strict";


  angular.module("app.ctrl.application", [])


/// ==== Application Controller
    .controller("ApplicationCtrl", ["$scope", "$state", "$stateParams", "appData", "appVersions", "appScreenModel", "orgScreenModel", "headerModel", "toastService", "TOAST_TYPES", "Application", "ApplicationContract",
      function ($scope, $state, $stateParams, appData, appVersions, appScreenModel, orgScreenModel, headerModel, toastService, TOAST_TYPES, Application, ApplicationContract) {
        headerModel.setIsButtonVisible(true, true);
        orgScreenModel.getOrgDataForId(orgScreenModel, $stateParams.orgId);
        $scope.applicationVersion = appData;
        appScreenModel.updateApplication(appData);
        $scope.versions = appVersions;
        $scope.displayTab = appScreenModel;
        $scope.isReady = $scope.applicationVersion.status === 'Ready';
        $scope.isRegistered = $scope.applicationVersion.status === 'Registered' || $scope.applicationVersion.status === 'Retired';
        $scope.isRetired = $scope.applicationVersion.status === 'Retired';
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;

        $scope.selectVersion = function (version) {
          $state.go($state.$current.name, { orgId: $stateParams.orgId, appId: $stateParams.appId, versionId: version.version});
        };

        $scope.breakContract = function (contract) {
          ApplicationContract.delete({orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion, contractId: contract.contractId}, function (reply) {
            $state.forceReload();
          });
        };

        $scope.updateDesc = function (newValue) {
          Application.update({orgId: $stateParams.orgId, appId: $stateParams.appId}, { description: newValue}, function (reply) {
            //TODO handle reply? Show toast for updating success?
            toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
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

      $scope.toggle = function (contract) {
        contract.apiExpanded = !contract.apiExpanded;
      };

    }])
    /// ==== Contracts Controller
    .controller("ContractsCtrl", ["$scope", "contractData", "appScreenModel", function ($scope, contractData, appScreenModel) {

      $scope.contracts = contractData;
      appScreenModel.updateTab('Contracts');

    }])

    /// ==== Metrics Controller
    .controller("AppMetricsCtrl", ["$scope", "appScreenModel", function ($scope, appScreenModel) {

      appScreenModel.updateTab('Metrics');

    }])

    /// ==== Overview Controller
    .controller("OverviewCtrl", ["$scope", "appScreenModel", function ($scope, appScreenModel) {

      appScreenModel.updateTab('Overview');

    }]);

  // #end
})(window.angular);
