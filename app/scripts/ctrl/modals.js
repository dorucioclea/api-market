;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals', [])

        /// ==== AddPolicy Controller
        .controller('AddPolicyCtrl', ['$scope', '$modal', '$state', '$stateParams', 'policyDefs',
            'toastService', 'TOAST_TYPES', 'PlanVersionPolicy', 'ServiceVersionPolicy',
            function ($scope, $modal, $state, $stateParams, policyDefs,
                      toastService, TOAST_TYPES, PlanVersionPolicy, ServiceVersionPolicy) {

                $scope.policyDefs = policyDefs;
                $scope.valid = false;
                $scope.selectedPolicy = null;

                switch ($state.current.data.type) {
                    case 'plan':
                        PlanVersionPolicy.query(
                            {orgId: $stateParams.orgId,
                                planId: $stateParams.planId,
                                versionId: $stateParams.versionId},
                            function (reply) {
                                removeUsedPolicies(reply);
                            });
                        break;
                    case 'service':
                        ServiceVersionPolicy.query(
                            {orgId: $stateParams.orgId,
                                svcId: $stateParams.svcId,
                                versionId: $stateParams.versionId},
                            function(reply) {
                                removeUsedPolicies(reply);
                            });
                        break;
                }

                var removeUsedPolicies = function (usedPolicies) {
                    angular.forEach(usedPolicies, function (policy) {
                        for (var i = 0; i < $scope.policyDefs.length; i++) {
                            if ($scope.policyDefs[i].id === policy.policyDefinitionId) {
                                $scope.policyDefs.splice(i, 1);
                                break;
                            }
                        }
                    });
                };

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

                $scope.setValid = function (isValid) {
                    $scope.valid = isValid;
                };

                $scope.setConfig = function(config) {
                    $scope.config = config;
                };
                $scope.getConfig = function() {
                    return $scope.config;
                };

                $scope.addPolicy = function() {
                    var config = $scope.getConfig();
                    var newPolicy = {
                        definitionId: $scope.selectedPolicy.id,
                        configuration: angular.toJson(config)
                    };

                    switch ($state.current.data.type) {
                        case 'plan':
                            PlanVersionPolicy.save(
                                {orgId: $stateParams.orgId,
                                    planId: $stateParams.planId, versionId: $stateParams.versionId},
                                newPolicy,
                                function(reply) {
                                    $scope.modalClose();
                                    $state.forceReload();
                                    toastService.createToast(TOAST_TYPES.SUCCESS,
                                        'Plan policy successfully added.', true);
                                }, function (error) {
                                    $scope.modalClose();
                                    toastService.createErrorToast(error, 'Could not create the plan policy.');
                                });
                            break;
                        case 'service':
                            ServiceVersionPolicy.save(
                                {orgId: $stateParams.orgId,
                                    svcId: $stateParams.svcId, versionId: $stateParams.versionId},
                                newPolicy,
                                function(reply) {
                                    $scope.modalClose();
                                    $state.forceReload();
                                    toastService.createToast(TOAST_TYPES.SUCCESS,
                                        'Service policy successfully added.', true);
                                }, function (error) {
                                    $scope.modalClose();
                                    toastService.createErrorToast(error, 'Could not create the service policy.');
                                });
                            break;
                    }

                };

                $scope.selectPolicy = function (policy) {
                    if (!policy) {
                        $scope.include = undefined;
                    } else {
                        $scope.selectedPolicy = policy;
                        $scope.config = {};
                        if ($scope.selectedPolicy.formType === 'JsonSchema') {
                            //All plugins should fall into this category!
                            $scope.include = 'views/modals/partials/policy/json-schema.html';
                        } else {
                            $scope.include = 'views/modals/partials/policy/Default.html';
                        }
                    }
                };

            }])

