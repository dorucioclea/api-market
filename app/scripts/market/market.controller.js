;(function() {
    'use strict';

    angular.module('app.market', [])

    /// ==== MarketDash Controller
        .controller('MarketDashCtrl', marketDashCtrl)
        .controller('MarketMembersCtrl', marketMembersCtrl)
        .controller('ApiSearchCtrl', apiSearchCtrl)
        .controller('DashboardCtrl', dashboardCtrl);
    

    function marketDashCtrl ($scope, $uibModal, $state, $stateParams, orgData, orgScreenModel,
                             appData, appVersions, appVersionDetails, appContracts, headerModel, pendingContracts,
                             selectedApp, applicationManager, docTester, toastService, service,
                             ApplicationContract) {
        headerModel.setIsButtonVisible(true, false);
        orgScreenModel.updateOrganization(orgData);
        selectedApp.reset();
        docTester.reset();
        $scope.$state = $state;
        $scope.orgScreenModel = orgScreenModel;
        $scope.applications = appData;
        $scope.applicationVersions = appVersions;
        $scope.applicationVersionDetails = appVersionDetails;
        $scope.applicationContracts = appContracts;
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

        pendingContracts.forEach(function (contract) {
            $scope.pendingContracts = [];
            if ($scope.applicationVersions[contract.appId] && $scope.applicationVersions[contract.appId].version === contract.appVersion) {
                if (!$scope.pendingContracts[contract.appId]) $scope.pendingContracts[contract.appId] = [];
                contract.planDetails = angular.fromJson(contract.body);
                service.getVersion(contract.serviceOrg, contract.serviceId, contract.serviceVersion).then(function (svcVersion) {
                    contract.svcDetails = svcVersion;
                });
                $scope.pendingContracts[contract.appId].push(contract);
            }
        });

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
                if ($scope.applicationContracts.hasOwnProperty(application.id)) {
                    application.contractsExpanded = true;
                }
            });
        }

        function canCreateContract(appVersion) {
            return !!(appVersion.status === 'Created' || appVersion.status === 'Ready');
        }

        function canConfigureOAuth(appVersion) {
            return $scope.isNotRetired(appVersion) &&
                appVersionDetails[appVersion.id].oAuthClientId !== null &&
                appVersionDetails[appVersion.id].oAuthClientId.length > 0;
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
            $state.go('root.apis.list');
        }

        function toApiDoc(contract) {
            $state.go('root.api.documentation',
                ({orgId: contract.serviceOrganizationId,
                    svcId: contract.serviceId,
                    versionId: contract.serviceVersion}));
            docTester.setPreferredContract(contract);
        }

        function confirmDeleteApp(appVersion) {
            applicationManager.delete(appVersion.organizationId, appVersion.id, appVersion.name)
                .then(function (result) {
                    if (result === 'success') {
                        $state.forceReload();
                    }
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

        function breakContract(contract) {
            ApplicationContract.delete(
                {orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion,
                    contractId: contract.contractId},
                function (reply) {
                    $state.forceReload();
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
    function dashboardCtrl ($scope, $state, svcData, categories, headerModel, toastService,
                            SearchLatestServiceVersions, SearchLatestPublishedSvcsInCategories) {

        headerModel.setIsButtonVisible(false, true, true);
        $scope.currentSorting = 'Popular';
        $scope.currentPricing = 'All';
        $scope.availableAPIs = [];
        $scope.currentCategories = [];
        $scope.availableCategories = categories;
        $scope.svcStats = [];
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.getInitialDisplayMode = getInitialDisplayMode;
        $scope.toggleCategories = toggleCategories;
        $scope.isCategorySelected = isCategorySelected;
        $scope.clearSelectedCategories = clearSelectedCategories;


        init();

        function init() {
            $scope.availableAPIs = svcData.beans;
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
                SearchLatestServiceVersions.query({},
                    {filters: [{name: "status", value: "Published", operator: 'eq'}]}
                    , function (data) {
                        $scope.availableAPIs = data.beans;
                    });

            } else {
                // Get APIs for selected categories
                var selection = {};
                selection.categories = $scope.currentCategories;
                SearchLatestPublishedSvcsInCategories.query(selection, function (data) {
                    $scope.availableAPIs = data;
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

