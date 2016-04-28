;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals.lifecycle', [])

        /// ==== NewApplication Controller
        .controller('NewApplicationCtrl',
            function ($scope, $modal, $state, flowFactory, alertService, imageService,
                      orgScreenModel, toastService, REGEX, TOAST_TYPES, Application) {

                $scope.currentOrg = orgScreenModel.organization;
                $scope.imageService = imageService;
                $scope.alerts = alertService.alerts;
                $scope.flow = flowFactory.create({
                    singleFile: true
                });
                $scope.readFile = readFile;
                $scope.regex = REGEX;
                $scope.closeAlert = closeAlert;
                $scope.createApplication = createApplication;
                $scope.modalClose = modalClose;
                init();

                function init() {
                    alertService.resetAllAlerts();
                }

                function readFile($file) {
                    if (imageService.checkFileType($file)) {
                        imageService.readFile($file);
                        return true;
                    } else {
                        return false;
                    }
                }

                function closeAlert(index) {
                    alertService.closeAlert(index);
                }

                function createApplication(application) {
                    var newAppObject = angular.copy(application);
                    newAppObject.name = application.name.trim();
                    newAppObject.initialVersion = 'v'.concat(application.initialVersion);
                    if (imageService.image.fileData) {
                        newAppObject.base64logo = imageService.image.fileData;
                    } else {
                        newAppObject.base64logo = '';
                    }
                    Application.save({orgId: $scope.currentOrg.id}, newAppObject, function (app) {
                        $scope.modalClose();
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Application <b>' + app.name +  '</b> created!', true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                        }
                        toastService.createErrorToast(error, 'Could not create application.');
                    });
                }

                function modalClose() {
                    imageService.clear();
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

        /// ==== PublishApplication Controller
        .controller('PublishApplicationCtrl',
            function ($scope, $rootScope, $state, $modal,
                      appVersion, appContracts, actionService) {

                $scope.selectedAppVersion = appVersion;
                $scope.contracts = appContracts;
                $scope.modalClose = modalClose;
                $scope.doPublish = doPublish;

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function doPublish() {
                    actionService.publishApp($scope.selectedAppVersion, true);
                    $scope.modalClose();
                }
            })

        /// ==== RetireApplication Controller
        .controller('RetireApplicationCtrl',
            function ($scope, $rootScope, $modal,
                      appVersion, appContracts, actionService) {

                $scope.applicationVersion = appVersion;
                $scope.contracts = appContracts;
                $scope.modalClose = modalClose;
                $scope.doRetire = doRetire;

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function doRetire() {
                    actionService.retireApp($scope.applicationVersion, true);
                    $scope.modalClose();
                }

            })

        /// ==== DeleteApplication Controller
        .controller('DeleteApplicationCtrl',
            function ($scope, $modalInstance, organizationId, applicationId, applicationName, actionService) {

                $scope.applicationName = applicationName;
                $scope.modalClose = modalClose;
                $scope.doDelete = doDelete;

                function modalClose() {
                    $modalInstance.dismiss("cancel");
                }

                function doDelete() {
                    actionService.deleteApp(organizationId, applicationId, applicationName).then(function (success) {
                        $modalInstance.close("success");
                    }, function (fail) {
                        $modalInstance.close("fail");
                    })
                }
            })

        /// ==== NewPlan Controller
        .controller('NewPlanCtrl',
            function ($scope, $modal, $state, $stateParams, orgScreenModel,
                      toastService, REGEX, TOAST_TYPES, Plan) {

                $scope.org = orgScreenModel.organization;
                $scope.createPlan = createPlan;
                $scope.regex = REGEX;
                $scope.modalClose = modalClose;

                function createPlan(plan) {
                    var newPlanObject = angular.copy(plan);
                    newPlanObject.name = plan.name.trim();
                    newPlanObject.initialVersion = 'v'.concat(plan.initialVersion);
                    Plan.save({orgId: $stateParams.orgId}, newPlanObject, function (newPlan) {
                        $scope.modalClose();
                        $state.go('root.plan',
                            {orgId: $stateParams.orgId, planId: newPlan.id, versionId: newPlanObject.initialVersion});
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Plan <b>' + newPlan.name + '</b> created!', true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                        }
                        toastService.createErrorToast(error, 'Could not create plan.');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

        /// ==== LockPlan Controller
        .controller('LockPlanCtrl',
            function ($scope, $modal,
                      planVersion, actionService) {

                $scope.planVersion = planVersion;
                $scope.modalClose = modalClose;
                $scope.doLock = doLock;

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function doLock() {
                    actionService.lockPlan($scope.planVersion, true);
                    $scope.modalClose();
                }

            })

        /// ==== NewService Controller
        .controller('NewServiceCtrl',
            function ($scope, $modal, $state, $stateParams, flowFactory, alertService,
                      imageService, orgScreenModel, toastService, REGEX, TOAST_TYPES, CONFIG, Categories, Service) {

                $scope.org = orgScreenModel.organization;
                $scope.configVars = CONFIG;
                $scope.imageService = imageService;
                $scope.alerts = alertService.alerts;
                $scope.flow = flowFactory.create({
                    singleFile: true
                });
                $scope.regex = REGEX;
                $scope.readFile = readFile;
                $scope.closeAlert = closeAlert;
                $scope.createService = createService;
                $scope.modalClose = modalClose;
                init();

                function init() {
                    alertService.resetAllAlerts();
                    Categories.query({}, function (reply) {
                        $scope.currentCategories = reply;
                    });
                }

                function readFile($file) {
                    if (imageService.checkFileType($file)) {
                        imageService.readFile($file);
                        return true;
                    } else {
                        return false;
                    }
                }

                function closeAlert(index) {
                    alertService.closeAlert(index);
                }

                function createService(svc, categories) {
                    var newSvcObject = angular.copy(svc);
                    newSvcObject.name = svc.name.trim();
                    newSvcObject.initialVersion = 'v'.concat(svc.initialVersion);
                    var cats = [];
                    for (var i = 0; i < categories.length; i++) {
                        cats.push(categories[i].text);
                    }
                    if (imageService.image.fileData) {
                        newSvcObject.base64logo = imageService.image.fileData;
                    } else {
                        newSvcObject.base64logo = '';
                    }
                    var basePathStart = '/';
                    newSvcObject.basepath = basePathStart.concat(svc.basepath);
                    newSvcObject.categories = cats;

                    Service.save({orgId: $stateParams.orgId}, newSvcObject, function (newSvc) {
                        $scope.modalClose();
                        $state.go('root.service.overview',
                            {orgId: $stateParams.orgId, svcId: newSvc.id, versionId: newSvcObject.initialVersion});
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Service <b>' + newSvc.name + '</b> created!', true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                        }
                        toastService.createErrorToast(error, 'Could not create service.');
                    });
                }

                function modalClose() {
                    imageService.clear();
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

        /// ==== DeprecateService Controller
        .controller('DeprecateServiceCtrl',
            function ($scope, $modal,
                      svcVersion, actionService) {

                $scope.serviceVersion = svcVersion;
                $scope.modalClose = modalClose;
                $scope.doDeprecate = doDeprecate;

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function doDeprecate() {
                    actionService.deprecateService($scope.serviceVersion, true);
                    $scope.modalClose();
                }

            })        
        
        /// ==== PublishService Controller
        .controller('PublishServiceCtrl',
            function ($scope, $modal,
                      svcVersion, actionService) {

                $scope.selectedSvcVersion = svcVersion;
                $scope.modalClose = modalClose;
                $scope.doPublish = doPublish;

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function doPublish() {
                    actionService.publishService($scope.selectedSvcVersion, true);
                    $scope.modalClose();
                }

            })

        /// ==== RetireService Controller
        .controller('RetireServiceCtrl',
            function ($scope, $modal,
                      svcVersion, actionService, toastService, TOAST_TYPES) {

                $scope.serviceVersion = svcVersion;
                $scope.modalClose = modalClose;
                $scope.doDeprecate = doDeprecate;
                $scope.doRetire = doRetire;

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function doDeprecate() {
                    actionService.deprecateService($scope.serviceVersion, true);
                    $scope.modalClose();
                }

                function doRetire() {
                    actionService.retireService($scope.serviceVersion, true).then(function () {
                        $scope.modalClose();
                    }, function (err) {
                        if (err.status === 409) { // BE returns 409 Conflict in case of existing contracts
                            toastService.createToast(TOAST_TYPES.WARNING, '<b>This service has existing contracts!</b>', true);
                            $scope.hasExistingContracts = true;
                        }
                    });
                }

            })

        /// ==== DeleteService Controller
        .controller('DeleteServiceCtrl',
            function ($scope, $modalInstance, organizationId, serviceId, serviceName, actionService) {

                $scope.serviceName = serviceName;
                $scope.modalClose = modalClose;
                $scope.doDelete = doDelete;

                function modalClose() {
                    $modalInstance.dismiss("cancel");
                }

                function doDelete() {
                    actionService.deleteSvc(organizationId, serviceId, serviceName).then(function (success) {
                        $modalInstance.close("success");
                    }, function (fail) {
                        $modalInstance.close("fail");
                    })
                }
            })

        /// ==== NewVersion Controller
        .controller('NewVersionCtrl',
            function ($scope, $state, $stateParams, appScreenModel, planScreenModel, svcScreenModel, toastService,
                      ApplicationVersion, PlanVersion, ServiceVersion, REGEX) {

                $scope.newVersion = '';
                $scope.shouldClone = true;
                $scope.createVersion = createVersion;
                $scope.modalClose = modalClose;
                $scope.regex = REGEX;

                var type = {};
                init();

                function init() {
                    if (angular.isUndefined($stateParams.appId) && angular.isUndefined($stateParams.svcId)) {
                        type = 'Plan';
                        $scope.currentVersion = planScreenModel.plan.version;
                    } else if (angular.isUndefined($stateParams.planId) && angular.isUndefined($stateParams.svcId)) {
                        type = 'Application';
                        $scope.currentVersion = appScreenModel.application.version;
                    } else {
                        type = 'Service';
                        $scope.currentVersion = svcScreenModel.service.version;
                    }
                }

                function createVersion() {
                    var newVersion = {
                        version: 'v'.concat($scope.newVersion),
                        clone: $scope.shouldClone,
                        cloneVersion: $scope.currentVersion
                    };

                    switch (type) {
                        case 'Application':
                            ApplicationVersion.save({orgId: $stateParams.orgId, appId: $stateParams.appId}, newVersion,
                                function (newAppVersion) {
                                    $scope.modalClose();
                                    $state.go('root.application.overview',
                                        {orgId: $stateParams.orgId,
                                            appId: newAppVersion.application.id,
                                            versionId: newAppVersion.version});
                                }, function (error) {
                                    handleError(error, 'application');
                                });
                            break;
                        case 'Plan':
                            PlanVersion.save(
                                {orgId: $stateParams.orgId, planId: $stateParams.planId}, newVersion,
                                function (newPlanVersion) {
                                    $scope.modalClose();
                                    $state.go('root.plan',
                                        {orgId: $stateParams.orgId,
                                            planId: newPlanVersion.plan.id,
                                            versionId: newPlanVersion.version});
                                }, function (error) {
                                    handleError(error, 'plan');
                                });
                            break;
                        case 'Service':
                            ServiceVersion.save(
                                {orgId: $stateParams.orgId, svcId: $stateParams.svcId}, newVersion,
                                function (newSvcVersion) {
                                    $scope.modalClose();
                                    $state.go('root.service.overview',
                                        {orgId: $stateParams.orgId,
                                            svcId: newSvcVersion.service.id,
                                            versionId: newSvcVersion.version});
                                }, function (error) {
                                    handleError(error, 'service');
                                });
                            break;
                    }
                }

                function handleError(error, type) {
                    if (error.status !== 409) {
                        $scope.modalClose();
                    }
                    toastService.createErrorToast(error, 'Could not create new ' + type + ' version.');
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

            })

        /// ==== NewOrganization Controller
        .controller('NewOrganizationCtrl',
            function ($scope, $modal, $state, publisherMode,
                      currentUserModel, toastService, CONFIG, REGEX, TOAST_TYPES, orgService, Organization) {

                $scope.createOrganization = createOrganization;
                $scope.modalClose = modalClose;
                $scope.regex = REGEX;
                $scope.useFriendlyNames = CONFIG.APP.ORG_FRIENDLY_NAME_ENABLED;

                // New organization defaults to Private
                $scope.organization = {
                    organizationPrivate: true
                };

                function createOrganization() {
                    $scope.organization.name = $scope.organization.name.trim();

                    if (!$scope.organization.friendlyName || $scope.organization.friendlyName.length === 0) {
                        $scope.organization.friendlyName = $scope.organization.name;
                    } else {
                        $scope.organization.friendlyName = $scope.organization.friendlyName.trim();
                    }
                    
                    Organization.save($scope.organization, function (newOrg) {
                        currentUserModel.updateCurrentUserInfo(currentUserModel);
                        $scope.modalClose();
                        if (publisherMode) {
                            $state.go('root.organization', {orgId: newOrg.id});
                        } else {
                            $state.go('root.market-dash', {orgId: newOrg.id});
                        }
                        toastService.createToast(
                            TOAST_TYPES.SUCCESS,
                            'Organization <b>' + newOrg.name + '</b> created!',
                            true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                            $state.go('root.myOrganizations');
                        }
                        toastService.createErrorToast(error, 'Could not create organization.');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            });

    // #end
})(window.angular);