/// ==== NewAnnouncement Controller
        .controller('NewAnnouncementCtrl', ['$scope', '$modal', '$state', 'svcVersion', 'ServiceAnnouncements',
            'toastService', 'TOAST_TYPES',
            function ($scope, $modal, $state, svcVersion, ServiceAnnouncements,
                      toastService, TOAST_TYPES) {

                $scope.serviceVersion = svcVersion;
                $scope.announcement = {
                    title: '',
                    description: ''
                };
                $scope.createAnnouncement = createAnnouncement;

                function createAnnouncement(announcement) {
                    console.log(announcement);
                    ServiceAnnouncements.save({
                            orgId: $scope.serviceVersion.service.organization.id,
                            svcId: $scope.serviceVersion.service.id},
                        announcement,
                        function (newAnnouncement) {
                            $scope.modalClose();
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Announcement <b>' + newAnnouncement.title + '</b> created!', true);
                            $state.forceReload();
                        }, function (error) {
                            if (error.status !== 409) {
                                $scope.modalClose();
                            }
                            toastService.createErrorToast(error, 'Could not create announcement.');
                        });
                }

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }])

        /// ==== ViewAnnouncement Controller
        .controller('ViewAnnouncementCtrl', ['$scope', '$modal', '$state', 'announcement', 'ServiceAnnouncements',
            'toastService', 'TOAST_TYPES',
            function ($scope, $modal, $state, announcement, ServiceAnnouncements,
                      toastService, TOAST_TYPES) {

                $scope.announcement = announcement;
                $scope.deleteAnnouncement = deleteAnnouncement;

                function deleteAnnouncement() {
                    console.log('delete');
                    console.log(announcement);
                    ServiceAnnouncements.remove({orgId: $scope.announcement.organizationId,
                        svcId: $scope.announcement.serviceId, announcementId: $scope.announcement.id},
                        function (reply) {
                            $scope.modalClose();
                            var msg = '<b>Announcement deleted!</b>';
                            toastService.createToast(TOAST_TYPES.INFO, msg, true);
                            $state.forceReload();
                        });
                }

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }])

