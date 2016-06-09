(function () {
    'use strict';

    angular.module('app.applications')
        .service('applicationManager', applicationManager)
        .service('appService', appService);

    function applicationManager($modal, $q, oAuthService, toastService,
                                ApplicationContract, ApplicationVersion, ServiceVersion) {
        this.delete = deleteApp;
        this.publish = publish;
        this.retire = retire;
        this.oAuthConfig = oAuthConfig;

        function deleteApp(organizationId, appId, appName) {
            var modalInstance = $modal.open({
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
                                            $modal.open({
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
                $modal.open({
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
                $modal.open({
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

    function appService(Application, ApplicationMetrics, ApplicationVersion) {
        this.getAppVersionDetails = getAppVersionDetails;
        this.getAppMetrics = getAppMetrics;
        this.updateAppDesc = updateAppDescription;

        function getAppVersionDetails(orgId, appId, versionId) {
            return ApplicationVersion.get({ orgId: orgId, appId: appId, versionId: versionId }).$promise;
        }

        function getAppMetrics(orgId, appId, versionId, fromDt, toDt, interval) {
            return ApplicationMetrics.get({orgId: orgId, appId: appId,
                versionId: versionId,
                from: fromDt, to: toDt, interval: interval}).$promise;
        }

        function updateAppDescription(orgId, appId, newDescription) {
            return Application.update({orgId: orgId, appId: appId}, {description: newDescription}).$promise;
        }
    }


})();
