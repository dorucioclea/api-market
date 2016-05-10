;(function(angular) {
    'use strict';

    angular.module('app.ctrl.dashboard', [])

        /// ==== MarketDash Controller
        .controller('MarketDashCtrl',
            function ($scope, $modal, $state, $stateParams, $timeout, orgData, orgScreenModel,
                      appData, appVersions, appVersionDetails, appContracts, headerModel,
                      selectedApp, applicationManager, docTester, toastService,
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
                    $modal.open({
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
            })

        /// ==== Marketplace Members Controller
        .controller('MarketMembersCtrl',
            function ($scope, $state, $modal, $stateParams, memberData, memberDetails, roleData, orgScreenModel,
                      toastService, TOAST_TYPES, memberHelper) {
                $scope.addMember = addMember;
                $scope.grantRoleToMember = grantRoleToMember;
                $scope.members = memberData;
                $scope.memberDetails = memberDetails;
                $scope.removeMember = removeMember;
                $scope.roles = roleData;
                $scope.transferOwnership = transferOwnership;

                orgScreenModel.updateTab('Members');
                orgScreenModel.getOrgDataForId(orgScreenModel, $stateParams.orgId);

                function addMember() {
                    memberHelper.addMember(orgScreenModel.organization, $scope.roles);
                }

                function grantRoleToMember(role, member) {
                    memberHelper.grantRoleToMember(orgScreenModel.organization, role, $scope.User.currentUser, member);
                }

                function removeMember(member) {
                    memberHelper.removeMember(orgScreenModel.organization, member);
                }

                function transferOwnership(member) {
                    memberHelper.transferOwnership(orgScreenModel.organization, $scope.User.currentUser, member);
                }
            })

        /// ==== API Search Controller
        .controller('ApiSearchCtrl',
            function($scope, $stateParams, svcData, headerModel) {
                headerModel.setIsButtonVisible(true, true, true);
                $scope.availableAPIs = [];
                $scope.queryString = $stateParams.query;

                angular.forEach(svcData.beans, function (data) {
                    $scope.availableAPIs.push(data);
                });
            })

        /// ==== Dashboard Controller
        .controller('DashboardCtrl',
            function($scope, $state, svcData, categories, headerModel, toastService, SearchLatestPublishedSvcsInCategories, SearchLatestServiceVersions) {
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
                    filterAPIVersions(svcData);
                }

                function getInitialDisplayMode() {
                    if ($state.current.url === '/grid') {
                        return 'Grid';
                    } else {
                        return 'List';
                    }
                }

                function filterAPIVersions(apis) {
                    angular.forEach(apis, function (api) {
                        $scope.availableAPIs.push(api)
                    });
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
                        // No categories selected, refresh all
                        SearchLatestServiceVersions.query({},
                            {filters: [{name: "status", value: "Published", operator: 'eq'}]}
                        , function (data) {
                            $scope.availableAPIs = data;
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
                        return 'btn-tag-primary';
                    } else {
                        var index = $scope.currentCategories.indexOf(category);
                        if (index > -1) {
                            // Category is enabled, show in primary color
                            return 'btn-tag-primary';
                        } else {
                            // Category not enabled, show in default color
                            return 'btn-tag-default';
                        }
                    }
                }

                function clearSelectedCategories() {
                    $scope.currentCategories = [];
                    refreshServiceList();
                }

            });

    // #end
})(window.angular);

