;(function() {
  "use strict";


angular.module("app.ctrl.organization", [])

  /// ==== Organizations Overview & Search Controller
  .controller("OrganizationsCtrl", ["$scope", "$localStorage", "$timeout", "Organization", "SearchOrgs",
    function ($scope, $localStorage, $timeout, Organization, SearchOrgs) {

      $scope.$storage = $localStorage;

      $scope.doSearch = function (searchString) {
        console.log(searchString);
        var search = {};
        search.filters = [ { name: "name", value: searchString, operator: "like" }];
        search.orderBy = { ascending: true, name: "name"};
        search.paging = { page: 1, pageSize: 100};
        console.log(search);

        SearchOrgs.save(search, function (results) {
          console.log(results);
          $scope.totalOrgs = results.totalSize;
          $scope.orgs = results.beans;
        })
      };
    }])

  /// ==== MyOrganizations Overview Controller
  .controller("MyOrganizationsCtrl", ["$scope", "$modal", "appOrgData",
    function ($scope, $modal, appOrgData) {

      $scope.orgs = appOrgData;

      $scope.modalAnim = "default";

      $scope.modalNewOrganization = function() {
        $modal.open({
          templateUrl: "views/modals/modalNewOrganization.html",
          size: "lg",
          controller: "NewOrganizationCtrl as ctrl",
          resolve: function() {},
          windowClass: $scope.modalAnim	// Animation Class put here.
        });

      };

    }])


/// ==== Organization Controller
.controller("OrganizationCtrl", ["$scope", "$localStorage", "$state", "$stateParams", "screenSize", "orgData", "Organization",
  function ($scope, $localStorage, $state, $stateParams, screenSize, orgData, Organization) {

    $scope.$storage = $localStorage;
    $scope.$storage.selectedOrg = orgData;

    $scope.xs = screenSize.on('xs', function(match){
      $scope.xs = match;
    });

    $scope.switchTab = function (tabId) {
      $scope.$storage.orgScreen.activeTab = tabId;
    };

    $scope.isTabActive = function (tabId) {
      return $scope.$storage.orgScreen.activeTab === tabId;
    };

    $scope.updateOrgDescription = function () {
      var updatedOrg = new Organization();
      updatedOrg.description = $scope.$storage.selectedOrg.description;
      updatedOrg.$update({id: $scope.$storage.selectedOrg.id}, function(data) {
        $state.forceReload();
      });
    }

  }])

  // +++ Organization Screen Subcontrollers +++
  /// ==== Plans Controller
  .controller("PlansCtrl", ["$scope", "$localStorage", "Plan", function ($scope, $localStorage, Plan) {

    $scope.$storage = $localStorage;

    Plan.query({orgId: $scope.$storage.selectedOrg.id}, function (data) {
      $scope.plans = data;
    });

  }])

  /// ==== Services Controller
  .controller("ServicesCtrl", ["$scope", "$localStorage", "Service", function ($scope, $localStorage, Service) {

    $scope.$storage = $localStorage;

    Service.query({orgId: $scope.$storage.selectedOrg.id}, function (data) {
      $scope.services = data;
    });

  }])

  /// ==== Applications Controller
  .controller("ApplicationsCtrl", ["$scope", "$localStorage", "$location", "$modal", "$timeout", "Application",
    function ($scope, $localStorage, $location, $modal, $timeout, Application) {

      $scope.$storage = $localStorage;

      Application.query({orgId: $scope.$storage.selectedOrg.id}, function (data) {
        $scope.applications = data;
        console.log(data);
      });

      $scope.modalAnim = "default";

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

  /// ==== Members Controller
  .controller("MembersCtrl", ["$scope", "$localStorage", "Member", function ($scope, $localStorage, Member) {

    $scope.$storage = $localStorage;

    Member.query({orgId: $scope.$storage.selectedOrg.id}, function (data) {
      $scope.members = data;
    });

  }]);
// +++ End Organization Screen Subcontrollers +++



  // #end
})();
