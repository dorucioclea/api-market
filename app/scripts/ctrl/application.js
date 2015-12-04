;(function(angular) {
    'use strict';

    angular.module('app.ctrl.application', [])

        /// ==== Application Controller
        .controller('ApplicationCtrl',
            function ($scope, $modal, $state, $stateParams, appData, appVersions,
                      appScreenModel, orgData, orgScreenModel, headerModel, actionService, toastService, TOAST_TYPES,
                      Application, ApplicationContract, selectedApp) {
                headerModel.setIsButtonVisible(true, true, false);
                orgScreenModel.updateOrganization(orgData);
                $scope.applicationVersion = appData;
                appScreenModel.updateApplication(appData);
                $scope.versions = appVersions;
                $scope.displayTab = appScreenModel;
                $scope.isReady = $scope.applicationVersion.status === 'Ready';
                $scope.isRegistered =
                $scope.applicationVersion.status === 'Registered' || $scope.applicationVersion.status === 'Retired';
                $scope.isRetired = $scope.applicationVersion.status === 'Retired';
                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.selectVersion = selectVersion;
                $scope.breakContract = breakContract;
                $scope.updateDesc = updateDesc;
                $scope.confirmPublishApp = confirmPublishApp;
                $scope.confirmRetireApp = confirmRetireApp;
                $scope.showInfoModal = showInfoModal;
                $scope.showOAuthConfig = showOAuthConfig;
                $scope.canConfigureOAuth = canConfigureOAuth;
                $scope.newContract = newContract;

                function selectVersion(version) {
                    $state.go($state.$current.name,
                        {orgId: $stateParams.orgId, appId: $stateParams.appId, versionId: version.version});
                }

                function breakContract (contract) {
                    ApplicationContract.delete(
                        {orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion,
                            contractId: contract.contractId}, function (reply) {
                            $state.forceReload();
                        });
                }

                function updateDesc(newValue) {
                    Application.update({orgId: $stateParams.orgId, appId: $stateParams.appId}, {description: newValue},
                        function (reply) {
                            toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
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

                function confirmPublishApp(appVersion) {
                    $modal.open({
                        templateUrl: 'views/modals/applicationPublish.html',
                        size: 'lg',
                        controller: 'PublishApplicationCtrl as ctrl',
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
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }

                function confirmRetireApp(appVersion) {
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
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }

                function showInfoModal() {
                    $modal.open({
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
                                return oAuthService.needsCallback(appVersion.application.organization.id, appVersion.application.id, appVersion.version);
                            }
                        },
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }
            })

        // +++ Application Screen Subcontrollers +++
        /// ==== Activity Controller
        .controller('ActivityCtrl',
            function ($scope, activityData, appScreenModel) {

                $scope.activities = activityData.beans;
                appScreenModel.updateTab('Activity');

            })
        /// ==== APIs Controller
        .controller('ApisCtrl',
            function ($scope, $modal, contractData, appScreenModel, docDownloader, TOAST_TYPES) {

                $scope.contracts = contractData;
                $scope.docDownloader = docDownloader;
                appScreenModel.updateTab('APIs');
                $scope.toggle = toggle;
                $scope.copyKey = copyKey;
                $scope.howToInvoke = howToInvoke;

                function copyKey(key) {
                    var type = TOAST_TYPES.INFO;
                    var msg = '<b>API Key copied to clipboard!</b><br>' + key;
                    $scope.toastService.createToast(type, msg, true);
                }

                function howToInvoke(contract) {
                    $modal.open({
                        templateUrl: 'views/modals/serviceHowToInvoke.html',
                        size: 'lg',
                        controller: 'HowToInvokeCtrl as ctrl',
                        resolve: {
                            contract: contract,
                            endpoint: function (ServiceEndpoint) {
                                return ServiceEndpoint.get(
                                    {orgId: contract.serviceOrganizationId,
                                        svcId: contract.serviceId, versionId: contract.serviceVersion}).$promise;
                            }
                        },
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }

                function toggle(contract) {
                    contract.apiExpanded = !contract.apiExpanded;
                }

            })
        /// ==== Contracts Controller
        .controller('ContractsCtrl',
            function ($scope, $state, contractData, appScreenModel, docTester) {

                $scope.contracts = contractData;
                $scope.toApiDoc = toApiDoc;

                init();

                function init() {
                    docTester.reset();
                    appScreenModel.updateTab('Contracts');
                }

                function toApiDoc(contract) {
                    $state.go('root.api.documentation',
                        ({orgId: contract.serviceOrganizationId,
                            svcId: contract.serviceId,
                            versionId: contract.serviceVersion}));
                    docTester.setPreferredContract(contract);
                }
            })

        /// ==== Metrics Controller
        .controller('AppMetricsCtrl',
            function ($scope, $stateParams, $parse, appScreenModel, ApplicationMetrics) {
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
                    ApplicationMetrics.get({orgId: $stateParams.orgId, appId: $stateParams.appId,
                            versionId: $stateParams.versionId,
                            from: $scope.fromDt, to: $scope.toDt, interval: $scope.interval},
                        function (stats) {
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
            })

        /// ==== Overview Controller
        .controller('OverviewCtrl',
            function ($scope, appScreenModel) {

                appScreenModel.updateTab('Overview');

            });

    // #end
})(window.angular);
