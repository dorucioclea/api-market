;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals.lifecycle', [])

    /// ==== NewApplication Controller
        .controller('NewApplicationCtrl',
            function ($scope, $uibModalInstance, $state, flowFactory, alertService, imageService,
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
                $scope.resetImage = resetImage;
                init();

                function init() {
                    alertService.resetAllAlerts();
                    $scope.imageService.clear();
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
                        $uibModalInstance.close(app);
                        imageService.clear();
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Application <b>' + app.name +  '</b> created!', true);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not create application.');
                    });
                }

                function modalClose() {
                    imageService.clear();
                    $uibModalInstance.dismiss('canceled');
                }

                function resetImage(flow) {
                    flow.cancel();
                    imageService.clear();
                    alertService.resetAllAlerts();
                }
            })

        /// ==== PublishApplication Controller
        .controller('PublishApplicationCtrl',
            function ($scope, $rootScope, $state, $uibModal,
                      appVersion, appContracts, actionService) {

                $scope.selectedAppVersion = appVersion;
                $scope.contracts = appContracts;
                $scope.modalClose = modalClose;
                $scope.doPublish = doPublish;

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }

                function doPublish() {
                    actionService.publishApp($scope.selectedAppVersion, true);
                    $scope.modalClose();
                }
            })

        /// ==== RetireApplication Controller
        .controller('RetireApplicationCtrl',
            function ($scope, $rootScope, $uibModal,
                      appVersion, appContracts, actionService) {

                $scope.applicationVersion = appVersion;
                $scope.contracts = appContracts;
                $scope.modalClose = modalClose;
                $scope.doRetire = doRetire;

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }

                function doRetire() {
                    actionService.retireApp($scope.applicationVersion, true);
                    $scope.modalClose();
                }

            })

        /// ==== DeleteApplication Controller
        .controller('DeleteApplicationCtrl',
            function ($scope, $uibModalInstance, organizationId, applicationId, applicationName, actionService) {

                $scope.applicationName = applicationName;
                $scope.modalClose = modalClose;
                $scope.doDelete = doDelete;

                function modalClose() {
                    $uibModalInstance.dismiss("cancel");
                }

                function doDelete() {
                    actionService.deleteApp(organizationId, applicationId, applicationName).then(function (success) {
                        $uibModalInstance.close("success");
                    }, function (fail) {
                        $uibModalInstance.close("fail");
                    })
                }
            })

        /// ==== DeleteServiceVersion Controller
        .controller('DeleteServiceVersionCtrl',
            function ($scope, $uibModalInstance, svcVersion, lastVersion, ServiceVersion) {

                $scope.serviceVersion = svcVersion;
                $scope.lastVersion = lastVersion;
                $scope.modalClose = modalClose;
                $scope.doDelete = doDelete;

                function modalClose() {
                    $uibModalInstance.dismiss('canceled');
                }

                function doDelete() {
                    ServiceVersion.delete({ orgId: svcVersion.service.organization.id,
                        svcId: svcVersion.service.id, versionId: svcVersion.version }).$promise.then(function () {
                        $uibModalInstance.close("success");
                    }, function (err) {
                        $uibModalInstance.close(err);
                    });
                }
            })

        /// ==== NewVersion Controller
        .controller('NewVersionCtrl',
            function ($scope, $state, $stateParams, appScreenModel, toastService,
                      ApplicationVersion, REGEX) {

                $scope.newVersion = '';
                $scope.shouldClone = true;
                $scope.createVersion = createVersion;
                $scope.modalClose = modalClose;
                $scope.regex = REGEX;

                let type = {};
                init();

                function init() {
                    type = 'Application';
                    $scope.currentVersion = appScreenModel.application.version;
                }

                function createVersion() {
                    let newVersion = {
                        version: 'v'.concat($scope.newVersion),
                        clone: $scope.shouldClone,
                        cloneVersion: $scope.currentVersion
                    };

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
                }

                function handleError(error, type) {
                    if (error.status !== 409) {
                        $scope.modalClose();
                    }
                    toastService.createErrorToast(error, 'Could not create new ' + type + ' version.');
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }

            })

        /// ==== NewOrganization Controller
        .controller('NewOrganizationCtrl',
            function ($scope, $uibModal, $state,
                      currentUserModel, toastService, CONFIG, REGEX, TOAST_TYPES, Organization) {

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

                    if ($scope.organization.friendlyName) {
                        $scope.organization.friendlyName = $scope.organization.friendlyName.trim();
                    }

                    Organization.save($scope.organization, function (newOrg) {
                        currentUserModel.refreshCurrentUserInfo(currentUserModel);
                        $scope.modalClose();
                        $state.go('root.market-dash', {orgId: newOrg.id});
                        toastService.createToast(
                            TOAST_TYPES.SUCCESS,
                            'Organization <b>' + newOrg.name + '</b> created!',
                            true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                            $state.go('root.market-dash');
                        }
                        toastService.createErrorToast(error, 'Could not create organization.');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            });

    // #end
})(window.angular);
