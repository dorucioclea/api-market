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
    .controller("PlanPoliciesCtrl", ["$scope", "policyData", "planScreenModel", function ($scope, policyData, planScreenModel) {

      $scope.policies = policyData;
      planScreenModel.updateTab('Policies');

    }])

    /// ==== Overview Controller
    .controller("PlanOverviewCtrl", ["$scope", "planScreenModel", function ($scope, planScreenModel) {

      planScreenModel.updateTab('Overview');

    }]);

  // #end
})();
