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
            controller: function ($stateParams, $uibModal, policyService, service, toastService, _) {
                this.disablePolicy = disablePolicy;
                this.editPolicy = editPolicy;
                this.enablePolicy = enablePolicy;
                this.removePolicy = removePolicy;
                var controller = this;
                console.log(controller.policies);

                function disablePolicy(policy) {
                    console.log('disable policy ', policy);
                }

                function editPolicy(policy) {
                    console.log('edit policy ', policy);
                    $uibModal.open({
                        templateUrl: '/views/modals/policyEdit.html',
                        size: 'lg',
                        controller: 'AddPolicyCtrl as ctrl',
                        backdrop: 'static'
                    });
                }

                function enablePolicy(policy) {
                    console.log('enable policy ', policy);
                }

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
                this.disablePolicy = disablePolicy;
                this.editPolicy = editPolicy;
                this.enablePolicy = enablePolicy;
                this.removePolicy = removePolicy;

                function disablePolicy() {
                    this.list.disablePolicy(ctrl.policy);
                }

                function editPolicy() {
                    this.list.editPolicy(ctrl.policy);
                }

                function enablePolicy() {
                    this.list.enablePolicy(ctrl.policy);
                }

                function removePolicy() {
                    this.list.removePolicy(ctrl.policy);
                }
            }
        });

})();
