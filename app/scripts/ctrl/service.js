(function (angular) {
    'use strict';

    angular.module('app.ctrl.service', [])

        /// ==== Service Controller
        .controller('ServiceCtrl',
        ['$scope', '$state', '$stateParams', '$modal', 'orgData', 'orgScreenModel',
            'svcData', 'svcVersions', 'svcScreenModel', 'toastService', 'TOAST_TYPES', 'actionService',
            'Service', 'ServiceVersionDefinition',
            function ($scope, $state, $stateParams, $modal, orgData, orgScreenModel,
                      svcData, svcVersions, svcScreenModel, toastService, TOAST_TYPES, actionService,
                      Service, ServiceVersionDefinition) {

                orgScreenModel.updateOrganization(orgData);
                $scope.serviceVersion = svcData;
                svcScreenModel.updateService(svcData);
                $scope.displayTab = svcScreenModel;
                $scope.versions = svcVersions;
                $scope.isReady = $scope.serviceVersion.status === 'Ready';
                $scope.isPublished =
                    $scope.serviceVersion.status === 'Published' || $scope.serviceVersion.status === 'Retired';
                $scope.isRetired = $scope.serviceVersion.status === 'Retired';
                $scope.tabStatus = svcScreenModel.tabStatus;
                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.confirmPublishSvc = confirmPublishSvc;
                $scope.confirmRetireSvc = confirmRetireSvc;

                ServiceVersionDefinition.get(
                    {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId},
                    function (reply) {
                        svcScreenModel.setHasDefinition(true);
                    }, function (error) {
                        svcScreenModel.setHasDefinition(false);
                    });

                $scope.selectVersion = function (version) {
                    $state.go($state.$current.name,
                        {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: version.version});
                };

                function confirmPublishSvc() {
                    $modal.open({
                                templateUrl: 'views/modals/modalPublishService.html',
                                size: 'lg',
                                controller: 'PublishServiceCtrl as ctrl',
                                resolve: {
                                    svcVersion: function () {
                                        return $scope.serviceVersion;
                                    }
                                },
                                windowClass: $scope.modalAnim	// Animation Class put here.
                            });
                }

                function confirmRetireSvc() {
                    $modal.open({
                                templateUrl: 'views/modals/modalRetireService.html',
                                size: 'lg',
                                controller: 'RetireServiceCtrl as ctrl',
                                resolve: {
                                    svcVersion: function () {
                                        return $scope.serviceVersion;
                                    }
                                },
                                windowClass: $scope.modalAnim	// Animation Class put here.
                            });
                }

                $scope.updateDesc = function (newValue) {
                    Service.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId}, {description: newValue},
                        function (reply) {
                            toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not update service\'s description.');
                        });
                };

            }])

        // +++ Service Screen Subcontrollers +++
        /// ==== Activity Controller
        .controller('ServiceActivityCtrl', ['$scope', 'activityData', 'svcScreenModel',
            function ($scope, activityData, svcScreenModel) {

                $scope.activities = activityData.beans;
                svcScreenModel.updateTab('Activity');

            }])

        /// ==== Implementation Controller
        .controller('ServiceImplementationCtrl', ['$scope', '$state', '$stateParams', 'toastService', 'TOAST_TYPES',
            'ServiceVersion', 'svcScreenModel',
            function ($scope, $state, $stateParams, toastService, TOAST_TYPES,
                      ServiceVersion, svcScreenModel) {

                $scope.version = svcScreenModel.service;
                $scope.updatedService = {
                    endpointType: 'rest',
                    endpoint: $scope.version.endpoint,
                    gateways: [{gatewayId: 'KongGateway'}]
                };

                $scope.typeOptions = ['rest', 'soap'];
                svcScreenModel.updateTab('Implementation');

                $scope.selectType = function (newType) {
                    $scope.updatedService.endpointType = newType;
                };

                var checkValid = function () {
                    var valid = true;
                    if (!$scope.updatedService.endpointType || angular.isUndefined($scope.updatedService.endpoint)) {
                        valid = false;
                    } else if ($scope.updatedService.endpoint === null || $scope.updatedService.endpoint.length === 0) {
                        valid = false;
                    }
                    $scope.isValid = valid;
                };

                $scope.$watch('updatedService', function (newValue) {
                    if ($scope.version) {
                        var dirty = false;
                        if (newValue.endpoint !== $scope.version.endpoint ||
                            newValue.endpointType !== $scope.version.endpointType) {
                            dirty = true;
                        }
                        checkValid();
                        $scope.isDirty = dirty;
                    }
                }, true);

                $scope.reset = function () {
                    $scope.updatedService.endpoint = $scope.version.endpoint;
                    $scope.updatedService.endpointType = $scope.version.endpointType;
                    $scope.isDirty = false;
                };

                $scope.saveService = function () {
                    ServiceVersion.update(
                        {orgId: $stateParams.orgId,
                            svcId: $stateParams.svcId,
                            versionId: $stateParams.versionId},
                        $scope.updatedService,
                        function (reply) {
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Endpoint for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                                true);
                            $scope.isDirty = false;
                            if ($scope.tabStatus.hasImplementation) {
                                $state.forceReload();
                            } else {
                                svcScreenModel.setHasImplementation(true);
                                $state.go('^.definition');
                            }
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not update implementation endpoint.');
                        });
                };

            }])

        /// ==== Definition Controller
        .controller('ServiceDefinitionCtrl', ['$scope', '$state', '$stateParams', 'toastService', 'TOAST_TYPES',
            'ServiceVersionDefinition', 'svcScreenModel',
            function ($scope, $state, $stateParams, toastService, TOAST_TYPES,
                      ServiceVersionDefinition, svcScreenModel) {

                svcScreenModel.updateTab('Definition');
                $scope.definitionLoaded = false;
                $scope.noDefinition = false;

                ServiceVersionDefinition.get(
                    {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId},
                    function (reply) {
                        $scope.currentDefinition = reply;
                        if (angular.isDefined($scope.currentDefinition)) {
                            $scope.updatedDefinition = $scope.currentDefinition;
                            $scope.loadSwaggerUi($scope.currentDefinition, 'original-swagger-ui-container');
                        } else {
                            $scope.noDefinition = true;
                        }
                    }, function (error) {
                        $scope.noDefinition = true;
                    });

                $scope.reset = function () {
                    $scope.definitionLoaded = false;
                    $scope.updatedDefinition = $scope.currentDefinition;
                };

                $scope.saveDefinition = function () {
                    ServiceVersionDefinition.update({
                            orgId: $stateParams.orgId,
                            svcId: $stateParams.svcId,
                            versionId: $stateParams.versionId
                        }, $scope.updatedDefinition,
                        function (data) {
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Service Definition for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                                true);
                            if ($scope.tabStatus.hasDefinition) {
                                $state.forceReload();
                            } else {
                                svcScreenModel.setHasDefinition(true);
                                $state.go('^.plans');
                            }
                        },
                        function (error) {
                            toastService.createErrorToast(error, 'Could not update the definition.');
                        });
                };

                $scope.$watch('updatedDefinition', function (def) {
                    $scope.changed = (def !== $scope.currentDefinition);
                    $scope.invalid = (def === $scope.currentDefinition);
                }, true);

                $scope.loadDefinition = function ($fileContent) {
                    $scope.updatedDefinition = angular.fromJson($fileContent);
                    $scope.loadPreview($scope.updatedDefinition);
                };

                $scope.loadPreview = function (spec) {
                    $scope.definitionLoaded = true;
                    $scope.loadSwaggerUi(spec, 'swagger-ui-container');
                };
            }])

        /// ==== Plans Controller
        .controller('ServicePlansCtrl', ['$scope', '$state', '$stateParams', '$q', 'planData', 'svcScreenModel',
            'toastService', 'TOAST_TYPES', 'PlanVersion', 'ServiceVersion',
            function ($scope, $state, $stateParams, $q, planData, svcScreenModel,
                      toastService, TOAST_TYPES, PlanVersion, ServiceVersion) {

                svcScreenModel.updateTab('Plans');
                var definedPlans = planData;
                var lockedPlans = [];
                $scope.updatedService = {};
                $scope.version = svcScreenModel.service;

                var getSelectedPlans = function () {
                    var selectedPlans = [];
                    for (var i = 0; i < lockedPlans.length; i++) {
                        var plan = lockedPlans[i];
                        if (plan.checked) {
                            var selectedPlan = {};
                            selectedPlan.planId = plan.id;
                            selectedPlan.version = plan.selectedVersion;
                            selectedPlans.push(selectedPlan);
                        }
                    }
                    return selectedPlans;
                };

                //find locked plan versions
                $q(function (resolve) {
                    var promises = [];
                    angular.forEach(definedPlans, function (plan) {
                        promises.push($q(function (resolve, reject) {
                            PlanVersion.query({orgId: $stateParams.orgId, planId: plan.id}, function (planVersions) {
                                var lockedVersions = [];
                                for (var j = 0; j < planVersions.length; j++) {
                                    var planVersion = planVersions[j];
                                    if (planVersion.status === 'Locked') {
                                        lockedVersions.push(planVersion.version);
                                    }
                                }
                                // if we found locked plan versions then add them
                                if (lockedVersions.length > 0) {
                                    plan.lockedVersions = lockedVersions;
                                    lockedPlans.push(plan);
                                }
                                resolve(planVersions);
                            }, reject);
                        }));
                    });
                    $q.all(promises).then(function () {
                        lockedPlans.sort(function (a, b) {
                            if (a.id.toLowerCase() < b.id.toLowerCase()) {
                                return -1;
                            } else if (b.id < a.id) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        resolve(lockedPlans);
                        $scope.plans = lockedPlans;
                        $scope.reset();
                    });
                });

                $scope.$watch('plans', function (newValue) {
                    $scope.updatedService.plans = getSelectedPlans();
                }, true);

                $scope.reset = function () {
                    for (var i = 0; i < lockedPlans.length; i++) {
                        lockedPlans[i].selectedVersion = lockedPlans[i].lockedVersions[0];
                        for (var j = 0; j < $scope.version.plans.length; j++) {
                            if (lockedPlans[i].id === $scope.version.plans[j].planId) {
                                lockedPlans[i].checked = true;
                                lockedPlans[i].selectedVersion = $scope.version.plans[j].version;
                                break;
                            }
                            lockedPlans[i].checked = false;
                        }
                    }
                    $scope.updatedService.plans = getSelectedPlans();
                    $scope.isDirty = false;
                };

                $scope.$watch('updatedService', function (newValue) {
                    var dirty = false;
                    if (newValue.plans && $scope.version.plans &&
                        newValue.plans.length !== $scope.version.plans.length) {
                        dirty = true;
                    } else if (newValue.plans && $scope.version.plans) {
                        for (var i = 0; i < $scope.version.plans.length; i++) {
                            var p1 = $scope.version.plans[i];

                            for (var j = 0; j < newValue.plans.length; j++) {
                                var p2 = newValue.plans[j];
                                if (p1.planId === p2.planId) {
                                    // Found Plan, if versions are not equal ==> dirty
                                    if (p1.version !== p2.version) {
                                        dirty = true;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    $scope.isDirty = dirty;
                }, true);

                $scope.saveService = function () {
                    ServiceVersion.update(
                        {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId},
                        $scope.updatedService,
                        function (reply) {
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Available Plans for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                                true);
                            $state.forceReload();
                        },
                        function (error) {
                            toastService.createErrorToast(error, 'Could not update the enabled plans.');
                        });
                };

            }])
        /// ==== Policies Controller
        .controller('ServicePoliciesCtrl', ['$scope', '$modal', '$stateParams', 'policyData', 'policyConfiguration',
            'svcScreenModel', 'ServiceVersionPolicy',
            function ($scope, $modal, $stateParams, policyData, policyConfiguration,
                      svcScreenModel, ServiceVersionPolicy) {

                $scope.policies = policyData;
                $scope.policyDetails = policyConfiguration;
                svcScreenModel.updateTab('Policies');

                $scope.removePolicy = function (policy) {
                    ServiceVersionPolicy.delete(
                        {orgId: $stateParams.orgId,
                            svcId: $stateParams.svcId,
                            versionId: $stateParams.versionId,
                            policyId: policy.id},
                        function (data) {
                            angular.forEach($scope.policies, function (p, index) {
                                if (policy === p) {
                                    $scope.policies.splice(index, 1);
                                }
                            });
                        });
                };

                $scope.modalAnim = 'default';

                $scope.modalAddPolicy = function () {
                    $modal.open({
                        templateUrl: '/views/modals/modalAddServicePolicy.html',
                        size: 'lg',
                        controller: 'AddPolicyCtrl as ctrl',
                        resolve: {
                            policyDefs: function (PolicyDefs) {
                                return PolicyDefs.query({}).$promise;
                            }
                        },
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                };
            }])

        /// ==== Overview Controller
        .controller('ServiceOverviewCtrl', ['$scope', 'svcContracts', 'svcScreenModel',
            function ($scope, svcContracts, svcScreenModel) {

                svcScreenModel.updateTab('Overview');
                $scope.contractCount = svcContracts.length;
                classifyContracts(svcContracts);

                function classifyContracts(contracts) {
                    $scope.contractOrgIds = [];
                    $scope.contractOrgs = [];
                    angular.forEach(contracts, function (contract) {
                        if (!$scope.contractOrgs[contract.appOrganizationId]) {
                            $scope.contractOrgs[contract.appOrganizationId] = {
                                name: contract.appOrganizationName,
                                contracts: []
                            };
                        }
                        if ($scope.contractOrgIds.indexOf(contract.appOrganizationId) === -1) {
                            $scope.contractOrgIds.push(contract.appOrganizationId);
                        }
                        $scope.contractOrgs[contract.appOrganizationId].contracts.push(contract);
                    });
                }

            }])

        // ==== Metrics Controller
        .controller('ServiceMetricsController', ['$scope', '$stateParams', 'svcScreenModel',
            'ServiceMetricsResponse', 'ServiceMetricsResponseSummary', 'ServiceMarketInfo',
            function($scope, $stateParams, svcScreenModel,
                     ServiceMetricsResponse, ServiceMetricsResponseSummary, ServiceMarketInfo) {

                init();
                function init() {
                    svcScreenModel.updateTab('Metrics');
                    $scope.responseHistogramData = [];
                    $scope.summary = {};
                    $scope.marketInfo = {};
                    $scope.uptime = [];

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

                ServiceMarketInfo.get(
                    {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId},
                    function (reply) {
                        $scope.marketInfo = reply;
                        $scope.uptime.push(reply);
                    });

                function updateMetrics() {
                    ServiceMetricsResponse.get(
                        {orgId: $stateParams.orgId,
                            svcId: $stateParams.svcId,
                            versionId: $stateParams.versionId,
                            from: $scope.fromDt,
                            to: $scope.toDt,
                            interval: $scope.interval},
                        function (response) {
                            createResponseHistogram(response.data);
                        });
                    ServiceMetricsResponseSummary.get(
                        {orgId: $stateParams.orgId,
                            svcId: $stateParams.svcId,
                            versionId: $stateParams.versionId,
                            from: $scope.fromDt,
                            to: $scope.toDt},
                        function (metrics) {
                            $scope.summary = metrics.data[0];
                        });
                }

                function getMinuteMetrics() {
                    $scope.fromDt = new Date();
                    $scope.fromDt.setDate($scope.fromDt.getDate() - 1); // Only get minute statistics for the last day.
                    $scope.toDt = new Date();
                    updateMetrics();
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

                $scope.formatFunction = function (x) {
                    return x.getDay();
                };

                function setBlanksToZero(property) {
                    return angular.isDefined(property) ? property : 0;
                }

                function createResponseHistogram(dataArray) {
                    $scope.responseHistogramData = [];

                    angular.forEach(dataArray, function (data) {
                        var date = new Date(data.dateInterval);
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

                        var graphObject = {
                            'x': date,
                            'displayDate': display,
                            'latency_kong': setBlanksToZero(data.latencyKong),
                            'latency_proxy': setBlanksToZero(data.latencyProxy),
                            'latency_request': setBlanksToZero(data.latencyRequest),
                            'requests_count': setBlanksToZero(data.requestsCount),
                            'requests_wrong': setBlanksToZero(data.requestsWrong),
                            'response_wrong': setBlanksToZero(data.responseWrong)
                        };
                        $scope.responseHistogramData.push(graphObject);
                    });

                    $scope.responseHistogramData.sort(function(a, b) {
                        return a.x - b.x;
                    });
                }

                $scope.responseHistogramColumns = [
                    {'id': 'latency_kong', 'name': 'Kong latency', 'type': 'line', 'color': 'green'},
                    {'id': 'latency_proxy', 'name': 'Proxy latency', 'type': 'line', 'color': 'blue'},
                    {'id': 'latency_request', 'name': 'Request latency', 'type': 'line', 'color': 'red'},
                    {'id': 'requests_count', 'name': 'Requests', 'type': 'line', 'color': 'orange'},
                    {'id': 'requests_wrong', 'name': 'Malformed requests', 'type': 'line', 'color': 'magenta'},
                    {'id': 'response_wrong', 'name': 'Service errors', 'type': 'line', 'color': 'purple'}
                ];
                $scope.responseHistogramX = {'id': 'displayDate'};

                $scope.gaugeColumns = [{'id': 'uptime', 'name': 'Uptime %', 'type': 'gauge', 'color': 'green'}];

            }]);

    // #end
})(window.angular);
