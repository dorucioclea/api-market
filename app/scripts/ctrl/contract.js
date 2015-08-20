;(function() {
  "use strict";


  angular.module("app.ctrl.contract", [])
    /// ==== Contract Controller
    .controller("ContractCtrl", ["$scope", "$modal", "$location", "$localStorage", "$timeout", "appData", "svcData", "ApplicationVersion", "ApplicationContract", "ServicePlans",
      function($scope, $modal, $location, $localStorage, $timeout, appData, svcData, ApplicationVersion, ApplicationContract, ServicePlans) {

        $scope.application = appData;
        $scope.service = svcData;
        $scope.selectedVersion = $scope.$storage.selectedAppVersion;

        console.log("App: " + appData);
        console.log("Svc: " + svcData);


        ApplicationVersion.query({orgId: $scope.application.organization.id, appId: $scope.application.id}, function (data) {
          $scope.versions = data;
        });

        ServicePlans.query({orgId: $scope.service.organization.id, svcId: $scope.service.id, versionId: 'v1'}, function (data) {
          $scope.plans = data;
        });

        //$scope.plans = [
        //  "Unlimited",
        //  "Bronze",
        //  "Silver",
        //  "Gold",
        //  "Platinum"
        //];

        $scope.updateSelectedAppVersion = function() {
          $scope.$storage.selectedAppVersion = this.selectedVersion;
        };

        $scope.createContract = function () {
          var contract = {
            serviceOrgId: $scope.service.organizationId,
            serviceId: $scope.service.id,
            serviceVersion: $scope.$storage.selectedSvcVersion,
            planId: $scope.selectedPlan
          };

          ApplicationContract.save({orgId: $scope.organization.id, appId: $scope.application.id, versionId: $scope.selectedVersion}, contract, function (data) {
            $location.path('application');
          });
        };

      }]);
  // #end
})();
