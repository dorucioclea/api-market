;(function() {
  "use strict";


  angular.module("app.ctrl.plan", [])


/// ==== Plan Controller
    .controller("PlanCtrl", ["$scope", "$modal", "$state", "$stateParams", "planData", "planVersions", "planScreenModel", "Action",
      function ($scope, $modal, $state, $stateParams, planData, planVersions, planScreenModel, Action) {

        $scope.planVersion = planData;
        planScreenModel.updatePlan(planData);
        $scope.displayTab = planScreenModel;
        $scope.versions = planVersions;

        $scope.locked = $scope.planVersion.status === 'Locked';

        $scope.modalNewVersion = function() {
          $modal.open({
            templateUrl: "views/modals/modalNewPlanVersion.html",
            size: "lg",
            controller: "NewPlanVersionCtrl as ctrl",
            resolve: function() {},
            windowClass: $scope.modalAnim	// Animation Class put here.
          });

        };

        $scope.lockPlan = function () {
          var lockAction = {
            type: 'lockPlan',
            organizationId: $stateParams.orgId,
            entityId: $stateParams.planId,
            entityVersion: $stateParams.versionId
          };
          Action.save(lockAction, function (reply) {
            $state.forceReload();
          });
        };

        $scope.selectVersion = function (version) {
          $state.go($state.$current.name, { orgId: $stateParams.orgId, planId: $stateParams.planId, versionId: version.version});
        };

      }])

    // +++ Plan Screen Subcontrollers +++
    /// ==== Activity Controller
    .controller("PlanActivityCtrl", ["$scope", "activityData", "planScreenModel", function ($scope, activityData, planScreenModel) {

      $scope.activities = activityData.beans;
      planScreenModel.updateTab('Activity');

    }])
    /// ==== Policies Controller
    .controller("PlanPoliciesCtrl", ["$scope", "$modal", "$stateParams", "policyData", "planScreenModel", "PlanVersionPolicy", "PolicyDefs",
      function ($scope, $modal, $stateParams, policyData, planScreenModel, PlanVersionPolicy, PolicyDefs) {

        $scope.policies = policyData;
        planScreenModel.updateTab('Policies');


        $scope.removePolicy = function(policy) {
          PlanVersionPolicy.delete({orgId: $stateParams.orgId, planId: $stateParams.planId, versionId: $stateParams.versionId, policyId: policy.id}, function (data) {
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
    .controller("PlanOverviewCtrl", ["$scope", "planScreenModel", function ($scope, planScreenModel) {

      planScreenModel.updateTab('Overview');

    }]);

  // #end
})();
