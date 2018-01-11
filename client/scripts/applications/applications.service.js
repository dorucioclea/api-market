(function () {
    'use strict';

    angular.module('app.applications')
        .service('applicationManager', applicationManager)
        .service('appService', appService);

    function applicationManager($uibModal, $q, oAuthService, toastService, ApplicationApiKeyReissue, ApplicationOAuthReissue,
                                ApplicationContract, ApplicationVersion, ServiceVersion, appService) {
        this.delete = deleteApp;
        this.deleteVersion = deleteVersion;
        this.publish = publish;
        this.retire = retire;
        this.reissueApiKey = reissueApiKey;
        this.reissueOAuth = reissueOAuth;
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

        function deleteVersion(organizationId, appId, appName, appVersion) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/applicationVersionDelete.html',
                size: 'lg',
                controller: 'DeleteApplicationVersionCtrl as ctrl',
                resolve: {
                    applicationName: function () {
                        return appName;
                    },
                    applicationVersion: function () {
                        return appVersion
                    },
                    lastVersion: function () {
                        return appService.getAppVersions(organizationId, appId).then(function (versions) {
                            return versions.length === 1;
                        })
                    }
                },
                backdrop : 'static'
            });
            modalInstance.result.then(function() {
                deferred.resolve(ApplicationVersion.delete({ orgId: organizationId, appId: appId, versionId: appVersion}).$promise);
            });
            return deferred.promise;
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
                                            (appVersion.oauthClientRedirects === null || appVersion.oauthClientRedirects.length === 0)) {
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
        
        function reissueApiKey(orgId, appId, versionId) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/reissueApiKey.html',
                size: 'lg',
                controller: 'ReissueConfirmCtrl',
                backdrop: 'static'
            });
            
            modalInstance.result.then(function () {
                ApplicationApiKeyReissue.request({orgId: orgId, appId: appId, versionId: versionId}, {}).$promise.then(function (reply) {
                    deferred.resolve(reply);
                }, function (err) {
                    deferred.reject(err);
                })
            }, function () {
                // Canceled, do nothing
                deferred.resolve();
            });
            
            return deferred.promise;
        }
        
        function reissueOAuth(orgId, appId, versionId) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/reissueOAuth.html',
                size: 'lg',
                controller: 'ReissueConfirmCtrl',
                backdrop: 'static'
            });

            modalInstance.result.then(function () {
                ApplicationOAuthReissue.request({orgId: orgId, appId: appId, versionId: versionId}, {}).$promise.then(function (reply) {
                    deferred.resolve(reply);
                }, function (err) {
                    deferred.reject(err);
                })
            }, function () {
                // Canceled, do nothing
                deferred.resolve();
            });

            return deferred.promise;
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
    }

    function appService(Application, ApplicationVersionMetrics, ApplicationVersion, ApplicationContract, ApplicationVersionToken, $q, _, userService, OAuthTokenRevoke) {
        this.getAppsForOrg = getAppsForOrg;
        this.getAppVersions = getAppVersions;
        this.getAppVersionDetails = getAppVersionDetails;
        this.getAppVersionContracts = getAppVersionContracts;
        this.getAppVersionTokens = getAppVersionTokens;
        this.revokeAppVersionTokens = revokeAppVersionTokens;
        this.getAppMetrics = getAppMetrics;
        this.updateAppDesc = updateAppDescription;
        
        
        function getAppsForOrg(orgId) {
            return Application.query({ orgId: orgId }).$promise;
        }
        
        function getAppVersions(orgId, appId) {
            return ApplicationVersion.query({ orgId: orgId, appId: appId }).$promise
        }

        function getAppVersionDetails(orgId, appId, versionId) {
            return ApplicationVersion.get({ orgId: orgId, appId: appId, versionId: versionId }).$promise;
        }
        
        function getAppVersionContracts(orgId, appId, versionId) {
            return ApplicationContract.query({ orgId: orgId, appId: appId, versionId: versionId }).$promise
        }

        function getAppVersionTokens(orgId, appId, versionId) {
            return ApplicationVersionToken.get({ orgId: orgId, appId: appId, versionId: versionId }).$promise.then(function (tokens) {
                var promises = [];
                var grants = [];
                _.forEach(tokens.data, function (token) {
                    var grant = {};
                    grant.originalToken = angular.copy(token);
                    var scopesArray = [];
                    _.forEach(_.split(token.scope, ' '), function (scopeString) {
                        scopesArray.push(_.split(scopeString, '.')[3]);
                    });
                    scopesArray = _.sortBy(scopesArray);
                    grant.scopesString = _.join(scopesArray, ', ');
                    promises.push(userService.getUserDetails(token.authenticatedUserid).then(function (userDetails) {
                        grant.userDetails = userDetails;
                        grants.push(grant);
                    }))
                });
                return $q.all(promises).then(function () {
                    return grants;
                });
            });
        }

        function getAppMetrics(orgId, appId, versionId, fromDt, toDt) {
            return ApplicationVersionMetrics.get({ orgId, appId, versionId, from: fromDt, to: toDt }).$promise;
        }

        function revokeAppVersionTokens(toRevoke) {
            var promises = [];
            _.forEach(toRevoke, function (token) {
                promises.push(OAuthTokenRevoke.delete({ token: token }).$promise);
            });
            return $q.all(promises);
        }

        function updateAppDescription(orgId, appId, newDescription) {
            return Application.update({orgId: orgId, appId: appId}, {description: newDescription}).$promise;
        }
    }


})();
