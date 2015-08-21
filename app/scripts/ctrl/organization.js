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
.controller("OrganizationCtrl", ["$scope", "$localStorage", "$state", "$stateParams", "screenSize", "orgData", "Organization", "orgTab",
  function ($scope, $localStorage, $state, $stateParams, screenSize, orgData, Organization, orgTab) {

    $scope.$storage = $localStorage;
    $scope.$storage.selectedOrg = orgData;
    $scope.displayTab = orgTab;

    $scope.xs = screenSize.on('xs', function(match){
      $scope.xs = match;
    });

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
  .controller("PlansCtrl", ["$scope", "planData", "orgTab", function ($scope, planData, orgTab) {

    $scope.plans = planData;
    orgTab.updateTab('Plans');

  }])

  /// ==== Services Controller
  .controller("ServicesCtrl", ["$scope", "svcData", "orgTab", function ($scope, svcData, orgTab) {

    $scope.services = svcData;
    orgTab.updateTab('Services');


  }])

  /// ==== Applications Controller
  .controller("ApplicationsCtrl", ["$scope", "$location", "$modal", "appData", "orgTab",
    function ($scope, $location, $modal, appData, orgTab) {

      $scope.applications = appData;
      orgTab.updateTab('Applications');


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
  .controller("MembersCtrl", ["$scope", "memberData", "orgTab", function ($scope, memberData, orgTab) {

    $scope.members = memberData;
    orgTab.updateTab('Members');


  }]);
// +++ End Organization Screen Subcontrollers +++



  // #end
})();
