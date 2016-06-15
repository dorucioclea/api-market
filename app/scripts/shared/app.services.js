;(function(angular) {
    'use strict';

    angular.module('app.services', [])

        // ACTION SERVICE
        .service('actionService',
            function ($state, toastService, TOAST_TYPES, Action, ACTIONS, Application, Service) {

                this.createAction = function (entityVersion, type) {
                    var action = {};
                    switch (type) {
                        case ACTIONS.DEPRECATE:
                            action = {
                                type: ACTIONS.DEPRECATE,
                                organizationId: entityVersion.service.organization.id,
                                entityId: entityVersion.service.id,
                                entityVersion: entityVersion.version
                            };
                            return action;
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
                    return Action.save(action, function () {
                        if (shouldReload) {
                            $state.forceReload();
                        }
                        if (type && msg) {
                            toastService.createToast(type, msg, true);
                        }
                    }, function (error) {
                        if (!(error.status === 409)) toastService.createToast(TOAST_TYPES.DANGER, 'Oops! An error has occurred :(', true);
                    }).$promise;
                };

                this.publishService = function (serviceVersion, shouldReload) {
                    var msg = '<b>' + serviceVersion.service.name + ' ' + serviceVersion.version +
                        '</b> was successfully published!';
                    return doAction(this.createAction(serviceVersion, ACTIONS.PUBLISH),
                        shouldReload, TOAST_TYPES.SUCCESS, msg);
                };

                this.retireService = function (serviceVersion, shouldReload) {
                    var msg = '<b>' + serviceVersion.service.name + ' ' + serviceVersion.version + '</b> was retired.';
                    return doAction(this.createAction(serviceVersion, ACTIONS.RETIRE),
                        shouldReload, TOAST_TYPES.WARNING, msg);
                };

                this.deprecateService = function (serviceVersion, shouldReload) {
                    var msg = '<b>' + serviceVersion.service.name + ' ' + serviceVersion.version + '</b> was deprecated.';
                    return doAction(this.createAction(serviceVersion, ACTIONS.DEPRECATE),
                        shouldReload, TOAST_TYPES.INFO, msg);
                };

                this.lockPlan = function (planVersion, shouldReload) {
                    var msg = '<b>' + planVersion.plan.name + ' ' + planVersion.version +
                        '</b> was successfully locked!';
                    return doAction(this.createAction(planVersion, ACTIONS.LOCK),
                        shouldReload, TOAST_TYPES.SUCCESS, msg);
                };

                this.publishApp = function (applicationVersion, shouldReload) {
                    var msg = '<b>' + applicationVersion.application.name + ' ' + applicationVersion.version +
                        '</b> was successfully published!';
                    return doAction(this.createAction(
                        applicationVersion, ACTIONS.REGISTER),
                        shouldReload, TOAST_TYPES.SUCCESS,
                        msg);
                };

                this.retireApp = function (applicationVersion, shouldReload) {
                    var msg = '<b>' + applicationVersion.application.name + ' ' + applicationVersion.version +
                        '</b> was retired.';
                    return doAction(this.createAction(
                        applicationVersion, ACTIONS.UNREGISTER),
                        shouldReload,
                        TOAST_TYPES.WARNING, msg);
                };

                // DELETE METHODS == USE WITH CAUTION!

                this.deleteApp = function (organizationId, applicationId, applicationName) {
                    return Application.remove({orgId: organizationId, appId: applicationId}, function (success) {
                        toastService.createToast(TOAST_TYPES.INFO, 'Application <b>' + applicationName + '</b> deleted.', true);
                    }, function (fail) {
                        toastService.createErrorToast(fail, 'Could not delete application');
                    }).$promise;
                };

                this.deleteSvc = function (organizationId, serviceId, serviceName) {
                    return Service.remove({orgId: organizationId, svcId: serviceId}, function (success) {
                        toastService.createToast(TOAST_TYPES.INFO, 'Service <b>' + serviceName + '</b> deleted.', true);
                    }, function (fail) {
                        toastService.createErrorToast(fail, 'Could not delete service');
                    }).$promise;
                };
            })

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
                while (alerts.length > 0) {
                    closeAlert(0);
                }
            };

            var closeAlert = function (index) {
                alerts.splice(index, 1);
            };
        })

        // APPLICATION MANAGER
        .service('applicationManager',
            function ($uibModal, $q, oAuthService, toastService,
                      ApplicationContract, ApplicationVersion, ServiceVersion) {
                this.delete = deleteApp;
                this.publish = publish;
                this.retire = retire;
                this.oAuthConfig = oAuthConfig;

                function deleteApp(organizationId, appId, appName) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'views/modals/applicationDelete.html',
                        size: 'lg',
                        controller: 'DeleteApplicationCtrl as ctrl',
                        resolve: {
                            organizationId: function () {
                                return organizationId;
                            },
                            applicationId: function () {
                                return appId;
                            },
                            applicationName: function () {
                                return appName;
                            }
                        },
                        backdrop : 'static'
                    });

                    return modalInstance.result.then(function(result) {
                        return result;
                    });
                }

                function publish(organizationId, appId, versionId) {
                    return ApplicationVersion.get({orgId: organizationId, appId: appId, versionId: versionId},
                        function (appVersion) {
                            // Check if contracts are all still valid
                            ApplicationContract.query({orgId: organizationId, appId: appId, versionId: versionId},
                                function (contracts) {
                                    var canProceed = true;
                                    var promises = [];
                                    angular.forEach(contracts, function (contract) {
                                        promises.push(ServiceVersion.get({orgId: contract.serviceOrganizationId,
                                            svcId: contract.serviceId, versionId: contract.serviceVersion}, function (service) {
                                            if (service.status != 'Published') {
                                                canProceed = false;
                                                toastService.warning('<b>Invalid contract!</b><br>The contract with service <b>' +
                                                    service.service.name + ' - ' + service.version +
                                                    '</b> is no longer valid, please remove it and create a new one if necessary.')
                                            }
                                        }).$promise);
                                    });

                                    $q.all(promises).then(function (results) {
                                        if (canProceed) {
                                            // All contracts are valid, check if app needs OAuth callback
                                            oAuthService.needsCallback(organizationId,  appId, versionId).then(function (needsCallback) {
                                                if ( needsCallback &&
                                                    (appVersion.oauthClientRedirect === null || appVersion.oauthClientRedirect.length === 0)) {
                                                    toastService.warning('<b>No OAuth callback defined!</b><br>' +
                                                        'The application cannot be registered without an OAuth callback URL');
                                                } else {
                                                    $uibModal.open({
                                                        templateUrl: 'views/modals/applicationPublish.html',
                                                        size: 'lg',
                                                        controller: 'PublishApplicationCtrl as ctrl',
                                                        resolve: {
                                                            appVersion: function () {
                                                                return appVersion;
                                                            },
                                                            appContracts: function () {
                                                                return contracts;
                                                            }
                                                        },
                                                        backdrop : 'static'
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });
                        }, function (fail) {
                            toastService.createErrorToast(fail, 'Could not register application');
                        }).$promise;
                }

                function retire(organizationId, appId, versionId) {
                    return ApplicationVersion.get({orgId: organizationId, appId: appId, versionId: versionId}, function (appVersion) {
                        $uibModal.open({
                            templateUrl: 'views/modals/applicationRetire.html',
                            size: 'lg',
                            controller: 'RetireApplicationCtrl as ctrl',
                            resolve: {
                                appVersion: function () {
                                    return appVersion;
                                },
                                appContracts: function () {
                                    return ApplicationContract.query(
                                        {orgId: appVersion.application.organization.id, appId: appVersion.application.id,
                                            versionId: appVersion.version}).$promise;
                                }
                            },
                            backdrop : 'static'
                        });
                    }).$promise;
                }

                function oAuthConfig(organizationId, appId, versionId) {
                    return ApplicationVersion.get({orgId: organizationId, appId: appId, versionId: versionId}, function (appVersion) {
                        $uibModal.open({
                            templateUrl: 'views/modals/oauthConfigEdit.html',
                            size: 'lg',
                            controller: 'OAuthConfigCtrl as ctrl',
                            resolve: {
                                appVersionDetails: function () {
                                    return appVersion;
                                },
                                oAuthService: 'oAuthService',
                                needsCallback: function (oAuthService) {
                                    return oAuthService.needsCallback(organizationId, appId, versionId);
                                }
                            },
                            backdrop : 'static'
                        });
                    }).$promise;
                }
            })

        // IMAGE SERVICE
        .service('imageService', function (alertService, ALERT_TYPES) {

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
                if ($file.size > 100000) {
                    image.isValid = false;
                    alertService.addAlert(ALERT_TYPES.DANGER,
                        '<b>Maximum filesize exceeded!</b><br>Only filesizes of maximum 100KB are accepted.');
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

        })

        // TOAST SERVICE
        .service('toastService', function ($timeout, TOAST_TYPES) {
            var toasts = [];
            this.toasts = toasts;
            
            this.info = info;
            this.success = success;
            this.warning = warning;
            
            function info(msg) {
                createToast(TOAST_TYPES.INFO, msg, true);
            }
            
            function success(msg) {
                createToast(TOAST_TYPES.SUCCESS, msg, true);
            }
            
            function warning(msg) {
                createToast(TOAST_TYPES.WARNING, msg, true);
            }

            var closeToastAtIndex = function (index) {
                toasts.splice(index, 1);
            };

            this.closeToast = function(index) {
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

            this.success = function (msg) {
                this.createToast(TOAST_TYPES.SUCCESS, msg, true);
            };

            this.info = function (msg) {
                this.createToast(TOAST_TYPES.INFO, msg, true);
            };

            this.warning = function (msg) {
                this.createToast(TOAST_TYPES.WARNING, msg, true);
            };

            this.error = function (msg) {
                this.createToast(TOAST_TYPES.DANGER, msg, true);
            };

            this.createErrorToast = function(error, heading) {
                var toastType = TOAST_TYPES.DANGER;
                var errorMsg = '<b>' + heading + '</b><br>' + error.data.message;

                switch (error.status) {
                    case 404:
                        toastType = TOAST_TYPES.WARNING;
                        break;
                    case 409: //CONFLICT
                        toastType = TOAST_TYPES.WARNING;
                        break;
                    default:
                        break;
                }
                this.createToast(toastType, errorMsg, true);
            };

            var timedClose = function () {
                $timeout(function() {
                    closeToastAtIndex(0);
                }, 5000);
            };
        })

        // HEADER MODEL
        .service('headerModel', function ($rootScope) {
            this.showExplore = false;
            this.showDash = false;
            this.showSearch = false;

            this.setIsButtonVisible = function (explore, dash, search) {
                this.showExplore = explore;
                this.showDash = dash;
                this.showSearch = search;
                $rootScope.$broadcast('buttonToggle', 'toggled!');
            };
        })

        // ORGANIZATION SCREEN MODEL
        .service('orgScreenModel', function (Organization) {

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
        })

        // RESOURCE UTILITY SERVICE
        .service('resourceUtil', function () {
            this.cleanResponse = cleanResponse;

            // This function will remove the $promise and $resolved properties from a resource promise,
            // leaving us with a clean Javascript Object
            function cleanResponse(resolvedPromise) {
                return angular.fromJson(angular.toJson(resolvedPromise));
            }
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

        // FOLLOWER SERVICE
        .service('followerService',
            function ($state, currentUserModel, toastService, TOAST_TYPES,
                      ServiceFollowerAdd, ServiceFollowerRemove) {
                this.addFollower = addFollower;
                this.removeFollower = removeFollower;

                function addFollower(svcVersion) {
                    ServiceFollowerAdd.save({orgId: svcVersion.service.organization.id,
                            svcId: svcVersion.service.id,
                            userId: currentUserModel.currentUser.username},
                        {},
                        function (reply) {
                            $state.forceReload();
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'You are now following <b>' + svcVersion.service.name + '</b>.', true);
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not follow this service');
                        });
                }

                function removeFollower(svcVersion) {
                    ServiceFollowerRemove.save({orgId: svcVersion.service.organization.id,
                            svcId: svcVersion.service.id,
                            userId: currentUserModel.currentUser.username},
                        {},
                        function (reply) {
                            $state.forceReload();
                            toastService.createToast(TOAST_TYPES.WARNING,
                                'You are no longer following <b>' + svcVersion.service.name + '</b>.',
                                true);
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not unfollow this service');
                        });
                }
            })

        // OAUTH SERVICE
        .service('oAuthService',
            function ($http, $q, ApplicationOAuth, ApplicationContract,
                      OAuthConsumer, ServiceVersionPolicy) {

                this.grant = grant;
                this.getAppOAuthInfo = getAppOAuthInfo;
                this.createOAuthConsumer = createOAuthConsumer;
                this.needsCallback = needsCallback;

                function getAppOAuthInfo(clientId, orgId, svcId, versionId) {
                    return ApplicationOAuth.get({clientId: clientId,
                        orgId: orgId,
                        svcId: svcId,
                        versionId: versionId
                    }).$promise;
                }

                function createOAuthConsumer(clientId, clientSecret, userName) {
                    var consumer = {
                        appOAuthId: clientId,
                        appOAuthSecret: clientSecret,
                        uniqueUserName: userName
                    };
                    return OAuthConsumer.create(consumer, function (reply) {
                    }).$promise;
                }

                function constructGrantObject(clientId, clientSecret, responseType, scopeString, provisionKey, userId) {
                    return {
                        client_id: clientId,
                        client_secret: clientSecret,
                        response_type: responseType,
                        scope: scopeString,
                        provision_key: provisionKey,
                        authenticated_userid: userId
                    };
                }

                function constructScopeString(scopesToGrant) {
                    var keysToConcat = [];
                    angular.forEach(scopesToGrant, function (scope) {
                        if (scope.checked) {
                            keysToConcat.push(scope.scope);
                        }
                    });
                    return keysToConcat.join(' ');
                }

                function grant(grantUrl, clientId, clientSecret, responseType, scopes, provisionKey, userId) {
                    var scopesToGrant = constructScopeString(scopes);
                    var grantObject = constructGrantObject(clientId,
                        clientSecret, responseType, scopesToGrant, provisionKey, userId);
                    return postFormEncoded(grantUrl, grantObject);
                }

                function needsCallback(appOrgId, appId, appVersion) {
                    // Disable callback url not being required for Client Credentials grant,
                    // Now compulsory for all types of OAuth

                    return ApplicationContract.query({
                        orgId: appOrgId,
                        appId: appId,
                        versionId: appVersion}).$promise
                        .then(function (contracts) {
                            var promises = [];

                            angular.forEach(contracts, function (contract) {
                                promises.push(ServiceVersionPolicy.query({orgId: contract.serviceOrganizationId,
                                    svcId: contract.serviceId,
                                    versionId: contract.serviceVersion}).$promise);
                            });
                            return $q.all(promises).then(function (result) {
                                var needsCallback = false;
                                for (var i = 0; i < result.length; i++) {
                                    for (var j = 0; j < result[i].length; j++) {
                                        if (result[i][j].policyDefinitionId === 'OAuth2') {
                                            needsCallback = true;
                                            break;
                                        }
                                    }
                                }
                                return needsCallback;
                            });

                            // Old method preserved here for revert purposes
                            // =============================================

                            // var promises = [];
                            // // var secondaryPromises = [];
                            //
                            // angular.forEach(contracts, function (contract) {
                            //     promises.push(ServiceVersionPolicy.query({orgId: contract.serviceOrganizationId,
                            //         svcId: contract.serviceId,
                            //         versionId: contract.serviceVersion}, function (policies) {
                            //         angular.forEach(policies, function (policy) {
                            //             if (policy.policyDefinitionId === 'OAuth2') {
                            //                 secondaryPromises.push(ServiceVersionPolicy.get(
                            //                     {orgId: contract.serviceOrganizationId,
                            //                         svcId: contract.serviceId,
                            //                         versionId: contract.serviceVersion,
                            //                         policyId: policy.id}).$promise);
                            //             }
                            //         })
                            //     }).$promise);
                            // });
                            // return $q.all(promises).then(function (result) {
                            //     return $q.all(secondaryPromises).then(function (policyList) {
                            //         var needsCallback = false;
                            //         for (var i = 0; i < policyList.length; i++) {
                            //             var policyConfiguration = angular.fromJson(policyList[i].configuration);
                            //             if (policyConfiguration.enable_implicit_grant ||
                            //                 policyConfiguration.enable_authorization_code) {
                            //                 needsCallback = true;
                            //                 break;
                            //             }
                            //         }
                            //         return needsCallback;
                            //     });
                            // });
                        });
                }

                function postFormEncoded(url, data) {
                    return $http({
                        method: 'POST',
                        url: url,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param(data)
                    });
                }
            })

        // DOC DOWNLOADER
        .service('docDownloader', function (toastService, ServiceVersionDefinition, CONFIG, TOAST_TYPES) {

            this.fetch = fetch;
            this.fetchWithContract = fetchWithContract;
            this.fetchWithServiceVersion = fetchWithServiceVersion

            function fetch(orgId, svcId, versionId) {
                return ServiceVersionDefinition.get(
                    {orgId: orgId,
                        svcId: svcId,
                        versionId: versionId},
                    function (definitionSpec) {
                        toastService.createToast(TOAST_TYPES.INFO, '<b>Downloading...</b>', true);
                        definitionSpec.host = CONFIG.KONG.HOST;
                        var data = angular.toJson(definitionSpec, true);
                        var blob = new Blob([data], {type: 'text/json'}),
                            a = document.createElement('a');

                        a.download = svcId + '-' + versionId + '-swagger.json';
                        a.href = window.URL.createObjectURL(blob);
                        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                        a.click();
                    });
            }

            function fetchWithContract(contract) {
                fetch(contract.serviceOrganizationId, contract.serviceId, contract.serviceVersion);
            }

            function fetchWithServiceVersion(svcVersion) {
                fetch(svcVersion.service.organization.id, svcVersion.service.id, svcVersion.version);
            }
        })

        // LOGIN HELPER SERVICE
        .service('loginHelper', function ($http, $sessionStorage, $state, $location, CONFIG) {
            this.checkLoggedIn = checkLoggedIn;
            this.checkLoginRequiredForState = checkLoginRequiredForState;
            this.checkJWTInUrl = checkJWTInUrl;
            this.logout = logout;
            this.redirectToLogin = redirectToLogin;

            function checkLoggedIn() {
                return !!$sessionStorage.jwt;
            }

            function checkLoginRequiredForState(currentState) {
                console.log(currentState);
                switch (currentState.name) {
                    case '':
                    case 'error':
                    case 'oauth':
                    case 'logout':
                    case 'root.apis.grid':
                    case 'root.apis.list':
                    case 'root.search':
                        return false;
                    default:
                        return true;
                }
            }

            function checkJWTInUrl() {
                var jwt = $location.search().jwt;
                if (jwt && jwt.length > 0) {
                    $sessionStorage.jwt = jwt;
                    delete $sessionStorage.loginInProgress;
                    window.location.href = $sessionStorage.apimredurl;
                    delete $sessionStorage.apimredurl;
                    return true;
                } else {
                    return false;
                }
            }

            function logout() {
                currentUser.getInfo().then(function (info) {
                    var logOutObject = {
                        idpUrl: CONFIG.SECURITY.IDP_URL,
                        spName: CONFIG.SECURITY.SP_NAME,
                        username: info.username
                    };
                    LogOutRedirect.save({}, logOutObject, function (reply) {
                        console.log(reply);
                        var string = '';
                        angular.forEach(reply, function (value) {
                            if (typeof value === 'string') {
                                string += value;
                            }
                        });
                        console.log(string);
                        if (jwtHelper.isTokenExpired($sessionStorage.jwt)) {
                            $state.go('logout');
                        } else {
                            window.location.href = string;
                        }
                        delete $sessionStorage.jwt;
                        delete $sessionStorage.apimredurl;
                        delete $sessionStorage.loginInProgress;
                    });
                })

            }

            function redirectToLogin() {
                if (!$sessionStorage.loginInProgress) {
                    // WSO2 Fix -- WSO2 has race condition when multiple redirect requests are sent with same SAML
                    // Setting this boolean prevents additional requests from being sent
                    if (CONFIG.SECURITY.WSO2_LOGIN_FIX) {
                        $sessionStorage.loginInProgress = true;
                    }
                    if (!$sessionStorage.apimredurl) $sessionStorage.apimredurl = window.location.href;
                    var url = CONFIG.AUTH.URL + CONFIG.SECURITY.REDIRECT_URL;
                    var data = '{"idpUrl": "' + CONFIG.SECURITY.IDP_URL + '", "spUrl": "' +
                        CONFIG.SECURITY.SP_URL + '", "spName": "' + CONFIG.SECURITY.SP_NAME +
                        '", "clientAppRedirect": "' + $sessionStorage.apimredurl + '", "token": "' +
                        CONFIG.SECURITY.CLIENT_TOKEN + '"}';
                    
                    return $http({
                        method: 'POST',
                        skipAuthorization: true,
                        url: url,
                        data: data,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        responseType: 'text'
                    }).then(function (result) {
                        console.log("redirect result: "+JSON.stringify(result));
                        window.location.href = result.data;
                    }, function (error) {
                        $state.go('accessdenied');
                        console.log('Request failed with error code: ', error.status);
                        console.log(error);
                    });
                }
            }
        })

        // USER SCREEN MODEL
        .service('userScreenModel', function () {
            this.selectedTab = 'Profile';

            this.userInfo = {
                fullName: '',
                company: '',
                location: '',
                website: '',
                bio: ''
            };

            this.updateTab = function (newTab) {
                this.selectedTab = newTab;
            };
        });

})(window.angular);
