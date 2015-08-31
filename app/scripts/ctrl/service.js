;(function() {
  "use strict";


  angular.module("app.ctrl.service", [])


/// ==== Service Controller
    .controller("ServiceCtrl", ["$scope", "$state", "$stateParams", "svcData", "svcVersions", "svcScreenModel", "Action",
      function ($scope, $state, $stateParams, svcData, svcVersions, svcScreenModel, Action) {

        console.log(svcData);

        $scope.serviceVersion = svcData;
        svcScreenModel.updateService(svcData);
        $scope.displayTab = svcScreenModel;
        $scope.versions = svcVersions;

        $scope.selectVersion = function (version) {
          $state.go($state.$current.name, { orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: version.version});
        };

      }])

    // +++ Service Screen Subcontrollers +++
    /// ==== Activity Controller
    .controller("ServiceActivityCtrl", ["$scope", "activityData", "svcScreenModel", function ($scope, activityData, svcScreenModel) {

      $scope.activities = activityData.beans;
      svcScreenModel.updateTab('Activity');

    }])
    /// ==== Policies Controller
    .controller("ServicePoliciesCtrl", ["$scope", "$modal", "$stateParams", "policyData", "svcScreenModel", "ServiceVersionPolicy", "PolicyDefs",
      function ($scope, $modal, $stateParams, policyData, svcScreenModel, ServiceVersionPolicy, PolicyDefs) {

        $scope.policies = policyData;
        svcScreenModel.updateTab('Policies');


        $scope.removePolicy = function(policy) {
          ServiceVersionPolicy.delete({orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId, policyId: policy.id}, function (data) {
            angular.forEach($scope.policies, function(p, index) {
              if (policy === p) {
                $scope.policies.splice(index, 1);
              }
            });
          });
        };

        $scope.modalAnim = "default";

        $scope.modalAddPolicy = function() {
          $modal.open({
            templateUrl: "views/modals/modalAddPolicy.html",
            size: "lg",
            controller: "AddPolicyCtrl as ctrl",
            resolve: {
              policyDefs: function (PolicyDefs) {
                return PolicyDefs.query({}).$promise;
              }
            },
            windowClass: $scope.modalAnim	// Animation Class put here.
          });

        };
      }])

    /// ==== Overview Controller
    .controller("ServiceOverviewCtrl", ["$scope", "svcScreenModel", function ($scope, svcScreenModel) {

      svcScreenModel.updateTab('Overview');

    }]);

  // #end
})();
