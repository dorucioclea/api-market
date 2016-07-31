(function () {
    'use strict';

    angular.module('app.policies')
        .component('apiPolicyList', {
            templateUrl: 'views/ui/policies/component-policy-list.html',
            bindings: {
                policies: '<',
                editable: '<',
                type: '@'
            },
            controller: function ($stateParams, policyService, service, toastService, _) {
                this.removePolicy = removePolicy;
                var controller = this;

                function removePolicy(policy) {
                    switch (this.type) {
                        case 'plan':
                            policyService.deletePlanPolicy($stateParams.orgId, $stateParams.planId, $stateParams.versionId, policy.id).then(
                                function () {
                                    toastService.info('' + policy.name + ' removed.');
                                    _.remove(controller.policies, policy);
                                });
                            break;
                        case 'svc':
                            policyService.deleteServicePolicy($stateParams.orgId, $stateParams.svcId, $stateParams.versionId, policy.id).then(
                                function () {
                                    toastService.info('' + policy.name + ' removed.');
                                    _.remove(controller.policies, policy);
                                });
                            break;
                    }
                }
            }
        })
        .component('apiPolicy', {
            templateUrl: 'views/ui/policies/component-policy.html',
            require: {
                list: '^apiPolicyList'
            },
            bindings: {
                'policy': '<',
                'editMode': '<'
            },
            controller: function () {
                var ctrl = this;
                this.removePolicy = removePolicy;

                function removePolicy() {
                    this.list.removePolicy(ctrl.policy);
                }
            }
        });

})();
