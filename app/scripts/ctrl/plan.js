;(function(angular) {
    'use strict';

    angular.module('app.ctrl.plan', [])

        /// ==== Plan Controller
        .controller('PlanCtrl',
            function ($scope, $uibModal, $state, $stateParams, orgData, orgScreenModel,
                      planData, planVersions, planScreenModel, actionService, toastService, TOAST_TYPES, Plan) {

                $scope.planVersion = planData;
                $scope.displayTab = planScreenModel;
                $scope.versions = planVersions;
                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.confirmLockPlan = confirmLockPlan;
                $scope.lockPlan = lockPlan;
                $scope.selectVersion = selectVersion;
                $scope.updateDesc = updateDesc;
                $scope.showInfoModal = showInfoModal;
                $scope.locked = $scope.planVersion.status === 'Locked';
                init();

                function init() {
                    orgScreenModel.updateOrganization(orgData);
                    planScreenModel.updatePlan(planData);
                }

                function lockPlan() {
                    actionService.lockPlan($scope.planVersion, true);
                }

                function selectVersion(version) {
                    $state.go($state.$current.name,
                        {orgId: $stateParams.orgId, planId: $stateParams.planId, versionId: version.version});
                }

                function updateDesc(newValue) {
                    Plan.update({orgId: $stateParams.orgId, planId: $stateParams.planId}, {description: newValue},
                        function (reply) {
                            toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not update plan\'s description.');
                        });
                }

                function confirmLockPlan() {
                    $uibModal.open({
                        templateUrl: 'views/modals/planLock.html',
                        size: 'lg',
                        controller: 'LockPlanCtrl as ctrl',
                        resolve: {
                            planVersion: function () {
                                return $scope.planVersion;
                            }
                        },
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }

                function showInfoModal() {
                    $uibModal.open({
                        templateUrl: 'views/modals/helpView.html',
                        size: 'lg',
                        controller: 'HelpCtrl as ctrl',
                        resolve: {
                            type: function () {
                                return 'plan';
                            }
                        },
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }
            })

        // +++ Plan Screen Subcontrollers +++
        /// ==== Activity Controller
        .controller('PlanActivityCtrl',
            function ($scope, activityData, planScreenModel) {
                $scope.activities = activityData.beans;
                planScreenModel.updateTab('Activity');

            })
        /// ==== Policies Controller
        .controller('PlanPoliciesCtrl',
            function ($scope, $uibModal, $stateParams, policyData, policyConfiguration,
                      planScreenModel, PlanVersionPolicy) {

                $scope.policies = policyData;
                $scope.policyDetails = policyConfiguration;
                planScreenModel.updateTab('Policies');
                $scope.removePolicy = removePolicy;
                $scope.modalAddPolicy = modalAddPolicy;

                function removePolicy(policy) {
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
                }

                function modalAddPolicy() {
                    $uibModal.open({
                        templateUrl: 'views/modals/policyAdd.html',
                        size: 'lg',
                        controller: 'AddPolicyCtrl as ctrl',
                        resolve: {
                            policyDefs: function (PolicyDefs) {
                                return PolicyDefs.query({}).$promise;
                            }
                        },
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                }
            });

    // #end
})(window.angular);
