;(function() {
  "use strict";


  angular.module("app.ctrl.plan", [])


/// ==== Plan Controller
    .controller("PlanCtrl", ["$scope", "$localStorage", "$stateParams", "planScreenModel",
      function ($scope, $localStorage, $stateParams, planScreenModel) {

        $scope.$storage = $localStorage;
        $scope.displayTab = planScreenModel;

      }])

    // +++ Plan Screen Subcontrollers +++
    /// ==== Activity Controller
    .controller("PlanActivityCtrl", ["$scope", "activityData", "planScreenModel", function ($scope, activityData, planScreenModel) {

      $scope.activities = activityData.beans;
      planScreenModel.updateTab('Activity');

    }])
    /// ==== Policies Controller
    .controller("PlanPoliciesCtrl", ["$scope", "$modal", "policyData", "planScreenModel", "PolicyDefs",
      function ($scope, $modal, policyData, planScreenModel, PolicyDefs) {

      $scope.policies = policyData;
      planScreenModel.updateTab('Policies');

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
