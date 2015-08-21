;(function() {
  "use strict";


  angular.module("app.ctrl.contract", [])
    /// ==== Contract Controller
    .controller("ContractCtrl", ["$scope", "$modal", "$location", "$localStorage", "$stateParams", "$timeout", "appData", "svcData", "planData", "ApplicationContract",
      function($scope, $modal, $location, $localStorage, $stateParams, $timeout, appData, svcData, planData, ApplicationContract) {

        $scope.application = appData;
        $scope.applicationVersion = $stateParams.appVersion;
        $scope.service = svcData;
        $scope.serviceVersion = $stateParams.svcVersion;
        $scope.plans = planData;

        $scope.createContract = function (selectedPlan) {
          var contract = {
            serviceOrgId: $scope.service.organizationId,
            serviceId: $scope.service.id,
            serviceVersion: $stateParams.svcVersion,
            planId: selectedPlan.planId
          };

          ApplicationContract.save({orgId: $scope.application.organization.id, appId: $scope.application.id, versionId: $stateParams.appVersion}, contract, function (data) {
            $location.path('application');
          });
        };

      }]);
  // #end
})();