/// ==== Contract creation: Plan Selection Controller
        .controller('PlanSelectCtrl',
        ['$scope', '$modal', '$state', '$stateParams', '$timeout', 'selectedApp', 'orgScreenModel',
            'policyConfig', 'toastService', 'TOAST_TYPES', 'Application', 'ApplicationContract', 'ApplicationVersion',
            'CurrentUserAppOrgs', 'PlanVersion', 'PlanVersionPolicy', 'ServiceVersionPolicy',
            'serviceVersion', 'svcPolicies',
            function ($scope, $modal, $state, $stateParams, $timeout, selectedApp, orgScreenModel,
                      policyConfig, toastService, TOAST_TYPES, Application, ApplicationContract, ApplicationVersion,
                      CurrentUserAppOrgs, PlanVersion, PlanVersionPolicy, ServiceVersionPolicy,
                      serviceVersion, svcPolicies) {

                $scope.service = serviceVersion;
                $scope.orgScreenModel = orgScreenModel;
                $scope.servicePolicies = svcPolicies;
                getServicePolicyDetails(svcPolicies);
                var hasAppContext = false;
                if (angular.isDefined(selectedApp.appVersion) && selectedApp.appVersion !== null) {
                    $scope.selectedAppVersion = selectedApp.appVersion;
                    hasAppContext = true;
                }
                $scope.availablePlans = [];
                $scope.policyConfig = [];
                var noPlanSelected = true;

                var checkOrgContext = function () {
                    if (orgScreenModel.organization === undefined) {
                        // No org context, get user's AppOrgs
                        $scope.hasOrgContext = false;
                        CurrentUserAppOrgs.query({}, function (reply) {
                            $scope.appOrgs = reply;
                        });
                    } else {
                        $scope.hasOrgContext = true;
                        $scope.org = orgScreenModel.organization;
                    }
                };

                var getOrgApps = function (orgId) {
                    Application.query({orgId: orgId}, function (data) {
                        $scope.applications = data;
                        if (hasAppContext) {
                            getAppVersions($scope.selectedAppVersion.id);
                        } else {
                            getAppVersions(data[0].id);
                        }
                    });
                };

                var getAppVersions = function (appId) {
                    if (hasAppContext) {
                        appId = $scope.selectedAppVersion.id;
                    }
                    ApplicationVersion.query({orgId: $scope.org.id, appId: appId}, function (data) {
                        $scope.versions = data;
                        if (!hasAppContext) {
                            $scope.selectedAppVersion = data[0];
                            selectedApp.updateApplication(data[0]);
                        }
                    });
                };

                var getAvailablePlans = function () {
                    angular.forEach($scope.service.plans, function (value) {
                        PlanVersion.get(
                            {orgId: $scope.service.service.organization.id,
                                planId: value.planId, versionId: value.version},
                            function (planVersion) {
                                $scope.availablePlans.push(planVersion);
                                if (noPlanSelected) {
                                    $scope.selectedPlan = planVersion;
                                    getPlanPolicies();
                                    noPlanSelected = false;
                                }
                            });
                    });
                };

                var getPlanPolicies = function () {
                    PlanVersionPolicy.query(
                        {orgId: $scope.selectedPlan.plan.organization.id,
                            planId: $scope.selectedPlan.plan.id,
                            versionId: $scope.selectedPlan.version},
                        function (policies) {
                            $scope.selectedPlanPolicies = policies;
                            angular.forEach(policies, function (policy) {
                                getPlanPolicyDetails(policy);
                            });
                        });
                };

                var getPlanPolicyDetails = function (policy) {
                    PlanVersionPolicy.get(
                        {orgId: $scope.selectedPlan.plan.organization.id,
                            planId: $scope.selectedPlan.plan.id,
                            versionId: $scope.selectedPlan.version,
                            policyId: policy.id},
                        function (deets) {
                            $scope.policyConfig[deets.id] = policyConfig.createConfigObject(deets);
                        });
                };

                function getServicePolicyDetails(policies) {
                    angular.forEach(policies, function (policy) {
                        ServiceVersionPolicy.get({orgId: $scope.service.service.organization.id,
                                svcId: $scope.service.service.id,
                                versionId: $scope.service.version,
                                policyId: policy.id},
                            function (deets) {
                                $scope.policyConfig[deets.id] = policyConfig.createConfigObject(deets);
                            }
                        );
                    });
                }

                $scope.selectOrg = function (organization) {
                    orgScreenModel.getOrgDataForId(orgScreenModel, organization.id);
                    $scope.org = organization;
                    $scope.hasOrgContext = true;
                    getOrgApps(organization.id);
                };

                $scope.selectApp = function (application) {
                    $scope.selectedAppVersion = application;
                    getAppVersions(application.id);
                };

                $scope.selectPlan = function (plan) {
                    $scope.selectedPlan = plan;
                    getPlanPolicies();
                };

                $scope.selectVersion = function (version) {
                    $scope.selectedAppVersion = version;
                    selectedApp.updateApplication(version);
                };

                checkOrgContext();
                if ($scope.hasOrgContext) {
                    getOrgApps(orgScreenModel.organization.id);
                }
                getAvailablePlans();

                $scope.startCreateContract = function() {
                    var contract = {
                        serviceOrgId: $scope.service.service.organization.id,
                        serviceId: $scope.service.service.id,
                        serviceVersion: $scope.service.version,
                        planId: $scope.selectedPlan.plan.id
                    };
                    ApplicationContract.save(
                        {orgId: $scope.selectedAppVersion.organizationId,
                            appId: $scope.selectedAppVersion.id,
                            versionId: $scope.selectedAppVersion.version},
                        contract,
                        function (data) {
                            $state.go('root.market-dash', {orgId: $scope.selectedAppVersion.organizationId});
                            $scope.modalClose();
                            var msg = '<b>Contract created!</b><br>' +
                                'A contract was created between application <b>' +
                                $scope.selectedAppVersion.name + ' ' +
                                $scope.selectedAppVersion.version + '</b> and service <b>' +
                                $scope.service.service.organization.name + ' ' + $scope.service.service.name + ' ' +
                                $scope.service.version + '</b>, using plan <b>' +
                                $scope.selectedPlan.plan.name + ' ' + $scope.selectedPlan.version + '</b>.';
                            toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
                        }, function (error) {
                            $state.go('root.market-dash', {orgId: $scope.selectedAppVersion.organizationId});
                            $scope.modalClose();
                            toastService.createErrorToast(error, 'Could not create the contract.');
                        });
                };

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }])

/// ==== Help Dialog Controller
        .controller('HelpCtrl', ['$scope', '$modal', 'type',
            function ($scope, $modal, type) {
                $scope.type = type;

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };
            }])

