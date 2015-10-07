;(function(angular) {
    'use strict';

    angular.module('app.ctrl.api', [])

        /// ==== Service Doc Main Controller
        .controller('ApiDocCtrl', ['$scope', '$state', '$stateParams', '$modal', 'svcData', 'svcModel', 'svcTab',
            'headerModel', 'toastService', 'followerService',
            function($scope, $state, $stateParams, $modal, svcData, svcModel, svcTab,
                     headerModel, toastService, followerService) {
                headerModel.setIsButtonVisible(true, true, true);
                svcModel.setService(svcData);
                $scope.serviceVersion = svcData;
                $scope.hasOAuth = svcData.provisionKey !== null && svcData.provisionKey.length > 0;
                $scope.displayTab = svcTab;
                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;

                $scope.modalAnim = 'default';

                $scope.modalNewTicketOpen = modalNewTicketOpen;
                $scope.modalSelectApplicationForContract = modalSelectApplicationForContract;
                $scope.modalClose = modalClose;
                $scope.openTicket = openTicket;
                $scope.hasTerms = hasTerms;
                $scope.userIsFollowing =
                    $scope.serviceVersion.service.followers.indexOf($scope.User.currentUser.username) > -1;
                $scope.followAction = followAction;

                function hasTerms() {
                    return $scope.serviceVersion.service.terms !== null &&
                        $scope.serviceVersion.service.terms.length > 0;
                }

                function modalNewTicketOpen() {
                    $modal.open({
                        templateUrl: 'views/modals/modalCreateTicket.html',
                        size: 'lg',
                        controller: 'ModalDemoCtrl',
                        resolve: function() {},
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                }

                function modalSelectApplicationForContract() {
                    $modal.open({
                        templateUrl: 'views/modals/modalSelectPlan.html',
                        size: 'lg',
                        controller: 'PlanSelectCtrl as ctrl',
                        resolve: function() {},
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function openTicket() {
                    $modal.open({
                        templateUrl: 'views/modals/modalViewTicket.html',
                        size: 'lg',
                        controller: 'ModalDemoCtrl',
                        resolve: function() {},
                        windowClass: $scope.modalAnim
                    });
                }

                function followAction() {
                    if ($scope.userIsFollowing) {
                        followerService.removeFollower($scope.serviceVersion);
                    } else {
                        followerService.addFollower($scope.serviceVersion);
                    }
                }
            }])

/// ==== Service Swagger Documentation Controller
        .controller('DocumentationCtrl', ['$scope', '$modal', '$stateParams', 'endpoint', 'svcContracts', 'userApps',
            'docTester', 'svcTab', 'ApplicationVersion', 'ServiceVersionDefinition', 'oAuthService',
            'toastService', 'TOAST_TYPES',
            function($scope, $modal, $stateParams, endpoint, svcContracts, userApps,
                     docTester, svcTab, ApplicationVersion, ServiceVersionDefinition, oAuthService,
                     toastService, TOAST_TYPES) {
                svcTab.updateTab('Documentation');
                $scope.endpoint = endpoint;
                $scope.contractApps = [];
                $scope.doGrant = doGrant;
                $scope.hasGrant = false;
                var currentDefinitionSpec;

                var filterApplications = function (apps, contracts) {
                    var match = function (app, contract) {
                        return (app.id === contract.appId && app.organizationId === contract.appOrganizationId);
                    };

                    for (var i = 0; i < contracts.length; i++) {
                        for (var j = 0; j < apps.length; j++) {
                            if (match(apps[j], contracts[i])) {
                                $scope.contractApps.push(contracts[i]);
                                break;
                            }
                        }
                    }
                };
                filterApplications(userApps, svcContracts);

                if ($scope.contractApps.length > 0) {
                    if (docTester.preferredContract) {
                        if ($scope.contractApps.indexOf(docTester.preferredContract > -1)) {
                            $scope.selectedContract = docTester.preferredContract;
                        } else {
                            $scope.selectedContract = $scope.contractApps[0];
                        }
                    } else {
                        $scope.selectedContract = $scope.contractApps[0];
                    }
                    docTester.setPreferredContract($scope.selectedContract);
                    docTester.setApiKey($scope.selectedContract.apikey);
                    updateOAuthInfo($scope.selectedContract);
                } else {
                    $scope.selectedContract = undefined;
                }

                $scope.selectContract = function (contract) {
                    $scope.selectedContract = contract;
                    if ($scope.hasOAuth) {
                        updateOAuthInfo(contract);
                    }
                    docTester.setApiKey(contract.apikey);
                    $scope.updateSwaggerHeader();
                };

                function updateOAuthInfo(contract) {
                    ApplicationVersion.get(
                        {orgId: contract.appOrganizationId,
                            appId: contract.appId,
                            versionId: contract.appVersion},
                        function (reply) {
                            $scope.appVersion = reply;
                        }
                    );
                }

                function doGrant() {
                    oAuthService.grant(
                        $scope.serviceVersion.service.organization.id,
                        $scope.serviceVersion.service.id,
                        $scope.serviceVersion.version,
                        $scope.appVersion.oAuthClientId,
                        $scope.appVersion.oauthClientSecret,
                        'token',
                        $scope.serviceVersion.oauthScopes,
                        $scope.serviceVersion.provisionKey,
                        $scope.User.currentUser.username
                    ).then(function (response) {
                            if (processUri(response.data.redirect_uri)) {
                                toastService.createToast(TOAST_TYPES.SUCCESS,
                                    '<b>Grant successful!</b><br>You can now use the try-out functionality.', true);
                                $scope.hasGrant = true;
                            } else {
                                toastService.createErrorToast(new Error('Could not process redirect URI'),
                                    'Could not complete grant process');
                            }
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not complete grant process');
                        });
                }

                function processUri(uri) {
                    var paramStart = uri.indexOf('access_token=');

                    if (paramStart > -1) {
                        var paramString = uri.substr(paramStart + 13);
                        $scope.addSwaggerTokenHeader('Bearer ' + paramString);
                        return true;
                    } else {
                        return false;
                    }
                }

                ServiceVersionDefinition.get(
                    {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId},
                    function (definitionSpec) {
                        currentDefinitionSpec = definitionSpec;
                        $scope.loadSwaggerUi(currentDefinitionSpec, 'swagger-ui-container',endpoint);
                    });
            }])

        /// ==== Service Plans Controller
        .controller('SvcPlanCtrl', ['$scope', '$stateParams', 'svcTab', 'svcPolicies', 'ServiceVersionPolicy',
            'planData', 'policyConfig', 'PlanVersionPolicy',
            function($scope, $stateParams, svcTab, svcPolicies, ServiceVersionPolicy,
                     planData, policyConfig, PlanVersionPolicy) {

                svcTab.updateTab('Plans');
                $scope.svcPolicies = svcPolicies;
                $scope.plans = planData;
                $scope.policies = [];
                $scope.policyConfiguration = [];

                angular.forEach($scope.svcPolicies, function (policy) {
                    getSvcPolicyDetails(policy);
                });

                angular.forEach($scope.plans, function (plan) {
                    getPlanPolicies(plan);
                });

                function getPolicyDetails(policy, plan) {
                    PlanVersionPolicy.get(
                        {orgId: $stateParams.orgId, planId: plan.planId, versionId: plan.version, policyId: policy.id},
                        function (policyDetails) {
                            $scope.policyConfiguration[policyDetails.id] =
                                policyConfig.createConfigObject(policyDetails);
                        });
                }

                function getPlanPolicies(plan) {
                    PlanVersionPolicy.query(
                        {orgId: $stateParams.orgId, planId: plan.planId, versionId: plan.version},
                        function (policies) {
                            $scope.policies[plan.planId] = policies;
                            angular.forEach(policies, function (policy) {
                                getPolicyDetails(policy, plan);
                            });
                        });
                }

                function getSvcPolicyDetails(policy) {
                    ServiceVersionPolicy.get(
                        {orgId: $stateParams.orgId,
                            svcId: $stateParams.svcId,
                            versionId: $stateParams.versionId,
                            policyId: policy.id},
                        function (policyDetails) {
                            $scope.policyConfiguration[policyDetails.id] =
                                policyConfig.createConfigObject(policyDetails);
                        });
                }

            }])

        /// ==== Service Announcements Controller
        .controller('AnnouncementCtrl', ['$scope', 'svcTab', 'announcements', 'Users',
            function($scope, svcTab, announcements, Users) {

                svcTab.updateTab('Announcements');
                $scope.announcements = announcements;
                $scope.selected = {
                    announcement: null,
                    user: null
                };

                if (announcements.length > 0) {
                    Users.get({userId: announcements[0].createdBy}, function (reply) {
                        $scope.selected = {
                            announcement: announcements[0],
                            user: reply
                        };
                    });
                }

                $scope.switchNotification = function(announcement) {
                    Users.get({userId: announcement.createdBy}, function (reply) {
                        $scope.selected.user = reply;
                        $scope.selected.announcement = announcement;
                    });
                };

            }])

        /// ==== Service Support Controller
        .controller('SupportCtrl', ['$scope', 'svcTab', function($scope, svcTab) {

            svcTab.updateTab('Support');

        }])

        /// ==== Service Terms Controller
        .controller('TermsCtrl', ['$scope', 'svcTab', function($scope, svcTab) {

            svcTab.updateTab('Terms');

        }]);

    // #end
})(window.angular);
