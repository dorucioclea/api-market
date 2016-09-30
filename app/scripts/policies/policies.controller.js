(function () {
    'use strict';

    angular.module('app.policies')
        .controller('EditPolicyCtrl', editPolicyCtrl);


    function editPolicyCtrl($scope, $state, $stateParams, policy, policyType, policyService, toastService, _) {
        $scope.modalClose = modalClose;
        $scope.updatePolicy = updatePolicy;

        init();

        function init() {
            $scope.policy = policy;
            $scope.type = policyType;
            $scope.schema = angular.fromJson(policy.details.definition.form);
            if (!_.isEmpty(policy.details.definition.formOverride)) {
                $scope.form = angular.fromJson(policy.details.definition.formOverride);
            }
            else {
                $scope.form = ['*'];
            }
            $scope.config = angular.fromJson(policy.details.configuration);
        }

        function modalClose() {
            $scope.$close();	// this method is associated with $uibModal scope which is this.
        }

        function updatePolicy(form) {
            $scope.$broadcast('schemaFormValidate');

            if (form.$valid) {
                console.log('valid');
                switch ($scope.type) {
                    case 'plan':
                        policyService.updatePlanPolicy($stateParams.orgId,
                            $stateParams.planId,
                            $stateParams.versionId,
                            $scope.policy.id,
                            angular.toJson($scope.config),
                            $scope.policy.details.enabled).then(function () {
                            $scope.modalClose();
                            $state.forceReload();
                            toastService.success('Policy updated.');
                        }, function (err) {
                            handleError(err);
                        });
                        break;
                    case 'svc':
                        policyService.updateServicePolicy($stateParams.orgId,
                            $stateParams.svcId,
                            $stateParams.versionId,
                            $scope.policy.id,
                            angular.toJson($scope.config),
                            $scope.policy.details.enabled).then(function () {
                            $scope.modalClose();
                            $state.forceReload();
                            toastService.success('Policy updated.');
                        }, function (err) {
                            handleError(err);
                        });
                        break;
                }
            }
        }

        function handleError(error) {
            if (error.status === 404) {
                switch (error.data.errorCode) {
                    case 10003:
                        console.log('invalid config');
                        toastService.warning('<b>Invalid Policy Configuration Detected!</b><br><span class="small">' + error.data.message + '</span>');
                        break;
                }
            } else {
                toastService.createErrorToast(error, 'Could not update the policy.');
            }
        }

    }

})();
