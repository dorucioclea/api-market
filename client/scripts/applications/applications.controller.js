(function () {
    'use strict';

    angular.module('app.applications')
        .controller('ApplicationCtrl', appCtrl)
        .controller('ActivityCtrl', activityCtrl)
        .controller('ApisCtrl', apisCtrl)
        .controller('AppMetricsCtrl', appMetricsCtrl)
        .controller('OverviewCtrl', overviewCtrl)
        .controller('DeleteApplicationVersionCtrl', deleteApplicationVersionCtrl)
        .controller('ReissueConfirmCtrl', reissueConfirmCtrl)
        .controller('AppSecurityCtrl', appSecurityCtrl);


    function appCtrl($scope, $uibModal, $state, $stateParams, appData, appVersions, contractData, gateways,
                     appScreenModel, orgData, orgScreenModel, headerModel, actionService, applicationManager, appService,
                     contractService, toastService, selectedApp, EVENTS, _) {
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
            $scope.multipleGateways = gateways.length > 1;
            $scope.isRetired = $scope.applicationVersion.status === 'Retired';

            if (!$scope.apikey && $scope.contracts && $scope.contracts.length > 0) $scope.apikey = $scope.contracts[0].apikey;
            $scope.lastVersion = 'This version cannot be deleted because it is the last remaining one.<br>If you want to remove the application completely, use the Delete App button.'

            $scope.$on(EVENTS.APPLICATION_DETAILS_UPDATED, function (event, payload) {
                if (payload) {
                    if (_.has(payload, 'apikey')) $scope.apikey = payload.apikey;
                    if (_.has(payload, 'clientId')) $scope.applicationVersion.oAuthClientId = payload.clientId;
                    if (_.has(payload, 'clientSecret')) $scope.applicationVersion.oauthClientSecret = payload.clientSecret;
                }
            })
        }
        
        function confirmDeleteVersion() {
            applicationManager.deleteVersion($scope.applicationVersion.application.organization.id,
                $scope.applicationVersion.application.id, $scope.applicationVersion.application.name,
                $scope.applicationVersion.version).then(function () {
                toastService.success('<b>Application Version deleted.</b>');

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
                    toastService.info('Contract broken.');
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
            return $scope.applicationVersion.oAuthClientId &&
                   $scope.applicationVersion.oAuthClientId !== null &&
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
                        contract.serviceEndpoint = endpoint.managedEndpoints;
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

    function appMetricsCtrl($scope, $stateParams, $parse, appScreenModel, appService, toastService, _) {
        init();
        function init() {
            appScreenModel.updateTab('Metrics');

            $scope.fromDt = new Date();
            $scope.fromDt.setDate($scope.fromDt.getDate() - 7); //Start with a one week period
            $scope.toDt = new Date();
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
            $scope.loading = true;
            $scope.responseHistogramData = [];

            appService.getAppMetrics($stateParams.orgId, $stateParams.appId, $stateParams.versionId, $scope.fromDt, $scope.toDt).then(function (stats) {
                $scope.error = false;
                let noData = true;
                _.forEach(stats.data, function (serviceData, serviceKey) {
                    if (!_.isUndefined(serviceData) && !_.isEmpty(serviceData)) {
                        noData = false;
                        createResponseHistogram(serviceData.serviceData, serviceKey);
                    }
                });
                $scope.noData = noData;
            }, function (err) {
                if (err.data.type === "InvalidMetricCriteriaException") {
                    toastService.warning('<b>Invalid date range!</b><br>From date must fall before To date.');
                } else {
                    $scope.error = true;
                }
            }).finally(() => { $scope.loading = false; });
        }

        $scope.$watch('fromDt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                updateMetrics();
            }
        });

        $scope.$watch('toDt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                updateMetrics();
            }
        });

        function setBlanksToZeroAndRound(property) {
            return !_.isUndefined(property) && !_.isNull(property) ? _.round(property) : 0;
        }

        function createResponseHistogram(dataArray, dataKey) {
            let entries = [];

            // determine service params
            let serviceMetricsObject = detectServiceInfo(dataKey);

            _.forEach(dataArray, function (data) {
                let parsed = JSON.parse(data);

                // determine the metric we are dealing with
                let metric = determineMetric(parsed);

                _.forEach(parsed.pointlist, point => {
                    // see if there is an entry for this date
                    let existing = _.find(entries, dp => {
                        return dp.point === point[0];
                    });

                    if (existing) { existing[metric] = setBlanksToZeroAndRound(point[1]); }
                    else {
                        // create new datapoint
                        let tempDate = new Date(point[0]);
                        let dataPoint = {
                            point: point[0],
                            'x': tempDate,
                            displayDate: moment(tempDate).format('DD-MM-YYYY, hh:mm:ss'),
                            request_count: 0,
                            request_200: 0,
                            request_400: 0,
                            request_500: 0
                        };
                        dataPoint[metric] = setBlanksToZeroAndRound(point[1]);
                        entries.push(dataPoint);
                    }
                });
            });


            function detectServiceInfo(input) {
                let components = _.split(input, ', ');

                return {
                    id:   _.split(_.find(components, c => { return _.split(c, '=')[0] === 'id'}), '=')[1],
                    name: _.split(_.find(components, c => { return _.split(c, '=')[0] === 'name'}), '=')[1],
                    desc: _.split(_.find(components, c => { return _.split(c, '=')[0] === 'description'}), '=')[1],
                };
            }

            function determineMetric(input) {
                let components = _.split(input.metric, '.');
                switch (components[components.length -1]) {
                    case 'latency':
                        return 'latency_kong';
                    case 'upstream_latency':
                        return 'latency_upstream';
                    case 'uniques':
                        return 'user_uniques';
                    case 'count':
                        return 'request_count';
                    case '200':
                        return 'request_200';
                    case '400':
                        return 'request_400';
                    case '500':
                        return 'request_500';
                    case 'size':
                        if (components[components.length -2] === 'request') { return 'request_size'; }
                        else { return 'response_size'; }
                }
            }

            entries.sort(function (a, b) {
                return a.x - b.x;
            });
            serviceMetricsObject.entries = entries;
            // create new service object in responseHistogramData
            $scope.responseHistogramData.push(serviceMetricsObject);
        }

        $scope.responseHistogramColumns = [
            {'id': 'latency_kong', 'name': 'Kong latency', 'type': 'line', 'color': '#071F82'},
            {'id': 'latency_upstream', 'name': 'Upstream latency', 'type': 'line', 'color': '#104752'},
            {'id': 'request_count', 'name': 'Requests', 'type': 'line', 'color': '#0BA396'},
            {'id': 'request_200', 'name': 'Success (2XX)', 'type': 'line', 'color': '#ADDB4D'},
            {'id': 'request_400', 'name': 'Client Error (4XX)', 'type': 'line', 'color': '#FDBE28'},
            {'id': 'request_500', 'name': 'Server Error (5XX)', 'type': 'line', 'color': '#F5331B'},
            {'id': 'request_size', 'name': 'Request Size', 'type': 'line', 'color': '#D191FF'},
            {'id': 'response_size', 'name': 'Response Size', 'type': 'line', 'color': '#ECD1FF'},
            {'id': 'user_uniques', 'name': 'Unique users', 'type': 'line', 'color': '#5D4B51'}
        ];
        $scope.responseHistogramX = {'id': 'displayDate'};
    }

    function overviewCtrl($scope, appScreenModel, applicationManager, toastService, EVENTS) {

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
                        $scope.$emit(EVENTS.APPLICATION_DETAILS_UPDATED, { apikey: reply.newKey });
                        toastService.success('Reissued API key for <b>' + appVersion.application.name + ' ' + appVersion.version +  '</b>.')
                    }
            }, function (err) {
                toastService.createErrorToast(err, 'Could not reissue API key.');
            })
        }

        function refreshOAuth(appVersion) {
            applicationManager.reissueOAuth(appVersion.application.organization.id, appVersion.application.id, appVersion.version).then(function (reply) {
                if (reply) {
                    $scope.$emit(EVENTS.APPLICATION_DETAILS_UPDATED, { clientId: reply.newClientId, clientSecret: reply.newClientSecret });
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

    function appSecurityCtrl($scope, $uibModal, tokens, appService, toastService, _) {
        $scope.tokens = tokens;
        $scope.canDoBulkOperation = canDoBulkOperation;
        $scope.change = change;
        $scope.revoke = revoke;
        $scope.revokeSelected = revokeSelected;
        $scope.sel = false;


        function change() {
            _.forEach($scope.tokens, function (token) {
                token.selected = !!$scope.sel;
            })
        }

        function canDoBulkOperation() {
            return _.find($scope.tokens, function (token) {
                return token.selected;
            })
        }

        function revoke(token) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/revokeTokenConfirm.html',
                controller: 'ConfirmRevokeCtrl as ctrl',
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
            modalInstance.result.then(function () {
                doRevoke([token]).then(function () {
                    toastService.success('Access Token revoked.');
                }, function (error) {
                    toastService.createErrorToast(error, 'Failed to revoke Access Token.');
                });
            });
        }

        function revokeSelected() {
            var toRevoke = _.filter($scope.tokens, function (token) {
                return token.selected;
            });
            var modalUrl = 'views/modals/revokeTokenConfirm.html';
            if (toRevoke.length > 1) modalUrl = 'views/modals/revokeTokensConfirm.html';
            var modalInstance = $uibModal.open({
                templateUrl: modalUrl,
                controller: 'ConfirmRevokeCtrl as ctrl',
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

            modalInstance.result.then(function () {
                doRevoke(toRevoke).then(function () {
                    if (toRevoke.length === 1) toastService.success('Access Token revoked.');
                    else toastService.success('Access Tokens revoked.');
                }, function (error) {
                    if (toRevoke.length === 1) toastService.createErrorToast(error, 'Failed to revoke Access Token.');
                    else toastService.createErrorToast(error, 'Failed to revoke Access Tokens.');
                })
            });
        }

        function doRevoke(toRevoke) {
            var tokensToRevoke = _.map(toRevoke, 'originalToken.accessToken');
            return appService.revokeAppVersionTokens(tokensToRevoke).then(function () {
                $scope.tokens = _.difference($scope.tokens, toRevoke);
            });
        }
    }


})();
