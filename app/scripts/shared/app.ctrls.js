;(function() {
"use strict";


angular.module("app.ctrls", [])

// Root Controller
.controller("AppCtrl", ["$rootScope", "$scope", "$timeout", "$localStorage", function($rs, $scope, $timeout, $localStorage) {
	var mm = window.matchMedia("(max-width: 767px)");

    // ###TODO Remove preseeded data!###
    $scope.$storage = $localStorage;

    $scope.$storage.selectedOrg = {
      id: "FedEx",
      name: "FedEx",
      description: "Shipping company",
      createdBy: "admin",
      createdOn: 1439894816000,
      modifiedBy: "admin",
      modifiedOn: 1439894816000
    };

    $scope.$storage.selectedApp = {
      organization: {
        id: "FedEx",
        name: "FedEx",
        description: "Shipping company",
        createdBy: "admin",
        createdOn: 1439894816000,
        modifiedBy: "admin",
        modifiedOn: 1439894816000
      },
      id: "PackageTracker",
      name: "Package Tracker",
      description: "Will allow users to track packages and automatically receive shipping updates",
      createdBy: "admin",
      createdOn: 1439896404000
    };

    $scope.$storage.selectedAppVersion =   {
      organizationId: "FedEx",
      organizationName: "FedEx",
      id: "PackageTracker",
      name: "Package Tracker",
      description: "Will allow users to track packages and automatically receive shipping updates",
      status: "Created",
      version: "v1"
    };

    $scope.$storage.selectedSvc = {
      organizationId: "FedEx",
      organizationName: "FedEx",
      id: "PackageTrackingService",
      name: "Package Tracking Service",
      description: "Track your packages via tracking number",
      createdOn: 1439900026000
    };

    console.log('Reading from local storage: ' + $scope.$storage.selectedSvc);
    console.log('Reading from local storage: ' + $scope.$storage.selectedSvc.id);
    // ### End todo

	$rs.isMobile = mm.matches ? true: false;

	$rs.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};

	mm.addListener(function(m) {
		$rs.safeApply(function() {
			$rs.isMobile = (m.matches) ? true : false;
		});
	});

    $scope.currentCategories = [];

    $scope.availableCategories = [{ id: 0, name: "Location" },
    { id: 1, name: "Business" },
    { id: 2, name: "Social" },
    { id: 3, name: "Communication" },
    { id: 4, name: "Data" },
    { id: 5, name: "Other" } ];


	$scope.navFull = false;
	$scope.toggleNav = function() {
		$scope.navFull = $scope.navFull ? false : true;
		$rs.navOffCanvas = $rs.navOffCanvas ? false : true;
		console.log("navOffCanvas: " + $scope.navOffCanvas);

		$timeout(function() {
			$rs.$broadcast("c3.resize");
		}, 260);	// adjust this time according to nav transition
	};

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

    // ======= Site Settings
	$scope.toggleSettingsBox = function() {
		$scope.isSettingsOpen = $scope.isSettingsOpen ? false : true;
	};

	$scope.themeActive = "theme-zero";	// first theme

	$scope.fixedHeader = true;
	$scope.navHorizontal = false;	// this will access by other directive, so in rootScope.


	// === saving states
	var SETTINGS_STATES = "_setting-states";
	var statesQuery = {
		get : function() {
			return JSON.parse(localStorage.getItem(SETTINGS_STATES));
		},
		put : function(states) {
			localStorage.setItem(SETTINGS_STATES, JSON.stringify(states));
		}
	};

	// initialize the states
	var sQuery = statesQuery.get() || {
		navHorizontal: $scope.navHorizontal,
		fixedHeader: $scope.fixedHeader,
		//navFull: $scope.navFull,
		themeActive: $scope.themeActive
	};
	// console.log(savedStates);
	if(sQuery) {
		$scope.navHorizontal = sQuery.navHorizontal;
		$scope.fixedHeader = sQuery.fixedHeader;
		//$scope.navFull = sQuery.navFull;
		$scope.themeActive = sQuery.themeActive;
	}




	// putting the states
	$scope.onNavHorizontal = function() {
		sQuery.navHorizontal = $scope.navHorizontal;
		statesQuery.put(sQuery);
	};

	$scope.onNavFull = function() {
		sQuery.navFull = $scope.navFull;
		statesQuery.put(sQuery);

		$timeout(function() {
			$rs.$broadcast("c3.resize");
		}, 260);

	};

	$scope.onFixedHeader = function() {
		sQuery.fixedHeader = $scope.fixedHeader;
		statesQuery.put(sQuery);
	};

	$scope.onThemeActive = function() {
		sQuery.themeActive = $scope.themeActive;
		statesQuery.put(sQuery);
	};

	$scope.onThemeChange = function(theme) {
		$scope.themeActive = theme;
		$scope.onThemeActive();
	};



}])


.controller("HeadCtrl", ["$scope", "Fullscreen", function($scope, Fullscreen) {
	$scope.toggleFloatingSidebar = function() {
		$scope.floatingSidebar = $scope.floatingSidebar ? false : true;
		console.log("floating-sidebar: " + $scope.floatingSidebar);
	};

	$scope.goFullScreen = function() {
		if (Fullscreen.isEnabled())
        	Fullscreen.cancel();
      	else
         	Fullscreen.all()
	};


}])



/// ==== Dashboard Controller
.controller("DashboardCtrl", ["$scope", "svcData", function($scope, svcData) {

  $scope.currentSorting = 'Popular';
  $scope.currentPricing = 'All';

    console.log(svcData);
    console.log(svcData.beans);


  $scope.availableAPIs = [{ name: "Petstore", logoUrl: "images/yeoman.png", owner: "Swagger Team", ownerLogoUrl: "images/admin.jpg", pricing: "Free", users: 3234, followers: 232, uptimePercent: 100, description: 'Petstore swagger test API', tags: [1,4]},
    { name: "WeatherAPI", logoUrl: "images/yeoman.png", owner: "KMI", ownerLogoUrl: "images/sample/1.jpg", pricing: "Paid", users: 496, followers: 128, uptimePercent: 96, description: 'Returns weather forecasts for requested zip code', tags: [0,2]},
    { name: "Test API 1", logoUrl: "images/yeoman.png", owner: "Trust1Team", ownerLogoUrl: "images/sample/2.jpg", pricing: "Freemium", users: 3234, followers: 232, uptimePercent: 50, description: 'Test Description', tags: [0,2]},
    { name: "Google Experimental API with very long name", logoUrl: "images/yeoman.png", owner: "Google",  ownerLogoUrl: "images/sample/3.jpg", pricing: "FREE", users: 22, followers: 8, uptimePercent: 5, description: 'Google API', tags: [0,2]},
    { name: "Facebook Profile API", logoUrl: "images/yeoman.png", owner: "Facebook", ownerLogoUrl: "images/sample/4.jpg", pricing: "Freemium", users: 119320, followers: 9999, uptimePercent: 88, description: 'Test Description', tags: [0,2]}];
}]);

// #end
})();
