;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals.lifecycle', [])

/// ==== NewApplication Controller
        .controller('NewApplicationCtrl', ['$scope', '$modal', '$state', 'flowFactory', 'alertService', 'imageService',
            'orgScreenModel', 'toastService', 'TOAST_TYPES', 'Application',
            function ($scope, $modal, $state, flowFactory, alertService, imageService,
                      orgScreenModel, toastService, TOAST_TYPES, Application) {

                alertService.resetAllAlerts();
                $scope.currentOrg = orgScreenModel.organization;
                $scope.imageService = imageService;
                $scope.alerts = alertService.alerts;
                $scope.flow = flowFactory.create({
                    singleFile: true
                });

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

                $scope.createApplication = function (application) {
                    if (imageService.image.fileData) {
                        application.base64logo = imageService.image.fileData;
                    } else {
                        application.base64logo = '';
                    }
                    Application.save({orgId: $scope.currentOrg.id}, application, function (app) {
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
                };

                $scope.modalClose = function() {
                    imageService.clear();
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }])

/// ==== PublishApplication Controller
        .controller('PublishApplicationCtrl', ['$scope', '$rootScope', '$state', '$modal',
            'appVersion', 'appContracts', 'actionService',
            function ($scope, $rootScope, $state, $modal,
                      appVersion, appContracts, actionService) {

                $scope.selectedAppVersion = appVersion;
                $scope.contracts = appContracts;

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

                $scope.doPublish = function () {
                    actionService.publishApp($scope.selectedAppVersion, true);
                    $scope.modalClose();
                };

            }])

/// ==== RetireApplication Controller
        .controller('RetireApplicationCtrl', ['$scope', '$rootScope', '$modal',
            'appVersion', 'appContracts', 'actionService',
            function ($scope, $rootScope, $modal,
                      appVersion, appContracts, actionService) {

                $scope.applicationVersion = appVersion;
                $scope.contracts = appContracts;

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

                $scope.doRetire = function () {
                    actionService.retireApp($scope.applicationVersion, true);
                    $scope.modalClose();
                };

            }])

/// ==== NewPlan Controller
        .controller('NewPlanCtrl', ['$scope', '$modal', '$state', '$stateParams', 'orgScreenModel',
            'toastService', 'TOAST_TYPES', 'Plan',
            function ($scope, $modal, $state, $stateParams, orgScreenModel,
                      toastService, TOAST_TYPES, Plan) {

                $scope.org = orgScreenModel.organization;

                $scope.createPlan = function (plan) {
                    Plan.save({orgId: $stateParams.orgId}, plan, function (newPlan) {
                        $scope.modalClose();
                        $state.go('root.plan.overview',
                            {orgId: $stateParams.orgId, planId: newPlan.id, versionId: plan.initialVersion});
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Plan <b>' + newPlan.name + '</b> created!', true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                        }
                        toastService.createErrorToast(error, 'Could not create plan.');
                    });
                };

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }])

/// ==== LockPlan Controller
        //TODO Implement

/// ==== NewService Controller
        .controller('NewServiceCtrl', ['$scope', '$modal', '$state', '$stateParams', 'flowFactory', 'alertService',
            'imageService', 'orgScreenModel', 'toastService', 'TOAST_TYPES', 'Categories', 'Service',
            function ($scope, $modal, $state, $stateParams, flowFactory, alertService,
                      imageService, orgScreenModel, toastService, TOAST_TYPES, Categories, Service) {

                alertService.resetAllAlerts();
                Categories.query({}, function (reply) {
                    $scope.currentCategories = reply;
                });
                $scope.org = orgScreenModel.organization;
                $scope.imageService = imageService;
                $scope.alerts = alertService.alerts;
                $scope.flow = flowFactory.create({
                    singleFile: true
                });
                $scope.basePathPattern = /^[[a-z\-]+$/;

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

                $scope.createService = function (svc, categories) {
                    var cats = [];
                    for (var i = 0; i < categories.length; i++) {
                        cats.push(categories[i].text);
                    }
                    if (imageService.image.fileData) {
                        svc.base64logo = imageService.image.fileData;
                    } else {
                        svc.base64logo = '';
                    }
                    var basePathStart = '/';
                    svc.basepath = basePathStart.concat(svc.basepath);
                    svc.categories = cats;

                    Service.save({orgId: $stateParams.orgId}, svc, function (newSvc) {
                        $scope.modalClose();
                        $state.go('root.service.overview',
                            {orgId: $stateParams.orgId, svcId: newSvc.id, versionId: svc.initialVersion});
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Service <b>' + newSvc.name + '</b> created!', true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                        }
                        toastService.createErrorToast(error, 'Could not create service.');
                    });
                };

                $scope.modalClose = function() {
                    imageService.clear();
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }])

/// ==== PublishService Controller
        .controller('PublishServiceCtrl', ['$scope', '$modal',
            'svcVersion', 'actionService',
            function ($scope, $modal,
                      svcVersion, actionService) {

                $scope.selectedSvcVersion = svcVersion;

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

                $scope.doPublish = function () {
                    actionService.publishService($scope.selectedSvcVersion, true);
                    $scope.modalClose();
                };

            }])

/// ==== RetireService Controller
        .controller('RetireServiceCtrl', ['$scope', '$modal',
            'svcVersion', 'actionService',
            function ($scope, $modal,
                      svcVersion, actionService) {

                console.log(svcVersion);

                $scope.serviceVersion = svcVersion;

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

                $scope.doRetire = function () {
                    actionService.retireService($scope.serviceVersion, true);
                    $scope.modalClose();
                };

            }])

/// ==== NewVersion Controller
        .controller('NewVersionCtrl',
        ['$scope', '$state', '$stateParams', 'appScreenModel', 'planScreenModel', 'svcScreenModel', 'toastService',
            'ApplicationVersion', 'PlanVersion', 'ServiceVersion',
            function ($scope, $state, $stateParams, appScreenModel, planScreenModel, svcScreenModel, toastService,
                      ApplicationVersion, PlanVersion, ServiceVersion) {
                var type = {};

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

                $scope.newVersion = '';
                $scope.shouldClone = true;

                $scope.createVersion = function () {
                    var newVersion = {
                        version: $scope.newVersion,
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
                                    $state.go('root.plan.overview',
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
                };

                var handleError = function (error, type) {
                    if (error.status !== 409) {
                        $scope.modalClose();
                    }
                    toastService.createErrorToast(error, 'Could not create new ' + type + ' version.');
                };

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }])

/// ==== NewOrganization Controller
        .controller('NewOrganizationCtrl', ['$scope', '$modal', '$state', 'publisherMode',
            'currentUserModel', 'toastService', 'TOAST_TYPES', 'Organization',
            function ($scope, $modal, $state, publisherMode,
                      currentUserModel, toastService, TOAST_TYPES, Organization) {

                $scope.createOrganization = function (org) {
                    Organization.save(org, function (newOrg) {
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
                };

                $scope.modalClose = function() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                };

            }]);

    // #end
})(window.angular);