/// ==== OAuthConfig Controller
        .controller('OAuthConfigCtrl', ['$scope', '$rootScope', '$modal', '$state', 'appVersionDetails',
            'ApplicationOAuthCallback', 'toastService', 'TOAST_TYPES',
            function ($scope, $rootScope, $modal, $state, appVersionDetails,
                      ApplicationOAuthCallback, toastService, TOAST_TYPES) {

                $scope.callback = appVersionDetails.oauthClientRedirect;
                $scope.id = appVersionDetails.oAuthClientId;
                $scope.secret = appVersionDetails.oauthClientSecret;
                $scope.updateCallback = updateCallback;

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

                $scope.copyId = function (id) {
                    var type = TOAST_TYPES.INFO;
                    var msg = '<b>Client Id copied to clipboard!</b><br>' + id;
                    toastService.createToast(type, msg, true);
                };
                $scope.copySecret = function (secret) {
                    var type = TOAST_TYPES.INFO;
                    var msg = '<b>Client Secret copied to clipboard!</b><br>' + secret;
                    toastService.createToast(type, msg, true);
                };

                function updateCallback(url) {
                    var updateObject = {
                        uri: url
                    };

                    ApplicationOAuthCallback.save(
                        {orgId: appVersionDetails.application.organization.id,
                            appId: appVersionDetails.application.id,
                            versionId: appVersionDetails.version},
                        updateObject,
                        function (reply) {
                            $scope.modalClose();
                            $state.forceReload();
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Callback URL for <b>' + appVersionDetails.application.name +  '</b> updated!',
                                true);
                        }, function (error) {
                            if (error.status !== 409) {
                                $scope.modalClose();
                            }
                            toastService.createErrorToast(error, 'Could not update the callback URL.');
                        }
                    );
                }

            }])

/// ==== EditImgCtrl Controller
        .controller('EditImgCtrl', ['$scope', '$modal', '$state', '$stateParams', 'flowFactory', 'alertService',
            'imageService', 'toastService', 'TOAST_TYPES', 'appScreenModel', 'currentUserModel', 'svcScreenModel',
            'Application', 'CurrentUserInfo', 'Service',
            function ($scope, $modal, $state, $stateParams, flowFactory, alertService,
                      imageService, toastService, TOAST_TYPES, appScreenModel, currentUserModel, svcScreenModel,
                      Application, CurrentUserInfo, Service) {
                var type = {};

                if (angular.isUndefined($stateParams.appId) && angular.isUndefined($stateParams.svcId)) {
                    type = 'User';
                    $scope.currentLogo = currentUserModel.currentUser.base64pic;
                } else if (angular.isUndefined($stateParams.planId) && angular.isUndefined($stateParams.svcId)) {
                    type = 'Application';
                    $scope.currentLogo = appScreenModel.application.application.base64logo;
                } else {
                    type = 'Service';
                    $scope.currentLogo = svcScreenModel.service.service.base64logo;
                }
                alertService.resetAllAlerts();
                $scope.imageService = imageService;
                $scope.alerts = alertService.alerts;
                $scope.flow = flowFactory.create({
                    singleFile: true
                });

                $scope.cancel = function () {
                    imageService.clear();
                    $scope.flow.cancel();
                };

                $scope.readFile = function ($file) {
                    if (imageService.checkFileType($file)) {
                        imageService.readFile($file);
                        return true;
                    } else {
                        return false;
                    }
                };

                $scope.closeAlert = function(index) {
                    alertService.closeAlert(index);
                };

                $scope.updateLogo = function () {
                    var updateObject = {};
                    if (type === 'User') {
                        if (imageService.image.fileData) {
                            updateObject.pic = imageService.image.fileData;
                        } else {
                            updateObject.pic = '';
                        }
                    } else {
                        if (imageService.image.fileData) {
                            updateObject.base64logo = imageService.image.fileData;
                        } else {
                            updateObject.base64logo = '';
                        }
                    }

                    switch (type) {
                        case 'Application':
                            Application.update({orgId: $stateParams.orgId, appId: $stateParams.appId},
                                updateObject,
                                function (reply) {
                                    handleResult(true, 'Application logo updated!');
                                }, function (error) {
                                    handleResult(false, 'Could not update Application Logo.', error);
                                });
                            break;
                        case 'Service':
                            Service.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId},
                                updateObject,
                                function (reply) {
                                    handleResult(true, 'Service logo updated!');
                                }, function (error) {
                                    handleResult(false, 'Could not update Service Logo.', error);
                                });
                            break;
                        case 'User':
                            CurrentUserInfo.update({},
                                updateObject,
                                function (reply) {
                                    handleResult(true, 'Profile pictured saved!');
                                }, function (error) {
                                    handleResult(false, 'Could not update Profile Picture.', error);
                                });
                            break;
                    }
                };

                var handleResult = function (success, msg, error) {
                    $scope.modalClose();
                    if (success) {
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
                    } else {
                        toastService.createErrorToast(error, msg);
                    }
                };

                $scope.modalClose = function() {
                    imageService.clear();
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }]);

    // #end
})(window.angular);
