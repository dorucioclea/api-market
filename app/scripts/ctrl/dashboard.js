;(function() {
  "use strict";


  angular.module("app.ctrl.dashboard", [])

/// ==== Dashboard Controller
    .controller("DashboardCtrl", ["$scope", "svcData", "categories", function($scope, svcData, categories) {

      $scope.currentSorting = 'Popular';
      $scope.currentPricing = 'All';

      console.log(svcData);
      console.log(categories);

      $scope.currentCategories = [];

      $scope.availableCategories = categories;


      $scope.toggleCategories = function(category) {
        var index = $scope.currentCategories.indexOf(category.id);
        if (index > -1) {
          // Category was already selected, remove from array
          $scope.currentCategories.splice(index, 1);
        } else {
          // Category was not selected, add id to array
          $scope.currentCategories.push(category.id)
        }
      };


      $scope.isCategorySelected = function (category) {
        if ($scope.currentCategories.length == 0) {
          // No filtering on category yet, show all buttons as enabled
          return "btn-tag-primary"
        } else {
          var index = $scope.currentCategories.indexOf(category.id);
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
      };

      $scope.availableAPIs = [{ name: "Petstore", logoUrl: "images/yeoman.png", owner: "Swagger Team", ownerLogoUrl: "images/admin.jpg", pricing: "Free", users: 3234, followers: 232, uptimePercent: 100, description: 'Petstore swagger test API', tags: [1,4]},
        { name: "WeatherAPI", logoUrl: "images/yeoman.png", owner: "KMI", ownerLogoUrl: "images/sample/1.jpg", pricing: "Paid", users: 496, followers: 128, uptimePercent: 96, description: 'Returns weather forecasts for requested zip code', tags: [0,2]},
        { name: "Test API 1", logoUrl: "images/yeoman.png", owner: "Trust1Team", ownerLogoUrl: "images/sample/2.jpg", pricing: "Freemium", users: 3234, followers: 232, uptimePercent: 50, description: 'Test Description', tags: [0,2]},
        { name: "Google Experimental API with very long name", logoUrl: "images/yeoman.png", owner: "Google",  ownerLogoUrl: "images/sample/3.jpg", pricing: "FREE", users: 22, followers: 8, uptimePercent: 5, description: 'Google API', tags: [0,2]},
        { name: "Facebook Profile API", logoUrl: "images/yeoman.png", owner: "Facebook", ownerLogoUrl: "images/sample/4.jpg", pricing: "Freemium", users: 119320, followers: 9999, uptimePercent: 88, description: 'Test Description', tags: [0,2]}];
    }]);

  // #end
})();

