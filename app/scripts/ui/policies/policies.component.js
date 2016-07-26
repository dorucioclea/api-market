(function () {
    'use strict';

    angular.module('app.ui.policies')
        .component('apiPolicyList', {
            templateUrl: 'views/ui/policies/component-policy-list.html',
            bindings: {
                policies: '<',
                editable: '<'
            },
            controller: function ($stateParams, service, _) {
                this.removePolicy = removePolicy;
                var controller = this;

                function removePolicy(policy) {
                    service.removePolicy($stateParams.orgId, $stateParams.svcId, $stateParams.versionId, policy.id).then(
                        function () {
                            _.remove(controller.policies, policy);
                        });
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
                this.removePolicy = removePolicy;
                this.$onInit = function () {
                    this.imgUrl = 'images/policies/' + this.policy.policyDefinitionId.toLowerCase() + '.png';
                };

                function removePolicy() {
                    this.list.removePolicy(this.policy);
                }
            }
        });

})();
