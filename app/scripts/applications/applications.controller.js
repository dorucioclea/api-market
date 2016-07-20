(function () {
    'use strict';

    angular.module('app.applications')
        .controller('ApplicationCtrl', appCtrl)
        .controller('ActivityCtrl', activityCtrl)
        .controller('ApisCtrl', apisCtrl)
        .controller('AppMetricsCtrl', appMetricsCtrl)
        .controller('OverviewCtrl', overviewCtrl)
        .controller('DeleteApplicationVersionCtrl', deleteApplicationVersionCtrl)
        .controller('ReissueConfirmCtrl', reissueConfirmCtrl);


    function appCtrl($scope, $uibModal, $state, $stateParams, appData, appVersions, contractData,
                     appScreenModel, orgData, orgScreenModel, headerModel, actionService, applicationManager, appService,
                     contractService, toastService, selectedApp) {
        $scope.apikey = undefined;
        $scope.applicationVersion = appData;
        $scope.contracts = contractData;
        $scope.versions = appVersions;
        $scope.displayTab = appScreenModel;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.selectVersion = selectVersion;
        $scope.breakContract = breakContract;
        $scope.updateDesc = updateDesc;
        $scope.confirmDeleteApp = confirmDeleteApp;
        $scope.confirmPublishApp = confirmPublishApp;
        $scope.confirmRetireApp = confirmRetireApp;
        $scope.showInfoModal = showInfoModal;
        $scope.showOAuthConfig = showOAuthConfig;
        $scope.canConfigureOAuth = canConfigureOAuth;
        $scope.newContract = newContract;
        $scope.confirmDeleteVersion = confirmDeleteVersion;
        
        init();

        function init() {
            headerModel.setIsButtonVisible(true, true, false);
            orgScreenModel.updateOrganization(orgData);
            appScreenModel.updateApplication(appData);
            $scope.isReady = $scope.applicationVersion.status === 'Ready';
            $scope.isRegistered =
                $scope.applicationVersion.status === 'Registered' || $scope.applicationVersion.status === 'Retired';
            $scope.isRetired = $scope.applicationVersion.status === 'Retired';

            if (!$scope.apikey && $scope.contracts && $scope.contracts.length > 0) $scope.apikey = $scope.contracts[0].apikey;
            // if ($scope.versions.length === 1) {
                $scope.lastVersion = 'This version cannot be deleted because it is the last remaining one.<br>If you want to remove the application completely, use the Delete App button.'
            // }
        }
        
        function confirmDeleteVersion() {
            applicationManager.deleteVersion($scope.applicationVersion.application.organization.id,
                $scope.applicationVersion.application.id, $scope.applicationVersion.application.name,
                $scope.applicationVersion.version).then(function () {
                toastService.success('<b>Application Version deleted.</b>');

                // TODO Redirect? If other versions, redirect to highest, else redirect to dashboard
                $state.go('root.market-dash', { orgId: $scope.applicationVersion.application.organization.id });

            }, function (error) {
                toastService.createErrorToast(error, 'Could not delete application version!');
            })
        }

        function selectVersion(version) {
            $state.go($state.$current.name,
                {orgId: $stateParams.orgId, appId: $stateParams.appId, versionId: version.version});
        }

        function breakContract (contract) {
            contractService.break(contract.appOrganizationId, contract.appId, contract.appVersion, contract.contractId)
                .then(function () {
                    // TODO toast?
                    $state.forceReload();
                });
        }

        function updateDesc(newValue) {
            appService.updateAppDesc($stateParams.orgId, $stateParams.appId, newValue).then(function () {
                toastService.info('Description updated.');
            }, function (error) {
                toastService.createErrorToast(error, 'Could not update the description.');
            });
        }

        function newContract(appVersion) {
            var appObject = {
                description: appVersion.application.description,
                id: appVersion.application.id,
                name: appVersion.application.name,
                organizationId: appVersion.application.organization.id,
                organizationName: appVersion.application.organization.name,
                status: appVersion.status,
                version: appVersion.version
            };
            selectedApp.updateApplication(appObject);
            $state.go('root.apis.grid');
        }

        function confirmDeleteApp(appVersion) {
            applicationManager.delete(appVersion.application.organization.id, appVersion.application.id,
                appVersion.application.name)
                .then(function (result) {
                    if ( result === 'success') {
                        $state.go('root.market-dash', { orgId: appVersion.application.organization.id });
                    }
                });
        }

        function confirmPublishApp(appVersion) {
            applicationManager.publish(appVersion.application.organization.id, appVersion.application.id,
                appVersion.version);
        }

        function confirmRetireApp(appVersion) {
            applicationManager.retire(appVersion.application.organization.id, appVersion.application.id,
                appVersion.version);
        }

        function showInfoModal() {
            $uibModal.open({
                templateUrl: 'views/modals/helpView.html',
                size: 'lg',
                controller: 'HelpCtrl as ctrl',
                resolve: {
                    type: function () {
                        return 'application';
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

        function canConfigureOAuth () {
            return $scope.applicationVersion.oAuthClientId !== null &&
                $scope.applicationVersion.oAuthClientId.length > 0;
        }

        function showOAuthConfig(appVersion) {
            applicationManager.oAuthConfig(appVersion.application.organization.id,
                appVersion.application.id, appVersion.version);
        }
    }

    function activityCtrl($scope, activityData, appScreenModel) {

        $scope.activities = activityData.beans;
        appScreenModel.updateTab('Activity');

    }

    
    function apisCtrl($scope, $state, appScreenModel, docDownloader, docTester, service, toastService, ApplicationContract) {

        $scope.docDownloader = docDownloader;
        $scope.toApiDoc = toApiDoc;
        $scope.breakContract = breakContract;
        $scope.copyEndpoint = copyEndpoint;
        init();


        function init() {
            docTester.reset();
            appScreenModel.updateTab('APIs');

            $scope.contracts.forEach(function (contract) {
                if (!contract.serviceEndpoint) {
                    service.getEndpoint(contract.serviceOrganizationId, contract.serviceId, contract.serviceVersion).then(function (endpoint) {
                        contract.serviceEndpoint = endpoint.managedEndpoint;
                    })
                }
            })
        }

        function toApiDoc(contract) {
            $state.go('root.api.documentation',
                ({orgId: contract.serviceOrganizationId,
                    svcId: contract.serviceId,
                    versionId: contract.serviceVersion}));
            docTester.setPreferredContract(contract);
        }

        function breakContract(contract) {
            ApplicationContract.delete(
                {orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion,
                    contractId: contract.contractId},
                function (reply) {
                    $state.forceReload();
                    toastService.success('<b>Contract was broken.</b>');
                });
        }

        function copyEndpoint(serviceName) {
            var msg = 'Basepath for <b>' + serviceName + '</b> copied to clipboard!';
            toastService.info(msg);
        }

    }

    function appMetricsCtrl($scope, $stateParams, $parse, appScreenModel, appService) {
        init();
        function init() {
            appScreenModel.updateTab('Metrics');
            $scope.responseHistogramData = {};

            $scope.fromDt = new Date();
            $scope.fromDt.setDate($scope.fromDt.getDate() - 7); //Start with a one week period
            $scope.toDt = new Date();
            $scope.interval = 'day';
            $scope.isIntervalMinute = false;
            updateMetrics();
        }

        $scope.open = function($event, to) {
            $event.preventDefault();
            $event.stopPropagation();

            if (to) {
                $scope.toOpened = true;
            } else {
                $scope.fromOpened = true;
            }
        };

        function updateMetrics() {
            appService.getAppMetrics($stateParams.orgId, $stateParams.appId, $stateParams.versionId, $scope.fromDt, $scope.toDt, $scope.interval).then(function (stats) {
                $scope.serviceIds = [];
                angular.forEach(stats.data, function (serviceData, serviceKey) {
                    var key = serviceKey.split('.').join('_');
                    createResponseHistogram(serviceData.data, key);
                });
            });
        }

        $scope.$watch('fromDt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (!$scope.isIntervalMinute) {
                    updateMetrics();
                }
            }
        });

        $scope.$watch('toDt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (!$scope.isIntervalMinute) {
                    updateMetrics();
                }
            }
        });

        $scope.$watch('interval', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if ($scope.interval === 'minute') {
                    $scope.isIntervalMinute = true;
                    getMinuteMetrics();
                } else {
                    $scope.isIntervalMinute = false;
                }
                updateMetrics();
            }
        });

        function getMinuteMetrics() {
            $scope.fromDt = new Date();
            $scope.fromDt.setDate($scope.fromDt.getDate() - 1); // Only get minute statistics for the last day.
            $scope.toDt = new Date();
            updateMetrics();
        }

        function setBlanksToZero(property) {
            return angular.isDefined(property) ? property : 0;
        }

        function createResponseHistogram(dataArray, dataArrayId) {
            var property = 'responseHistogramData.' + dataArrayId;
            var propertyId = property + '.id';
            var propertyName = property + '.name';
            var propertyEntries = property + '.entries';
            var entries = [];

            angular.forEach(dataArray, function(data) {
                var date = new Date(data.interval);
                var display = '';

                switch ($scope.interval) {
                    case 'month':
                        display = date.getMonth();
                        break;
                    case 'week':
                        display = date.getDate() + '/' + (date.getMonth() + 1);
                        break;
                    case 'day':
                        display = date.getDate() + '/' + (date.getMonth() + 1);
                        break;
                    case 'hour':
                        display = date.getDate() + '/' + (date.getMonth() + 1) + ' ';
                        if (date.getHours < 10) {
                            display += '0';
                        }
                        display += date.getHours() + ':00';
                        break;
                    case 'minute':
                        display = date.getDate() + '/' + (date.getMonth() + 1) + ' ';
                        if (date.getHours() < 10) {
                            display += '0';
                        }
                        display += date.getHours() + ':';
                        if (date.getMinutes() < 10) {
                            display += '0';
                        }
                        display += date.getMinutes();
                        break;
                }

                entries.push({
                    'x': date,
                    'displayDate': display,
                    'count': setBlanksToZero(data.count)
                });
            });

            entries.sort(function(a, b) {
                return a.x - b.x;
            });
            $parse(propertyId).assign($scope, dataArrayId);
            $parse(propertyName).assign($scope, dataArrayId.split('_').join(' '));
            $parse(propertyEntries).assign($scope, entries);
        }

        $scope.responseHistogramColumns = [
            {'id': 'count', 'name': 'Requests', 'type': 'spline', 'color': 'blue'}
        ];
        $scope.responseHistogramX = {'id': 'displayDate'};
    }

    function overviewCtrl($scope, appScreenModel, applicationManager, toastService) {

        appScreenModel.updateTab('Overview');
        $scope.copy = copy;
        $scope.refreshApiKey = refreshApiKey;
        $scope.refreshOAuth = refreshOAuth;

        function copy() {
            toastService.info('<b>Copied to clipboard!</b>');
        }

        function refreshApiKey(appVersion) {
            applicationManager.reissueApiKey(appVersion.application.organization.id, appVersion.application.id, appVersion.version).then(function (reply) {
                    if (reply) {
                        // TODO don't use $parent here
                        $scope.$parent.apikey = reply.newKey;
                        toastService.success('Reissued API key for <b>' + appVersion.application.name + ' ' + appVersion.version +  '</b>.')
                    }
            }, function (err) {
                toastService.createErrorToast(err, 'Could not reissue API key.');
            })
        }

        function refreshOAuth(appVersion) {
            applicationManager.reissueOAuth(appVersion.application.organization.id, appVersion.application.id, appVersion.version).then(function (reply) {
                if (reply) {
                    // TODO avoid use of $parent here
                    $scope.$parent.applicationVersion.oAuthClientId = reply.newClientId;
                    $scope.$parent.applicationVersion.oauthClientSecret = reply.newClientSecret;
                    toastService.success('Reissued OAuth credentials for <b>' + appVersion.application.name + ' ' + appVersion.version +  '</b>.')
                }
            }, function (err) {
                toastService.createErrorToast(err, 'Could not reissue OAuth credentials.');
            })
        }

    }


    function deleteApplicationVersionCtrl($scope, $uibModalInstance, applicationName, applicationVersion, lastVersion) {

        $scope.applicationName = applicationName;
        $scope.applicationVersion = applicationVersion;
        $scope.lastVersion = lastVersion;
        $scope.modalClose = modalClose;
        $scope.doDelete = doDelete;

        function modalClose() {
            $uibModalInstance.dismiss("cancel");
        }

        function doDelete() {
            $uibModalInstance.close("OK");
        }
    }
    
    function reissueConfirmCtrl($scope, $uibModalInstance) {

        $scope.cancel = cancel;
        $scope.ok = ok;

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }

        function ok() {
            $uibModalInstance.close("OK");
        }
    }


})();
