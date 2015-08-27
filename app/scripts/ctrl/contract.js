;(function() {
  "use strict";


  angular.module("app.ctrl.contract", [])
    /// ==== Contract Controller
    .controller("ContractCtrl", ["$scope", "$state", "$stateParams", "appData", "svcData", "planData", "ApplicationContract",
      function($scope, $state, $stateParams, appData, svcData, planData, ApplicationContract) {

        $scope.application = appData;
        $scope.applicationVersion = $stateParams.appVersion;
        $scope.service = svcData;
        $scope.serviceVersion = $stateParams.svcVersion;
        $scope.plans = planData;

        $scope.createContract = function (selectedPlan) {
          var contract = {
            serviceOrgId: $scope.service.organization.id,
            serviceId: $scope.service.id,
            serviceVersion: $stateParams.svcVersion,
            planId: selectedPlan.planId
          };

          ApplicationContract.save({orgId: $scope.application.organization.id, appId: $scope.application.id, versionId: $stateParams.appVersion}, contract, function (data) {
            $state.go('application.contracts', {orgId: $scope.application.organization.id, appId: $scope.application.id});
          });
        };

      }]);
  // #end
})();
