;(function() {
    'use strict';

    angular.module('app.market')

    /// ==== MarketDash Controller
        .controller('MarketDashCtrl', marketDashCtrl)
        .controller('MarketMembersCtrl', marketMembersCtrl)
        .controller('ApiSearchCtrl', apiSearchCtrl)
        .controller('DashboardCtrl', dashboardCtrl);
    

    function marketDashCtrl ($scope, $uibModal, $state, $stateParams, orgData, orgScreenModel,
                             appData, headerModel, pendingContracts,
                             selectedApp, applicationManager, docTester, toastService, service,
                             ApplicationContract, _) {
        headerModel.setIsButtonVisible(true, false);
        orgScreenModel.updateOrganization(orgData);
        $scope.$state = $state;
        $scope.orgScreenModel = orgScreenModel;
        $scope.applications = appData;
        $scope.orgId = $stateParams.orgId;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.collapseAll = collapseAll;
        $scope.expandAll = expandAll;
        $scope.toggle = toggle;
        $scope.canCreateContract = canCreateContract;
        $scope.canConfigureOAuth = canConfigureOAuth;
        $scope.canPublish = canPublish;
        $scope.isNotRetired = isNotRetired;
        $scope.canRetire = canRetire;
        $scope.newContract = newContract;
        $scope.toApiDoc = toApiDoc;
        $scope.confirmDeleteApp = confirmDeleteApp;
        $scope.confirmPublishApp = confirmPublishApp;
        $scope.confirmRetireApp = confirmRetireApp;
        $scope.toMetrics = toMetrics;
        $scope.showOAuthConfig = showOAuthConfig;
        $scope.breakContract = breakContract;
        $scope.modalNewApplication = modalNewApplication;
        $scope.copyKey = copyKey;
        $scope.copyProvisionKey = copyProvisionKey;
        $scope.selectVersion = selectVersion;


        init();


        function init() {
            angular.forEach($scope.applications, function (app) {
                app.selectedVersionIndex = 0;
            });

            pendingContracts.forEach(function (contract) {
                contract.planDetails = angular.fromJson(contract.body);
                service.getVersion(contract.serviceOrg, contract.serviceId, contract.serviceVersion).then(function (svcVersion) {
                    contract.svcDetails = svcVersion;
                });
                _.find(_.find($scope.applications, function (o) {
                    return o.id === contract.appId
                }).versions, function (v) {
                    return v.version === contract.appVersion;
                }).pendingContracts.push(contract);
            });

            if (selectedApp.appVersion) {
                var currentApp = _.find($scope.applications, function (a) {
                    return a.id === selectedApp.appVersion.id});
                currentApp.selectedVersionIndex = _.indexOf(currentApp.versions, _.find(currentApp.versions, function (v) {
                    return v.version === selectedApp.appVersion.version;
                }));
                if (currentApp.versions[currentApp.selectedVersionIndex].contracts.length > 0) {
                    currentApp.contractsExpanded = true;
                }
            }

            selectedApp.reset();
            docTester.reset();

            if ($stateParams.mode && $stateParams.mode === 'create') {
                modalNewApplication();
            }
        }

        function toggle(app) {
            app.contractsExpanded = !app.contractsExpanded;
        }

        function collapseAll() {
            angular.forEach($scope.applications, function (application) {
                application.contractsExpanded = false;
            })
        }

        function expandAll() {
            angular.forEach($scope.applications, function (application) {
                // Check if this application has at least one contract
                // Without this check, we would show an empty row
                if (application.versions[application.selectedVersionIndex].contracts.length > 0 ) {
                    application.contractsExpanded = true;
                }
            });
        }

        function canCreateContract(appVersion) {
            return !!(appVersion.status === 'Created' || appVersion.status === 'Ready');
        }

        function canConfigureOAuth(appVersion) {
            return $scope.isNotRetired(appVersion) &&
                appVersion.details.oAuthClientId !== null &&
                appVersion.details.oAuthClientId.length > 0;
        }

        function canPublish(appVersion) {
            return appVersion.status === 'Ready';
        }

        function isNotRetired(appVersion) {
            return appVersion.status === 'Created' ||
                appVersion.status === 'Ready' || appVersion.status === 'Registered';
        }

        function canRetire(appVersion) {
            return appVersion.status === 'Registered';
        }

        function newContract(appVersion) {
            selectedApp.updateApplication(appVersion);
            $state.go('root.apis.grid');
        }

        function toApiDoc(contract) {
            $state.go('root.api.documentation',
                ({orgId: contract.serviceOrganizationId,
                    svcId: contract.serviceId,
                    versionId: contract.serviceVersion}));
            docTester.setPreferredContract(contract);
        }

        function confirmDeleteApp(appVersion) {
            applicationManager.deleteVersion(appVersion.organizationId, appVersion.id, appVersion.name, appVersion.version)
                .then(function (result) {
                    $state.forceReload();
                });
        }

        function confirmPublishApp(appVersion) {
            applicationManager.publish(appVersion.organizationId, appVersion.id, appVersion.version);
        }

        function confirmRetireApp(appVersion) {
            applicationManager.retire(appVersion.organizationId, appVersion.id, appVersion.version);
        }

        function toMetrics(appVersion) {
            $state.go('root.application.metrics',
                {orgId: appVersion.organizationId, appId: appVersion.id, versionId: appVersion.version});
        }

        function showOAuthConfig(appVersion) {
            applicationManager.oAuthConfig(appVersion.organizationId, appVersion.id, appVersion.version);
        }

        function breakContract(application, contract) {
            ApplicationContract.delete(
                {orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion,
                    contractId: contract.contractId},
                function () {
                    var contracts = application.versions[application.selectedVersionIndex].contracts;
                    contracts.splice(contracts.indexOf(contract), 1);
                    if (contracts.length === 0) {
                        application.contractsExpanded = false;
                        application.versions[application.selectedVersionIndex].status = 'Created';
                    }
                });
        }

        function modalNewApplication() {
            $uibModal.open({
                templateUrl: 'views/modals/applicationCreate.html',
                size: 'lg',
                controller: 'NewApplicationCtrl as ctrl',
                resolve: function() {},
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

        function copyKey(apikey) {
            var msg = '<b>API key copied to clipboard!</b><br>' + apikey;
            toastService.info(msg);
        }

        function copyProvisionKey(provKey) {
            var msg = '<b>Provision key copied to clipboard!</b><br>' + provKey;
            toastService.info(msg);
        }

        function selectVersion(application, version) {
            application.selectedVersionIndex = _.indexOf(application.versions, version);
            // Make sure the contracts tab is collapsed when switching to a version without contracts
            if (application.versions[application.selectedVersionIndex].contracts.length === 0) {
                application.contractsExpanded = false;
            }
        }

    }

    /// ==== Marketplace Members Controller
    function marketMembersCtrl ($scope, $stateParams, memberData, requests, roleData, orgScreenModel,
                                EVENTS, memberHelper, memberService) {
        $scope.addMember = addMember;
        $scope.members = memberData;
        $scope.pendingRequests = requests;
        $scope.roles = roleData;
        $scope.orgScreenModel = orgScreenModel;
        orgScreenModel.updateTab('Members');
        orgScreenModel.getOrgDataForId(orgScreenModel, $stateParams.orgId);

        $scope.$on(EVENTS.MEMBER_LIST_UPDATED, function () {
            memberService.getMembersForOrg($scope.orgId).then(function (members) {
                $scope.members = members;
            })
        });

        function addMember() {
            memberHelper.addMember(orgScreenModel.organization, $scope.roles);
        }
    }

    /// ==== API Search Controller
    function apiSearchCtrl ($scope, $stateParams, svcData, headerModel) {
        headerModel.setIsButtonVisible(true, true, true);
        $scope.availableAPIs = svcData.beans;
        $scope.queryString = $stateParams.query;
    }

    /// ==== Dashboard Controller
    function dashboardCtrl ($scope, $state, svcData, categories, headerModel, toastService, apiService) {

        headerModel.setIsButtonVisible(false, true, true);
        $scope.currentSorting = 'Popular';
        $scope.currentPricing = 'All';
        $scope.availableAPIs = [];
        $scope.currentCategories = [];
        $scope.doSearch = doSearch;
        $scope.availableCategories = categories;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.getInitialDisplayMode = getInitialDisplayMode;
        $scope.toggleCategories = toggleCategories;
        $scope.isCategorySelected = isCategorySelected;
        $scope.clearSelectedCategories = clearSelectedCategories;

        populate(svcData.beans);

        function populate(apis) {
            $scope.availableAPIs = apis;
            checkMetricsPresent();
        }

        function checkMetricsPresent() {
            $scope.availableAPIs.forEach(function (api) {
                if (!api.marketInfo || !api.service.followers || !api.marketInfo.developers || !api.marketInfo.uptime) {
                    api.noMetrics = true;
                }
            })
        }

        function doSearch(query) {
            // if ($scope.currentCategories.length > 0) {
            //     apiService.searchMarketplaceApisInCategories($scope.currentCategories, query).then(function (results) {
            //         $scope.availableAPIs = results.beans;
            //     })
            // } else {
                apiService.searchMarketplaceApis(query).then(function (results) {
                    populate(results.beans);
                });
            // }
        }

        function getInitialDisplayMode() {
            if ($state.current.url === '/grid') {
                return 'Grid';
            } else {
                return 'List';
            }
        }

        function toggleCategories(category) {
            var index = $scope.currentCategories.indexOf(category);
            if (index > -1) {
                // Category was already selected, remove from array
                $scope.currentCategories.splice(index, 1);
            } else {
                // Category was not selected, add it to array
                $scope.currentCategories.push(category);
            }
            refreshServiceList();
        }

        function refreshServiceList() {
            if ($scope.currentCategories.length === 0) {
                apiService.getMarketplaceApis().then(function (data) {
                    populate(data.beans);
                });
            } else {
                // Get APIs for selected categories
                apiService.getMarketplaceApisInCategories($scope.currentCategories).then(function (data) {
                    populate(data);
                });
            }
        }

        function isCategorySelected(category) {
            if ($scope.currentCategories.length === 0) {
                // No filtering on category yet, show all buttons as enabled
                return true;
            } else {
                return $scope.currentCategories.indexOf(category) > -1;
            }
        }

        function clearSelectedCategories() {
            $scope.currentCategories = [];
            refreshServiceList();
        }

    }

    // #end
})();

