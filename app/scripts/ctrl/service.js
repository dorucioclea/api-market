;(function() {
  "use strict";


  angular.module("app.ctrl.service", [])


/// ==== Service Controller
    .controller("ServiceCtrl", ["$scope", "$state", "$stateParams", "svcData", "svcVersions", "svcScreenModel", "Action",
      function ($scope, $state, $stateParams, svcData, svcVersions, svcScreenModel, Action) {

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

    /// ==== Definition Controller
    .controller("ServiceDefinitionCtrl", ["$scope", "$state", "$stateParams", "definitionData", "ServiceVersionDefinition", "svcScreenModel",
      function ($scope, $state, $stateParams, definitionData, ServiceVersionDefintion, svcScreenModel) {

        $scope.currentDefinition = definitionData;
        svcScreenModel.updateTab('Definition');

        if (angular.isDefined($scope.currentDefinition)) {
          $scope.currentDefinitionJSON = angular.toJson($scope.currentDefinition, true);
          $scope.updatedDefinition = $scope.currentDefinitionJSON;
        }

        $scope.reset = function () {
          $scope.updatedDefinition = $scope.currentDefinitionJSON;
        };

        $scope.saveDefinition = function () {
          ServiceVersionDefintion.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId}, $scope.updatedDefinition, function (data) {
            $state.forceReload();
          });
        };

        $scope.$watch('updatedDefinition', function(def) {
          $scope.changed = def !== $scope.currentDefinitionJSON;
          $scope.invalid = !(def.length > 0 && def !== $scope.currentDefinitionJSON);
        }, true);

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
