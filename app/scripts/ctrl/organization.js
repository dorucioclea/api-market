;(function() {
  "use strict";


angular.module("app.ctrl.organization", [])

  /// ==== Organizations Overview & Search Controller
  .controller("OrganizationsCtrl", ["$scope", "Organization", "SearchOrgs",
    function ($scope, Organization, SearchOrgs) {

      $scope.doSearch = function (searchString) {
        var search = {};
        search.filters = [ { name: "name", value: searchString, operator: "like" }];
        search.orderBy = { ascending: true, name: "name"};
        search.paging = { page: 1, pageSize: 100};

        SearchOrgs.save(search, function (results) {
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
.controller("OrganizationCtrl", ["$scope", "$state", "$stateParams", "screenSize", "orgData", "Organization", "orgScreenModel",
  function ($scope, $state, $stateParams, screenSize, orgData, Organization, orgScreenModel) {

    $scope.displayTab = orgScreenModel;
    orgScreenModel.updateOrganization(orgData);
    $scope.org = orgData;

    $scope.xs = screenSize.on('xs', function(match){
      $scope.xs = match;
    });

    $scope.updateOrgDescription = function () {
      var updatedOrg = new Organization();
      updatedOrg.description = $scope.org.description;
      updatedOrg.$update({id: $stateParams.orgId}, function(data) {
        $state.forceReload();
      });
    }

  }])

  // +++ Organization Screen Subcontrollers +++
  /// ==== Plans Controller
  .controller("PlansCtrl", ["$scope", "$state", "$modal", "planData", "orgScreenModel", "PlanVersion",
    function ($scope, $state, $modal, planData, orgScreenModel, PlanVersion) {

    $scope.plans = planData;
    orgScreenModel.updateTab('Plans');
    $scope.modalAnim = "default";

    $scope.goToPlan = function (plan) {
      PlanVersion.query({orgId: plan.organizationId, planId: plan.id}, function (versions) {
        $state.go('plan.overview', {orgId: plan.organizationId, planId: plan.id, versionId: versions[0].version})
      })
    };

    $scope.modalNewPlan = function() {
      $modal.open({
        templateUrl: "views/modals/modalNewPlan.html",
        size: "lg",
        controller: "NewPlanCtrl as ctrl",
        resolve: function() {},
        windowClass: $scope.modalAnim	// Animation Class put here.
      });

    };

  }])

  /// ==== Services Controller
  .controller("ServicesCtrl", ["$scope", "$modal", "svcData", "orgScreenModel", function ($scope, $modal, svcData, orgScreenModel) {

    $scope.services = svcData;
    orgScreenModel.updateTab('Services');


    $scope.modalAnim = "default";

    $scope.modalNewService = function() {
      $modal.open({
        templateUrl: "views/modals/modalNewService.html",
        size: "lg",
        controller: "NewServiceCtrl as ctrl",
        resolve: function() {},
        windowClass: $scope.modalAnim	// Animation Class put here.
      });

    };


  }])

  /// ==== Applications Controller
  .controller("ApplicationsCtrl", ["$scope", "$modal", "appData", "orgScreenModel",
    function ($scope, $modal, appData, orgScreenModel) {

      $scope.applications = appData;
      orgScreenModel.updateTab('Applications');


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
  .controller("MembersCtrl", ["$scope", "memberData", "orgScreenModel", function ($scope, memberData, orgScreenModel) {

    $scope.members = memberData;
    orgScreenModel.updateTab('Members');


  }]);
// +++ End Organization Screen Subcontrollers +++



  // #end
})();
