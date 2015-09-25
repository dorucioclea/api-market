;(function(angular) {
    'use strict';

    angular.module('app.services', [])

      // ACTION SERVICE
    .service('actionService', ['$state', 'toastService', 'TOAST_TYPES', 'Action', 'ACTIONS',
        function ($state, toastService, TOAST_TYPES, Action, ACTIONS) {

            this.createAction = function (entityVersion, type) {
                var action = {};
                switch (type) {
                    case ACTIONS.LOCK:
                        action = {
                            type: ACTIONS.LOCK,
                            organizationId: entityVersion.plan.organization.id,
                            entityId: entityVersion.plan.id,
                            entityVersion: entityVersion.version
                        };
                        return action;
                    case ACTIONS.REGISTER:
                        action = {
                            type: ACTIONS.REGISTER,
                            entityVersion: entityVersion.version
                        };
                        if (angular.isDefined(entityVersion.organizationId)) {
                            action.organizationId = entityVersion.organizationId;
                            action.entityId = entityVersion.id;
                        } else {
                            action.organizationId = entityVersion.application.organization.id;
                            action.entityId = entityVersion.application.id;
                        }
                        return action;
                    case ACTIONS.UNREGISTER:
                        action = {
                            type: ACTIONS.UNREGISTER,
                            entityVersion: entityVersion.version
                        };
                        if (angular.isDefined(entityVersion.organizationId)) {
                            action.organizationId = entityVersion.organizationId;
                            action.entityId = entityVersion.id;
                        } else {
                            action.organizationId = entityVersion.application.organization.id;
                            action.entityId = entityVersion.application.id;
                        }
                        return action;
                    case ACTIONS.PUBLISH:
                        action = {
                            type: ACTIONS.PUBLISH,
                            organizationId: entityVersion.service.organization.id,
                            entityId: entityVersion.service.id,
                            entityVersion: entityVersion.version
                        };
                        return action;
                    case ACTIONS.RETIRE:
                        action = {
                            type: ACTIONS.RETIRE,
                            organizationId: entityVersion.service.organization.id,
                            entityId: entityVersion.service.id,
                            entityVersion: entityVersion.version
                        };
                        return action;
                }
            };

            var doAction = function (action, shouldReload, type, msg) {
                console.log('Performing Action: ');
                console.log(action);
                Action.save(action, function (reply) {
                    if (shouldReload) {
                        $state.forceReload();
                    }
                    if (type && msg) {
                        toastService.createToast(type, msg, true);
                    }
                }, function (error) {
                    toastService.createToast(TOAST_TYPES.DANGER, 'Oops! An error has occurred :(', true);
                });
            };

            this.publishService = function (serviceVersion, shouldReload) {
                var msg = '<b>' + serviceVersion.service.name + ' ' + serviceVersion.version +
                  '</b> was successfully published!';
                doAction(this.createAction(serviceVersion, ACTIONS.PUBLISH), shouldReload, TOAST_TYPES.SUCCESS, msg);
            };

            this.retireService = function (serviceVersion, shouldReload) {
                var msg = '<b>' + serviceVersion.service.name + ' ' + serviceVersion.version + '</b> was retired.';
                doAction(this.createAction(serviceVersion, ACTIONS.RETIRE), shouldReload, TOAST_TYPES.WARNING, msg);
            };

            this.lockPlan = function (planVersion, shouldReload) {
                var msg = '<b>' + planVersion.plan.name + ' ' + planVersion.version + '</b> was successfully locked!';
                doAction(this.createAction(planVersion, ACTIONS.LOCK), shouldReload, TOAST_TYPES.SUCCESS, msg);
            };

            this.publishApp = function (applicationVersion, shouldReload) {
                var msg = '<b>' + applicationVersion.application.name + ' ' + applicationVersion.version +
                  '</b> was successfully published!';
                doAction(this.createAction(
                    applicationVersion, ACTIONS.REGISTER),
                    shouldReload, TOAST_TYPES.SUCCESS,
                    msg);
            };

            this.retireApp = function (applicationVersion, shouldReload) {
                var msg = '<b>' + applicationVersion.application.name + ' ' + applicationVersion.version +
                  '</b> was retired.';
                doAction(this.createAction(
                  applicationVersion, ACTIONS.UNREGISTER),
                  shouldReload,
                  TOAST_TYPES.WARNING, msg);
            };
        }])

    // ALERT SERVICE
    .service('alertService', function () {

        var alerts = [];

        this.alerts = alerts;

        this.closeAlert = function (index) {
            closeAlert(index);
        };

        this.addAlert = function (type, msg) {
            var alert = {
                type: type,
                msg: msg
            };
            this.alerts.push(alert);
        };

        this.resetAllAlerts = function () {
            this.alerts.forEach(function (value) {
                closeAlert(0);
            });
        };

        var closeAlert = function (index) {
            alerts.splice(index, 1);
        };
    })

    // IMAGE SERVICE
    .service('imageService', ['alertService', 'ALERT_TYPES', function (alertService, ALERT_TYPES) {

        var image = {
            isValid: true,
            fileData: null
        };

        this.image = image;

        this.checkFileType = function ($file) {
            alertService.resetAllAlerts();
            var allowedExtensions = ['jpg', 'jpeg', 'gif', 'png'];
            var fileExt = $file.getExtension();
            if (allowedExtensions.indexOf(fileExt) === -1) {
                alertService.addAlert(ALERT_TYPES.DANGER,
                  '<b>Unsupported file type</b><br>Only JPG, GIF and PNG types are supported.');
                return false;
            } else {
                return true;
            }
        };

        this.readFile = function ($file) {
            if ($file.size > 10000) {
                image.isValid = false;
                alertService.addAlert(ALERT_TYPES.DANGER,
                  '<b>Maximum filesize exceeded!</b><br>Only filesizes of maximum 10KB are accepted.');
            } else {
                image.isValid = true;
                var reader = new FileReader();
                reader.onload = function(event) {
                    setImageData(event.target.result.substr(event.target.result.indexOf('base64') + 7));
                };
                reader.readAsDataURL($file.file);
            }
        };

        this.clear = function () {
            image.fileData = null;
            image.isValid = true;
        };

        var setImageData = function (data) {
            image.fileData = data;
        };

    }])

    // TOAST SERVICE
    .service('toastService', ['$timeout', 'TOAST_TYPES', function ($timeout, TOAST_TYPES) {
        var toasts = [];
        this.toasts = toasts;

        var closeToastAtIndex = function (index) {
            toasts.splice(index, 1);
        };

        this.closeAlert = function(index) {
            closeToastAtIndex(index);
        };

        this.createToast = function(type, msg, autoclose) {
            var toast = {
                type: type,
                msg: msg
            };
            this.toasts.push(toast);

            if (autoclose) {
                timedClose();
            }
        };

        this.createErrorToast = function(error, heading) {
            var toastType = TOAST_TYPES.DANGER;
            var errorMsg = '<b>' + heading + '</b>';

            switch (error.status) {
                case 409: //CONFLICT
                    toastType = TOAST_TYPES.WARNING;
                    errorMsg += '<br>This name is already in use!<br>Please try again with a different name.';
                    break;
                default:
                    errorMsg += '<br>An unexpected error has occurred.';
                    break;
            }
            this.createToast(toastType, errorMsg, true);
        };

        var timedClose = function () {
            $timeout(function() {
                closeToastAtIndex(0);
            }, 5000);
        };
    }])

    // HEADER MODEL
    .service('headerModel', function ($rootScope) {
        this.showExplore = false;
        this.showDash = false;

        this.setIsButtonVisible = function (explore, dash) {
            this.showExplore = explore;
            this.showDash = dash;
            $rootScope.$broadcast('buttonToggle', 'toggled!');
        };
    })

    // ORGANIZATION SCREEN MODEL
    .service('orgScreenModel', ['Organization', function (Organization) {

        this.selectedTab = 'Plans';
        this.organization = undefined;

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

        this.updateOrganization = function (org) {
            this.organization = org;
        };

        this.getOrgDataForId = function (orgScreenModel, id) {
            Organization.get({id: id}, function (reply) {
                orgScreenModel.updateOrganization(reply);
            });
        };
    }])

    // SERVICE DOCUMENTATION TAB HELPER
    .service('svcTab', function () {

        this.selectedTab = 'Documentation';

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

    })

    // SERVICE SCREEN MODEL
    .service('svcScreenModel', function () {
        this.selectedTab = 'Overview';
        this.service = {};
        this.tabStatus = {
            hasImplementation: false,
            hasDefinition: false
        };

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

        this.updateService = function (newSvc) {
            this.service = newSvc;
            this.tabStatus.hasImplementation = newSvc.endpoint !== null;
        };

        this.setHasImplementation = function (bool) {
            this.tabStatus.hasImplementation = bool;
        };

        this.setHasDefinition = function (bool) {
            this.tabStatus.hasDefinition = bool;
        };
    })

    // DASHBOARD SELECTED APP HELPER
    .service('selectedApp', function () {
        this.appVersion = null;

        this.updateApplication = function (newApp) {
            this.appVersion = newApp;
        };

        this.reset = function () {
            this.appVersion = undefined;
        };
    })

    // APPLICATION SCREEN MODEL
    .service('appScreenModel', function () {
        this.selectedTab = 'Overview';
        this.application = {};

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

        this.updateApplication = function (newApp) {
            this.application = newApp;
        };
    })

    // PLAN SCREEN MODEL
    .service('planScreenModel', function () {
        this.selectedTab = 'Overview';
        this.plan = {};

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

        this.updatePlan = function (plan) {
            this.plan = plan;
        };
    })

    // SERVICE DOC MODEL
    .service('svcModel', function () {

        var service = null;

        this.setService = function (serv) {
            service = serv;
        };

        this.getService = function () {
            return service;
        };

    })

    // DOCUMENTATION TESTING HELPER
    .service('docTester', function () {
        this.apikey = undefined;
        this.preferredContract = undefined;

        this.setApiKey = function (key) {
            this.apikey = key;
        };

        this.setPreferredContract = function (contract) {
            this.preferredContract = contract;
        };

        this.reset = function () {
            this.preferredContract = undefined;
        };
    })

    // POLICY CONFIG DETAILS
    .service('policyConfig', function () {
        this.createConfigObject = function (policyDetails) {
            var configObjects = [];
            angular.forEach(angular.fromJson(policyDetails.configuration), function (value, key) {
                var configObject = {
                    key: key,
                    value: value
                };
                configObjects.push(configObject);
            });
            return configObjects;
        };
    })

    // CURRENT USER MODEL
    .service('currentUserModel', ['orgScreenModel', 'CurrentUserInfo', function (orgScreenModel, CurrentUserInfo) {
        var permissionTree = [];
        this.currentUser = {};

        this.updateCurrentUserInfo = function (currentUserModel) {
            CurrentUserInfo.get({}, function (userInfo) {
                currentUserModel.currentUser = userInfo;
                createPermissionsTree(userInfo.permissions);
            });
        };

        this.setCurrentUserInfo = function (currentUserInfo) {
            this.currentUser = currentUserInfo;
            createPermissionsTree(currentUserInfo.permissions);
        };

        var createPermissionsTree = function (permissions) {
            angular.forEach(permissions, function (value) {
                if (!permissionTree[value.organizationId]) {
                    permissionTree[value.organizationId] = [];
                }
                permissionTree[value.organizationId].push(value.name);
            });
        };

        this.isAuthorizedFor = function(permission) {
            return permissionTree[orgScreenModel.organization.id].indexOf(permission) !== -1;
        };

        this.isAuthroizedForAny = function (permissions) {
            for (var i = 0; i < permissions.length; i++) {
                if (this.isAuthorizedFor(permissions[i])) {
                    return true;
                }
            }
            return false;
        };
    }])

    // USER SCREEN MODEL
    .service('userScreenModel', function () {
        this.selectedTab = 'Profile';

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };
    });

})(window.angular);
