;(function(angular) {
    'use strict';

    angular.module('app.ctrl.dashboard', [])

      /// ==== MarketDash Controller
      .controller('MarketDashCtrl', ['$scope', '$modal', '$state', '$stateParams', '$timeout', 'orgData',
        'orgScreenModel', 'appData', 'appVersions', 'appVersionDetails', 'appContracts', 'headerModel', 'selectedApp', 'docTester',
        'toastService', 'TOAST_TYPES', 'ApplicationContract', 'ApplicationVersion',
      function ($scope, $modal, $state, $stateParams, $timeout, orgData, orgScreenModel,
                appData, appVersions, appVersionDetails, appContracts, headerModel, selectedApp, docTester,
                toastService, TOAST_TYPES, ApplicationContract, ApplicationVersion) {
          headerModel.setIsButtonVisible(true, false);
          orgScreenModel.updateOrganization(orgData);
          selectedApp.reset();
          docTester.reset();
          $scope.orgScreenModel = orgScreenModel;
          $scope.applications = appData;
          $scope.applicationVersions = appVersions;
          $scope.applicationVersionDetails = appVersionDetails;
          $scope.applicationContracts = appContracts;
          $scope.toasts = toastService.toasts;
          $scope.toastService = toastService;

          $scope.toggle = function (app) {
              app.contractsExpanded = !app.contractsExpanded;
          };

          $scope.canCreateContract = function (appVersion) {
              return !!(appVersion.status === 'Created' || appVersion.status === 'Ready');
          };

          $scope.canConfigureOAuth = function (appVersion) {
              return $scope.canCreateContract(appVersion) &&
                  appVersionDetails[appVersion.id].oAuthClientId !== null &&
                  appVersionDetails[appVersion.id].oAuthClientId.length > 0;
          };

          $scope.canPublish = function (appVersion) {
              return appVersion.status === 'Ready';
          };

          $scope.canRetire = function (appVersion) {
              return appVersion.status === 'Registered';
          };

          $scope.newContract = function (appVersion) {
              selectedApp.updateApplication(appVersion);
              $state.go('root.apis.grid');
          };

          $scope.toApiDoc = function (contract) {
              $state.go('root.api.documentation',
                ({orgId: contract.serviceOrganizationId,
                  svcId: contract.serviceId,
                  versionId: contract.serviceVersion}));
              docTester.setPreferredContract(contract);
          };

          $scope.confirmPublishApp = function (appVersion) {
              ApplicationVersion.get(
                {orgId: appVersion.organizationId, appId: appVersion.id, versionId: appVersion.version},
                function (reply) {
                  $modal.open({
                      templateUrl: 'views/modals/modalPublishApplication.html',
                      size: 'lg',
                      controller: 'PublishApplicationCtrl as ctrl',
                      resolve: {
                          appVersion: function () {
                              return reply;
                          },
                          appContracts: function () {
                              return $scope.applicationContracts[appVersion.id];
                          }
                      },
                      windowClass: $scope.modalAnim	// Animation Class put here.
                  });
              });
          };

          $scope.confirmRetireApp = function (appVersion) {
              ApplicationVersion.get(
                {orgId: appVersion.organizationId, appId: appVersion.id, versionId: appVersion.version},
                function (reply) {
                  $modal.open({
                      templateUrl: 'views/modals/modalRetireApplication.html',
                      size: 'lg',
                      controller: 'RetireApplicationCtrl as ctrl',
                      resolve: {
                          appVersion: function () {
                              return reply;
                          },
                          appContracts: function () {
                              return $scope.applicationContracts[appVersion.id];
                          }
                      },
                      windowClass: $scope.modalAnim	// Animation Class put here.
                  });
              });
          };

          $scope.toMetrics = function (appVersion) {
              $state.go('root.application.metrics',
                {orgId: appVersion.organizationId, appId: appVersion.id, versionId: appVersion.version});
          };

          $scope.showOAuthConfig = function (appVersion) {
              $modal.open({
                  templateUrl: 'views/modals/modalOAuthConfig.html',
                  size: 'lg',
                  controller: 'OAuthConfigCtrl as ctrl',
                  resolve: {
                      appVersionDetails: function () {
                          return $scope.applicationVersionDetails[appVersion.id];
                      }
                  },
                  windowClass: $scope.modalAnim	// Animation Class put here.
              });
          };

          $scope.breakContract = function (contract) {
              ApplicationContract.delete(
                {orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion,
                  contractId: contract.contractId},
                function (reply) {
                  $state.forceReload();
              });
          };

          $scope.modalNewApplication = function() {
              $modal.open({
                  templateUrl: 'views/modals/modalNewApplication.html',
                  size: 'lg',
                  controller: 'NewApplicationCtrl as ctrl',
                  resolve: function() {},
                  windowClass: $scope.modalAnim	// Animation Class put here.
              });

          };

          $scope.copyKey = function (apikey) {
              var type = TOAST_TYPES.INFO;
              var msg = '<b>Key copied to clipboard!</b><br>' + apikey;
              toastService.createToast(type, msg, true);
          };
      }])

/// ==== Dashboard Controller
    .controller('DashboardCtrl', ['$scope', 'svcData', 'categories', 'headerModel',
      'SearchSvcsWithStatus', 'SearchPublishedSvcsInCategories', 'ServiceMarketInfo',
      function($scope, svcData, categories, headerModel,
               SearchSvcsWithStatus, SearchPublishedSvcsInCategories, ServiceMarketInfo) {
          headerModel.setIsButtonVisible(false, true);
          $scope.currentSorting = 'Popular';
          $scope.currentPricing = 'All';
          $scope.availableAPIs = [];
          $scope.currentCategories = [];
          $scope.availableCategories = categories;
          $scope.svcStats = [];

          var filterAPIVersions = function (apis) {
              angular.forEach(apis, function (api) {
                  var found = false;
                  for (var i = 0; i < $scope.availableAPIs.length; i++) {
                      if ($scope.availableAPIs[i].service.id === api.service.id) {
                          found = true;
                          // Service already has a version in the array, check if this one is newer
                          if ($scope.availableAPIs[i].createdOn < api.createdOn) {
                              // Newer, so replace the existing version with this one
                              $scope.availableAPIs[i] = api;
                          }
                          break;
                      }
                  }
                  // If after going through the entire array we have not found a service with this ID, add it.
                  if (!found) {
                      $scope.availableAPIs.push(api);
                  }
              });
          };
          filterAPIVersions(svcData);

          var getStats = function (svc) {
              ServiceMarketInfo.get({
                  orgId: svc.service.organization.id,
                  svcId: svc.service.id,
                  versionId: svc.version
              }, function (stats) {
                  $scope.svcStats[svc.service.id] = stats;
              });
          };

          angular.forEach(svcData, function (svc) {
              getStats(svc);
          });

          $scope.toggleCategories = function(category) {
              var index = $scope.currentCategories.indexOf(category);
              if (index > -1) {
                  // Category was already selected, remove from array
                  $scope.currentCategories.splice(index, 1);
              } else {
                  // Category was not selected, add it to array
                  $scope.currentCategories.push(category);
              }
              refreshServiceList();
          };

          var refreshServiceList = function () {
              if ($scope.currentCategories.length === 0) {
                  // No categories selected, refresh all
                  SearchSvcsWithStatus.query({status: 'Published'}, function (data) {
                      $scope.availableAPIs = data;
                  });
              } else {
                  // Get APIs for selected categories
                  var selection = {};
                  selection.categories = $scope.currentCategories;
                  SearchPublishedSvcsInCategories.query(selection, function (data) {
                      $scope.availableAPIs = data;
                  });
              }
          };

          $scope.isCategorySelected = function (category) {
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
          };

          $scope.clearSelectedCategories = function() {
              $scope.currentCategories = [];
              refreshServiceList();
          };

      }]);

    // #end
})(window.angular);

