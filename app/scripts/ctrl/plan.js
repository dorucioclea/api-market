;(function(angular) {
    'use strict';

    angular.module('app.ctrl.plan', [])

        /// ==== Plan Controller
        .controller('PlanCtrl', ['$scope', '$modal', '$state', '$stateParams', 'orgData', 'orgScreenModel',
            'planData', 'planVersions', 'planScreenModel', 'actionService', 'toastService', 'TOAST_TYPES', 'Plan',
            function ($scope, $modal, $state, $stateParams, orgData, orgScreenModel,
                      planData, planVersions, planScreenModel, actionService, toastService, TOAST_TYPES, Plan) {

                orgScreenModel.updateOrganization(orgData);
                $scope.planVersion = planData;
                planScreenModel.updatePlan(planData);
                $scope.displayTab = planScreenModel;
                $scope.versions = planVersions;
                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.confirmLockPlan = confirmLockPlan;

                $scope.locked = $scope.planVersion.status === 'Locked';

                $scope.lockPlan = function () {
                    actionService.lockPlan($scope.planVersion, true);
                };

                $scope.selectVersion = function (version) {
                    $state.go($state.$current.name,
                        {orgId: $stateParams.orgId, planId: $stateParams.planId, versionId: version.version});
                };

                $scope.updateDesc = function (newValue) {
                    Plan.update({orgId: $stateParams.orgId, planId: $stateParams.planId}, {description: newValue},
                        function (reply) {
                            toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not update plan\'s description.');
                        });
                };

                function confirmLockPlan() {
                    $modal.open({
                        templateUrl: 'views/modals/modalLockPlan.html',
                        size: 'lg',
                        controller: 'LockPlanCtrl as ctrl',
                        resolve: {
                            planVersion: function () {
                                return $scope.planVersion;
                            }
                        },
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }

            }])

        // +++ Plan Screen Subcontrollers +++
        /// ==== Activity Controller
        .controller('PlanActivityCtrl', ['$scope', 'activityData', 'planScreenModel',
            function ($scope, activityData, planScreenModel) {
                $scope.activities = activityData.beans;
                planScreenModel.updateTab('Activity');

            }])
        /// ==== Policies Controller
        .controller('PlanPoliciesCtrl', ['$scope', '$modal', '$stateParams', 'policyData', 'policyConfiguration',
            'planScreenModel', 'PlanVersionPolicy',
            function ($scope, $modal, $stateParams, policyData, policyConfiguration,
                      planScreenModel, PlanVersionPolicy) {

                $scope.policies = policyData;
                $scope.policyDetails = policyConfiguration;
                planScreenModel.updateTab('Policies');

                $scope.removePolicy = function(policy) {
                    PlanVersionPolicy.delete(
                        {orgId: $stateParams.orgId,
                            planId: $stateParams.planId,
                            versionId: $stateParams.versionId,
                            policyId: policy.id},
                        function (data) {
                            angular.forEach($scope.policies, function(p, index) {
                                if (policy === p) {
                                    $scope.policies.splice(index, 1);
                                }
                            });
                        });
                };

                $scope.modalAnim = 'default';

                $scope.modalAddPolicy = function() {
                    $modal.open({
                        templateUrl: 'views/modals/modalAddPlanPolicy.html',
                        size: 'lg',
                        controller: 'AddPolicyCtrl as ctrl',
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
        .controller('PlanOverviewCtrl', ['$scope', 'planScreenModel', function ($scope, planScreenModel) {

            planScreenModel.updateTab('Overview');

        }]);

    // #end
})(window.angular);
