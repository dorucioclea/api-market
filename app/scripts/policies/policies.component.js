(function () {
    'use strict';

    angular.module('app.policies')
        .component('apiPolicyList', {
            templateUrl: 'views/ui/policies/component-policy-list.html',
            bindings: {
                policies: '<',
                editable: '<'
            },
            controller: function ($stateParams, service, toastService, _) {
                this.removePolicy = removePolicy;
                var controller = this;

                function removePolicy(policy) {
                    service.removePolicy($stateParams.orgId, $stateParams.svcId, $stateParams.versionId, policy.id).then(
                        function () {
                            toastService.info('' + policy.name + ' removed.');
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
            controller: function ($stateParams) {
                var ctrl = this;
                this.removePolicy = removePolicy;
                this.showDetails = showDetails;
                this.$onInit = function () {
                    this.imgUrl = 'images/policies/' + this.policy.policyDefinitionId.toLowerCase() + '.png';
                    switch (this.policy.policyDefinitionId) {
                        case 'OAuth2':
                            this.description = 'Service secured with OAuth2.0 authentication';
                            break;
                        case 'Analytics':
                            this.description = 'Analytics data is sent to Galileo';
                            break;
                        case 'RateLimiting':
                            this.description = 'Consumers can send a limited number of requests';
                            break;
                        case 'RequestTransformer':
                            this.description = 'Incoming requests are transformed';
                            break;
                        case 'ResponseTransformer':
                            this.description = 'Outgoing responses are transformed';
                            break;
                        case 'JWT':
                            this.description = 'Service secured with JWT authentication';
                            break;
                        case 'KeyAuthentication':
                            this.description = 'Service secured with Key authentication';
                            break;
                        case 'CORS':
                            this.description = 'Consumers can make requests from the browser';
                            break;
                        case 'IpRestriction':
                            this.description = 'Only certain IP addresses are allowed access to the service';
                            break;
                        case 'TCPLog':
                            this.description = 'Request and response logs are sent to a TCP server';
                            break;
                        case 'UDPLog':
                            this.description = 'Request and response logs are sent to a UDP server';
                            break;
                        case 'RequestSizeLimiting':
                            this.description = 'Incoming requests cannot exceed a certain size';
                            break;
                    }
                };

                function removePolicy() {
                    this.list.removePolicy(ctrl.policy);
                }

                function showDetails() {
                    console.log('show details');

                    $uibModal.open({
                        templateUrl: '/views/modals/policyView.html',
                        size: 'lg',
                        controller: 'PolicyDetailsCtrl as ctrl',
                        resolve: {
                            policy: function (ServiceVersionPolicy) {
                                return ServiceVersionPolicy.get({ orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId, policyId: ctrl.policy.id}).$promise.then(function(policyDetails) {
                                    ctrl.policy.details = policyDetails;
                                    return ctrl.policy;
                                })
                            }
                        }
                    });
                }
            }
        });

})();
