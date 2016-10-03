(function () {
    'use strict';

    angular.module('app.branding')
        .component('apiBrandingAdmin', {
            templateUrl: 'views/ui/policies/component-policy-list.html',
            bindings: {
                policies: '<',
                editable: '<',
                type: '@'
            },
            controller: function ($stateParams, $uibModal, policyService, service, toastService, _) {
                this.disablePolicy = disablePolicy;
                this.editPolicy = editPolicy;
                this.enablePolicy = enablePolicy;
                this.removePolicy = removePolicy;
                var controller = this;

                function disablePolicy(policy) {
                    switch (this.type) {
                        case 'plan':
                            return policyService.updatePlanPolicy($stateParams.orgId,
                                $stateParams.planId,
                                $stateParams.versionId,
                                policy.id,
                                policy.details.configuration, false)
                                .then(function () {
                                    toastService.info('' + policy.name + ' disabled.');
                                });
                        case 'svc':
                            return policyService.updateServicePolicy($stateParams.orgId,
                                $stateParams.svcId,
                                $stateParams.versionId,
                                policy.id,
                                policy.details.configuration, false)
                                .then(function () {
                                    toastService.info('' + policy.name + ' disabled.');
                                });
                    }
                }

                function editPolicy(policy) {
                    $uibModal.open({
                        templateUrl: '/views/modals/policyEdit.html',
                        size: 'lg',
                        controller: 'EditPolicyCtrl as ctrl',
                        resolve: {
                            policy: policy,
                            policyType: function() {
                                return controller.type;
                            }
                        },
                        backdrop: 'static'
                    });
                }

                function enablePolicy(policy) {
                    switch (this.type) {
                        case 'plan':
                            return policyService.updatePlanPolicy($stateParams.orgId,
                                $stateParams.planId,
                                $stateParams.versionId,
                                policy.id,
                                policy.details.configuration, true)
                                .then(function () {
                                    toastService.info('' + policy.name + ' enabled.');
                                });
                        case 'svc':
                            return policyService.updateServicePolicy($stateParams.orgId,
                                $stateParams.svcId,
                                $stateParams.versionId,
                                policy.id,
                                policy.details.configuration, true)
                                .then(function () {
                                    toastService.info('' + policy.name + ' enabled.');
                                });
                    }
                }

                function removePolicy(policy) {
                    switch (this.type) {
                        case 'plan':
                            policyService.deletePlanPolicy($stateParams.orgId, $stateParams.planId, $stateParams.versionId, policy.id).then(
                                function () {
                                    toastService.warning('' + policy.name + ' removed.');
                                    _.remove(controller.policies, policy);
                                });
                            break;
                        case 'svc':
                            policyService.deleteServicePolicy($stateParams.orgId, $stateParams.svcId, $stateParams.versionId, policy.id).then(
                                function () {
                                    toastService.warning('' + policy.name + ' removed.');
                                    _.remove(controller.policies, policy);
                                });
                            break;
                    }
                }
            }
        });

})();
