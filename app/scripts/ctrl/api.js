;(function(angular) {
    'use strict';

    angular.module('app.ctrl.api', [])

        /// ==== Service Doc Main Controller
        .controller('ApiDocCtrl', function($scope, $state, $stateParams, $modal, svcData, svcModel, svcTab,
                                           headerModel, toastService, followerService, support) {
            headerModel.setIsButtonVisible(true, true, true);
            svcModel.setService(svcData);
            $scope.serviceVersion = svcData;
            $scope.hasOAuth = svcData.provisionKey !== null && svcData.provisionKey.length > 0;
            $scope.displayTab = svcTab;
            $scope.toasts = toastService.toasts;
            $scope.toastService = toastService;
            $scope.support = support;
            $scope.modalAnim = 'default';
            $scope.modalSelectApplicationForContract = modalSelectApplicationForContract;
            $scope.modalClose = modalClose;
            $scope.hasTerms = hasTerms;
            $scope.userIsFollowing =
                $scope.serviceVersion.service.followers.indexOf($scope.User.currentUser.username) > -1;
            $scope.followAction = followAction;

            function hasTerms() {
                return $scope.serviceVersion.service.terms !== null &&
                    $scope.serviceVersion.service.terms.length > 0;
            }

            function modalSelectApplicationForContract() {
                $modal.open({
                    templateUrl: 'views/modals/planSelect.html',
                    size: 'lg',
                    controller: 'PlanSelectCtrl as ctrl',
                    resolve: {
                        serviceVersion: $scope.serviceVersion,
                        ServiceVersionPolicy: 'ServiceVersionPolicy',
                        svcPolicies: function (ServiceVersionPolicy) {
                            return ServiceVersionPolicy.query(
                                {orgId: $scope.serviceVersion.service.organization.id,
                                    svcId: $scope.serviceVersion.service.id,
                                    versionId: $scope.serviceVersion.version}).$promise;
                        }
                    },
                    backdrop : 'static',
                    windowClass: $scope.modalAnim	// Animation Class put here.
                });

            }

            function modalClose() {
                $scope.$close();	// this method is associated with $modal scope which is this.
            }

            function followAction() {
                if ($scope.userIsFollowing) {
                    followerService.removeFollower($scope.serviceVersion);
                } else {
                    followerService.addFollower($scope.serviceVersion);
                }
            }
        })

/// ==== Service Swagger Documentation Controller
        .controller('DocumentationCtrl',
        function($scope, $modal, $stateParams, endpoint, svcContracts, oAuthPolicy, jwtEnabled, userApps,
                 docTester, docDownloader, svcTab, ApplicationVersion, ServiceVersionDefinition,
                 oAuthService, toastService, TOAST_TYPES) {
            $scope.addHeader = addHeader;
            $scope.oAuthConfig = angular.fromJson(oAuthPolicy.configuration);
            $scope.endpoint = endpoint;
            $scope.docDownloader = docDownloader;
            $scope.copy = copy;
            $scope.contractApps = [];
            $scope.canGrant = canGrant;
            $scope.customHeaders = [];
            $scope.doGrant = doGrant;
            $scope.hasGrant = false;
            $scope.selectedScopes = [];
            $scope.selectContract = selectContract;
            $scope.updateHeaders = updateHeaders;
            var currentDefinitionSpec;

            init();

            function init() {
                svcTab.updateTab('Documentation');

                // Initially all requested scopes will be selected
                angular.forEach($scope.serviceVersion.oauthScopes, function (value, key) {
                    $scope.selectedScopes.push({scope: key, desc: value, checked: true});
                });

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

                ServiceVersionDefinition.get(
                    {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId},
                    function (definitionSpec) {
                        currentDefinitionSpec = definitionSpec;
                        $scope.loadSwaggerUi(currentDefinitionSpec, 'swagger-ui-container', endpoint);
                        if (jwtEnabled) {
                            $scope.addJWTHeader();
                        }
                    });
            }

            function addHeader() {
                $scope.customHeaders.push({name: '', value: ''});
            }

            function copy(field) {
                toastService.createToast(TOAST_TYPES.INFO, '<b>' + field + '</b> copied to clipboard!', true);
            }

            function filterApplications(apps, contracts) {
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
            }

            function selectContract(contract) {
                $scope.selectedContract = contract;
                if ($scope.hasOAuth) {
                    updateOAuthInfo(contract);
                }
                docTester.setApiKey(contract.apikey);
                $scope.updateSwaggerApiKeyHeader();
            }

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

            function canGrant() {
                var canDoGrant = false;
                angular.forEach($scope.selectedScopes, function (value) {
                    if (value.checked) {
                        canDoGrant = true;
                    }
                });
                return canDoGrant;
            }

            function doGrant() {
                oAuthService.grant(
                    $scope.endpoint.oauth2AuthorizeEndpoint,
                    $scope.appVersion.oAuthClientId,
                    $scope.appVersion.oauthClientSecret,
                    'token',
                    $scope.selectedScopes,
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
                    var headerObj = {
                        name: 'Authorization',
                        value: 'Bearer ' + paramString
                    };
                    $scope.addCustomSwaggerHeader(headerObj);
                    return true;
                } else {
                    return false;
                }
            }

            function updateHeaders() {
                var didSet = false;
                var hasInvalid = false;
                angular.forEach($scope.customHeaders, function (header) {
                    if (header.name.length > 0 && header.value.length > 0) {
                        $scope.addCustomSwaggerHeader(header);
                        didSet = true;
                    } else {
                        hasInvalid = true;
                    }
                });

                if (didSet && !hasInvalid) {
                    toastService.createToast(TOAST_TYPES.INFO,
                        '<b>Headers set!</b>', true);
                } else if (didSet && hasInvalid) {
                    toastService.createToast(TOAST_TYPES.WARNING,
                        '<b>Could not set all headers.</b>' +
                        '<br>One or more headers had an invalid configuration and were not set', true);
                } else {
                    toastService.createToast(TOAST_TYPES.WARNING,
                        '<b>No headers were set.</b>' +
                        '<br>Could not find a valid header configuration', true);
                }
            }
        })

        /// ==== Service Plans Controller
        .controller('SvcPlanCtrl', function($scope, $stateParams, svcTab, svcPolicies, ServiceVersionPolicy,
                                            planData, policyConfig, PlanVersionPolicy) {
            $scope.svcPolicies = svcPolicies;
            $scope.plans = planData;
            $scope.policies = [];
            $scope.policyConfiguration = [];

            init();

            function init() {
                svcTab.updateTab('Plans');

                angular.forEach($scope.svcPolicies, function (policy) {
                    getSvcPolicyDetails(policy);
                });
                angular.forEach($scope.plans, function (plan) {
                    getPlanPolicies(plan);
                });
            }

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

        })

        /// ==== Service Announcements Controller
        .controller('AnnouncementCtrl', function($scope, svcTab, announcements, Users) {

            $scope.announcements = announcements;
            $scope.selected = {
                announcement: null,
                user: null
            };
            $scope.switchNotification = switchNotification;

            init();

            function init() {
                svcTab.updateTab('Announcements');
                if (announcements.length > 0) {
                    Users.get({userId: announcements[0].createdBy}, function (reply) {
                        $scope.selected = {
                            announcement: announcements[0],
                            user: reply
                        };
                    });
                }
            }

            function switchNotification(announcement) {
                Users.get({userId: announcement.createdBy}, function (reply) {
                    $scope.selected.user = reply;
                    $scope.selected.announcement = announcement;
                });
            }

        })

        /// ==== Service Support Controller
        .controller('SupportCtrl', function($scope, svcTab) {

            svcTab.updateTab('Support');

        })

        /// ==== Service Terms Controller
        .controller('TermsCtrl', function($scope, svcTab) {

            svcTab.updateTab('Terms');

        });

    // #end
})(window.angular);
