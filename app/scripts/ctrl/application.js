;(function(angular) {
    'use strict';

    angular.module('app.ctrl.application', [])

        /// ==== Application Controller
        .controller('ApplicationCtrl', ['$scope', '$modal', '$state', '$stateParams', 'appData', 'appVersions',
            'appScreenModel', 'orgData', 'orgScreenModel', 'headerModel', 'actionService', 'toastService', 'TOAST_TYPES',
            'Application', 'ApplicationContract',
            function ($scope, $modal, $state, $stateParams, appData, appVersions,
                      appScreenModel, orgData, orgScreenModel, headerModel, actionService, toastService, TOAST_TYPES,
                      Application, ApplicationContract) {
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

                $scope.selectVersion = function (version) {
                    $state.go($state.$current.name,
                        {orgId: $stateParams.orgId, appId: $stateParams.appId, versionId: version.version});
                };

                $scope.breakContract = function (contract) {
                    ApplicationContract.delete(
                        {orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion,
                            contractId: contract.contractId}, function (reply) {
                            $state.forceReload();
                        });
                };

                $scope.updateDesc = function (newValue) {
                    Application.update({orgId: $stateParams.orgId, appId: $stateParams.appId}, {description: newValue},
                        function (reply) {
                            toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not update the description.');
                        });
                };

                $scope.confirmPublishApp = function (appVersion) {
                    $modal.open({
                        templateUrl: 'views/modals/modalPublishApplication.html',
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
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                };

                $scope.confirmRetireApp = function (appVersion) {
                    $modal.open({
                        templateUrl: 'views/modals/modalRetireApplication.html',
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
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                };

                $scope.showInfoModal = function() {
                    $modal.open({
                        templateUrl: 'views/modals/modalHelp.html',
                        size: 'lg',
                        controller: 'HelpCtrl as ctrl',
                        resolve: {
                            type: function () {
                                return 'application';
                            }
                        },
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                };

                $scope.canConfigureOAuth = function () {
                    return $scope.applicationVersion.oAuthClientId !== null &&
                        $scope.applicationVersion.oAuthClientId.length > 0;
                };

                $scope.showOAuthConfig = function (appVersion) {
                    $modal.open({
                        templateUrl: 'views/modals/modalOAuthConfig.html',
                        size: 'lg',
                        controller: 'OAuthConfigCtrl as ctrl',
                        resolve: {
                            appVersionDetails: function () {
                                return appVersion;
                            }
                        },
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                };
            }])

        // +++ Application Screen Subcontrollers +++
        /// ==== Activity Controller
        .controller('ActivityCtrl', ['$scope', 'activityData', 'appScreenModel',
            function ($scope, activityData, appScreenModel) {

                $scope.activities = activityData.beans;
                appScreenModel.updateTab('Activity');

            }])
        /// ==== APIs Controller
        .controller('ApisCtrl', ['$scope', 'contractData', 'appScreenModel',
            function ($scope, contractData, appScreenModel) {

                $scope.contracts = contractData;
                appScreenModel.updateTab('APIs');

                $scope.toggle = function (contract) {
                    contract.apiExpanded = !contract.apiExpanded;
                };

            }])
        /// ==== Contracts Controller
        .controller('ContractsCtrl', ['$scope', '$state', 'contractData', 'appScreenModel', 'docTester',
            function ($scope, $state, contractData, appScreenModel, docTester) {

                docTester.reset();
                $scope.contracts = contractData;
                appScreenModel.updateTab('Contracts');

                $scope.toApiDoc = function (contract) {
                    $state.go('root.api.documentation',
                        ({orgId: contract.serviceOrganizationId,
                            svcId: contract.serviceId,
                            versionId: contract.serviceVersion}));
                    docTester.setPreferredContract(contract);
                };

            }])

        /// ==== Metrics Controller
        .controller('AppMetricsCtrl', ['$scope', '$stateParams', '$parse', 'appScreenModel', 'ApplicationMetrics',
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
            }])

        /// ==== Overview Controller
        .controller('OverviewCtrl', ['$scope', 'appScreenModel', function ($scope, appScreenModel) {

            appScreenModel.updateTab('Overview');

        }]);

    // #end
})(window.angular);
