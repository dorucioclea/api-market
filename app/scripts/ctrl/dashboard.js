;(function(angular) {
  "use strict";


  angular.module("app.ctrl.dashboard", [])

    /// ==== MarketDash Controller
    .controller('MarketDashCtrl', ['$scope', '$modal', '$state', '$stateParams', '$timeout', 'orgScreenModel',
      'appData', 'appVersions', 'appContracts', 'headerModel', 'selectedApp',
      'toastService', 'TOAST_TYPES', 'ApplicationContract', 'ApplicationVersion',
      function ($scope, $modal, $state, $stateParams, $timeout, orgScreenModel,
                appData, appVersions, appContracts, headerModel, selectedApp,
                toastService, TOAST_TYPES, ApplicationContract, ApplicationVersion) {
        headerModel.setIsButtonVisible(true, false);
        orgScreenModel.getOrgDataForId(orgScreenModel, $stateParams.orgId);
        $scope.orgScreenModel = orgScreenModel;
        $scope.applications = appData;
        $scope.applicationVersions = appVersions;
        $scope.applicationContracts = appContracts;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;

        $scope.toggle = function (app) {
          app.contractsExpanded = !app.contractsExpanded;
        };

        $scope.canCreateContract = function (appVersion) {
          return !!(appVersion.status === 'Created' || appVersion.status === 'Ready');
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

        $scope.confirmPublishApp = function (appVersion) {
          ApplicationVersion.get({orgId: appVersion.organizationId, appId: appVersion.id, versionId: appVersion.version}, function (reply) {
            $modal.open({
              templateUrl: "views/modals/modalPublishApplication.html",
              size: "lg",
              controller: "PublishApplicationCtrl as ctrl",
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
          ApplicationVersion.get({orgId: appVersion.organizationId, appId: appVersion.id, versionId: appVersion.version}, function (reply) {
            $modal.open({
              templateUrl: "views/modals/modalRetireApplication.html",
              size: "lg",
              controller: "RetireApplicationCtrl as ctrl",
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
          $state.go('root.application.metrics', {orgId: appVersion.organizationId, appId: appVersion.id, versionId: appVersion.version});
        };

        $scope.breakContract = function (contract) {
          ApplicationContract.delete({orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion, contractId: contract.contractId}, function (reply) {
            $state.forceReload();
          });
        };

        $scope.modalNewApplication = function() {
          $modal.open({
            templateUrl: "views/modals/modalNewApplication.html",
            size: "lg",
            controller: "NewApplicationCtrl as ctrl",
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
    .controller("DashboardCtrl", ["$scope", "svcData", "categories", "headerModel", "SearchSvcsWithStatus", "SearchPublishedSvcsInCategories",
      function($scope, svcData, categories, headerModel, SearchSvcsWithStatus, SearchPublishedSvcsInCategories) {
        headerModel.setIsButtonVisible(false, true);
        $scope.currentSorting = 'Popular';
        $scope.currentPricing = 'All';
        $scope.availableAPIs = svcData;

        $scope.currentCategories = [];

        $scope.availableCategories = categories;


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
            return "btn-tag-primary";
          } else {
            var index = $scope.currentCategories.indexOf(category);
            if (index > -1) {
              // Category is enabled, show in primary color
              return "btn-tag-primary";
            } else {
              // Category not enabled, show in default color
              return "btn-tag-default";
            }
          }
        };

        $scope.clearSelectedCategories = function() {
          $scope.currentCategories = [];
          refreshServiceList();
        };

        //$scope.availableAPIs = [{ name: "Petstore", logoUrl: "images/yeoman.png", owner: "Swagger Team", ownerLogoUrl: "images/admin.jpg", pricing: "Free", users: 3234, followers: 232, uptimePercent: 100, description: 'Petstore swagger test API', tags: [1,4]},
        //  { name: "WeatherAPI", logoUrl: "images/yeoman.png", owner: "KMI", ownerLogoUrl: "images/sample/1.jpg", pricing: "Paid", users: 496, followers: 128, uptimePercent: 96, description: 'Returns weather forecasts for requested zip code', tags: [0,2]},
        //  { name: "Test API 1", logoUrl: "images/yeoman.png", owner: "Trust1Team", ownerLogoUrl: "images/sample/2.jpg", pricing: "Freemium", users: 3234, followers: 232, uptimePercent: 50, description: 'Test Description', tags: [0,2]},
        //  { name: "Google Experimental API with very long name", logoUrl: "images/yeoman.png", owner: "Google",  ownerLogoUrl: "images/sample/3.jpg", pricing: "FREE", users: 22, followers: 8, uptimePercent: 5, description: 'Google API', tags: [0,2]},
        //  { name: "Facebook Profile API", logoUrl: "images/yeoman.png", owner: "Facebook", ownerLogoUrl: "images/sample/4.jpg", pricing: "Freemium", users: 119320, followers: 9999, uptimePercent: 88, description: 'Test Description', tags: [0,2]}];
      }]);

  // #end
})(window.angular);

