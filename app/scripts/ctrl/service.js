;(function(angular) {
  "use strict";


  angular.module("app.ctrl.service", [])


/// ==== Service Controller
    .controller("ServiceCtrl", ["$scope", "$state", "$stateParams", "svcData", "svcVersions", "svcScreenModel", "Action",
      function ($scope, $state, $stateParams, svcData, svcVersions, svcScreenModel, Action) {

        $scope.serviceVersion = svcData;
        svcScreenModel.updateService(svcData);
        $scope.displayTab = svcScreenModel;
        $scope.versions = svcVersions;
        $scope.isReady = $scope.serviceVersion.status === 'Ready';
        $scope.isPublished = $scope.serviceVersion.status === 'Published' || $scope.serviceVersion.status === 'Retired';
        $scope.isRetired = $scope.serviceVersion.status === 'Retired';


        $scope.selectVersion = function (version) {
          $state.go($state.$current.name, { orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: version.version});
        };


        $scope.publishService = function () {
          var publishAction = {
            type: 'publishService',
            organizationId: $stateParams.orgId,
            entityId: $stateParams.svcId,
            entityVersion: $stateParams.versionId
          };
          Action.save(publishAction, function (reply) {
            $state.forceReload();
          });
        };

        $scope.retireService = function () {
          var publishAction = {
            type: 'retireService',
            organizationId: $stateParams.orgId,
            entityId: $stateParams.svcId,
            entityVersion: $stateParams.versionId
          };
          Action.save(publishAction, function (reply) {
            $state.forceReload();
          });
        };

      }])

    // +++ Service Screen Subcontrollers +++
    /// ==== Activity Controller
    .controller("ServiceActivityCtrl", ["$scope", "activityData", "svcScreenModel", function ($scope, activityData, svcScreenModel) {

      $scope.activities = activityData.beans;
      svcScreenModel.updateTab('Activity');

    }])

    /// ==== Implementation Controller
    .controller("ServiceImplementationCtrl", ["$scope", "$state", "$stateParams", "ServiceVersion", "svcScreenModel",
      function ($scope, $state, $stateParams, ServiceVersion, svcScreenModel) {

        $scope.version = svcScreenModel.service;
        $scope.updatedService = {
          endpointType: 'rest',
          endpoint: $scope.version.endpoint,
          gateways: [{gatewayId: 'KongGateway'}]
        };

        $scope.typeOptions = ["rest", "soap"];
        svcScreenModel.updateTab('Implementation');

        $scope.selectType = function (newType) {
          $scope.updatedService.endpointType = newType;
        };

        var checkValid = function() {
          var valid = true;
          if (!$scope.updatedService.endpointType || angular.isUndefined($scope.updatedService.endpoint)) {
            valid = false;
          } else if ($scope.updatedService.endpoint === null || $scope.updatedService.endpoint.length === 0) {
            valid = false;
          }
          $scope.isValid = valid;
        };

        $scope.$watch('updatedService', function(newValue) {
          if ($scope.version) {
            var dirty = false;
            if (newValue.endpoint !== $scope.version.endpoint || newValue.endpointType !== $scope.version.endpointType) {
              dirty = true;
            }
            checkValid();
            $scope.isDirty = dirty;
          }
        }, true);

        $scope.reset = function() {
          $scope.updatedService.endpoint = $scope.version.endpoint;
          $scope.updatedService.endpointType = $scope.version.endpointType;
          $scope.isDirty = false;
        };

        $scope.saveService = function() {
          ServiceVersion.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId}, $scope.updatedService, function(reply) {
            $scope.isDirty = false;
            $state.forceReload();
          });
        };

      }])

    /// ==== Definition Controller
    .controller("ServiceDefinitionCtrl", ["$scope", "$state", "$stateParams", "ServiceVersionDefinition", "svcScreenModel",
      function ($scope, $state, $stateParams, ServiceVersionDefinition, svcScreenModel) {

        $scope.updatedDefinition = '';
        svcScreenModel.updateTab('Definition');
        $scope.definitionLoaded = false;
        $scope.noDefinition = false;

        ServiceVersionDefinition.get({orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId}, function (reply) {
          $scope.currentDefinition = reply;
          if (angular.isDefined($scope.currentDefinition)) {
            $scope.updatedDefinition = $scope.currentDefinition;
            $scope.loadSwaggerUi($scope.currentDefinition, "original-swagger-ui-container");
          }
        }, function (error) {
          $scope.noDefinition = true;
        });

        $scope.reset = function () {
          $scope.definitionLoaded = false;
          $scope.updatedDefinition = $scope.currentDefinition;
        };

        $scope.saveDefinition = function () {
          ServiceVersionDefinition.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId}, $scope.updatedDefinition, function (data) {
            $state.forceReload();
          });
        };

        $scope.$watch('updatedDefinition', function(def) {
          $scope.changed = (def !== $scope.currentDefinition);
          $scope.invalid = (def === $scope.currentDefinition);
        }, true);

        $scope.loadDefinition = function ($fileContent) {
          $scope.updatedDefinition = angular.fromJson($fileContent);
          $scope.loadPreview($scope.updatedDefinition);
        };

        $scope.loadPreview = function (spec) {
          $scope.definitionLoaded = true;
          $scope.loadSwaggerUi(spec, "swagger-ui-container");
        };
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
                  if (planVersion.status === "Locked") {
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
            }));
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
              if (lockedPlans[i].id === $scope.version.plans[j].planId) {
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
          if (newValue.plans && $scope.version.plans && newValue.plans.length !== $scope.version.plans.length) {
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
          ServiceVersion.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId}, $scope.updatedService, function (reply) {
            $state.forceReload();
          });
        };

      }])
    /// ==== Policies Controller
    .controller("ServicePoliciesCtrl", ["$scope", "$modal", "$stateParams", "policyData", "policyDetails", "svcScreenModel", "ServiceVersionPolicy",
      function ($scope, $modal, $stateParams, policyData, policyDetails, svcScreenModel, ServiceVersionPolicy) {

        $scope.policies = policyData;
        $scope.policyDetails = policyDetails;
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
})(window.angular);
