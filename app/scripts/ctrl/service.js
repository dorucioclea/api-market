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

    /// ==== Plans Controller
    .controller("ServicePlansCtrl", ["$scope", "$state", "$stateParams", "$q", "planData", "svcScreenModel", "PlanVersion", "ServiceVersion",
      function ($scope, $state, $stateParams, $q, planData, svcScreenModel, PlanVersion, ServiceVersion) {

        svcScreenModel.updateTab('Plans');
        var definedPlans = planData;
        var lockedPlans = [];
        $scope.updatedService = {};
        $scope.version = svcScreenModel.service;

        var getSelectedPlans = function() {
          var selectedPlans = [];
          for (var i = 0; i < lockedPlans.length; i++) {
            var plan = lockedPlans[i];
            if (plan.checked) {
              var selectedPlan = {};
              selectedPlan.planId = plan.id;
              selectedPlan.version = plan.selectedVersion;
              selectedPlans.push(selectedPlan);
            }
          }
          return selectedPlans;
        };

        //find locked plan versions
        $q(function (resolve) {
          var promises = [];
          angular.forEach(definedPlans, function (plan) {
            promises.push($q(function (resolve, reject) {
              PlanVersion.query({orgId: $stateParams.orgId, planId: plan.id}, function (planVersions) {
                var lockedVersions = [];
                for (var j = 0; j < planVersions.length; j++) {
                  var planVersion = planVersions[j];
                  if (planVersion.status == "Locked") {
                    lockedVersions.push(planVersion.version);
                  }
                }
                // if we found locked plan versions then add them
                if (lockedVersions.length > 0) {
                  plan.lockedVersions = lockedVersions;
                  lockedPlans.push(plan);
                }
                resolve(planVersions);
              }, reject);
            }))
          });
          $q.all(promises).then(function () {
            lockedPlans.sort(function (a, b) {
              if (a.id.toLowerCase() < b.id.toLowerCase()) {
                return -1;
              } else if (b.id < a.id) {
                return 1;
              } else {
                return 0;
              }
            });
            resolve(lockedPlans);
            $scope.plans = lockedPlans;
            $scope.reset();
          });
        });

        $scope.$watch('plans', function(newValue) {
          $scope.updatedService.plans = getSelectedPlans();
        }, true);

        $scope.reset = function() {
          for (var i = 0; i < lockedPlans.length; i++) {
            lockedPlans[i].selectedVersion = lockedPlans[i].lockedVersions[0];
            for (var j = 0; j < $scope.version.plans.length; j++) {
              if (lockedPlans[i].id == $scope.version.plans[j].planId) {
                lockedPlans[i].checked = true;
                lockedPlans[i].selectedVersion = $scope.version.plans[j].version;
                break;
              }
              lockedPlans[i].checked = false;
            }
          }
          $scope.updatedService.plans = getSelectedPlans();
          $scope.isDirty = false;
        };

        $scope.$watch('updatedService', function(newValue) {
          var dirty = false;
          if (newValue.plans && $scope.version.plans && newValue.plans.length != $scope.version.plans.length) {
            dirty = true;
          } else if (newValue.plans && $scope.version.plans) {
            for (var i = 0; i < $scope.version.plans.length; i++) {
              var p1 = $scope.version.plans[i];

              for (var j = 0; j < newValue.plans.length; j++) {
                var p2 = newValue.plans[j];
                if(p1.planId === p2.planId) {
                  // Found Plan, if versions are not equal ==> dirty
                  if (p1.version !== p2.version) {
                    dirty = true;
                  }
                  break;
                }
              }
            }
          }
          $scope.isDirty = dirty;
        }, true);

        $scope.saveService = function() {
          console.log($scope.updatedService);
          ServiceVersion.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId}, $scope.updatedService, function (reply) {
            $state.forceReload();
          });
        };

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
