;(function() {
  "use strict";


  angular.module("app.ctrl.dashboard", [])

    /// ==== MarketDash Controller
    .controller('MarketDashCtrl', ['$scope', '$modal', '$state', 'appData', 'appVersions', 'appContracts', 'selectedApp', 'ApplicationContract',
      function ($scope, $modal, $state, appData, appVersions, appContracts, selectedApp, ApplicationContract) {
        $scope.applications = appData;
        $scope.applicationVersions = appVersions;
        $scope.applicationContracts = appContracts;

        $scope.toggle = function (app) {
          app.contractsExpanded = !app.contractsExpanded;
        };

        $scope.canCreateContract = function (appVersion) {
          return !!(appVersion.status == 'Created' || appVersion.status == 'Ready');
        };

        $scope.canPublish = function (appVersion) {
          return appVersion.status == 'Ready';
        };

        $scope.canRetire = function (appVersion) {
          return appVersion.status == 'Registered'
        };

        $scope.newContract = function (appVersion) {
          console.log(appVersion);
          selectedApp.updateApplication(appVersion);
          $state.go('root.apis.grid');
        };

        $scope.breakContract = function (contract) {
          ApplicationContract.delete({orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion, contractId: contract.contractId}, function (reply) {
            $state.forceReload();
          })
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
      }])

/// ==== Dashboard Controller
    .controller("DashboardCtrl", ["$scope", "svcData", "categories", "SearchSvcsWithStatus", "SearchPublishedSvcsInCategories",
      function($scope, svcData, categories, SearchSvcsWithStatus, SearchPublishedSvcsInCategories) {

        $scope.currentSorting = 'Popular';
        $scope.currentPricing = 'All';

        console.log(svcData);
        console.log(categories);

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
            $scope.currentCategories.push(category)
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
            })
          }
        };


        $scope.isCategorySelected = function (category) {
          if ($scope.currentCategories.length == 0) {
            // No filtering on category yet, show all buttons as enabled
            return "btn-tag-primary"
          } else {
            var index = $scope.currentCategories.indexOf(category);
            if (index > -1) {
              // Category is enabled, show in primary color
              return "btn-tag-primary"
            } else {
              // Category not enabled, show in default color
              return "btn-tag-default"
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
})();

