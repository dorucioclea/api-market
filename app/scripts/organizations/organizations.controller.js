(function () {
    'use strict';

    angular.module('app.organizations')
        .controller('MyOrganizationsCtrl', myOrganizationsCtrl)
        .controller('OrganizationsCtrl', organizationsCtrl);

    function myOrganizationsCtrl($scope, $modal, filterFilter, appOrgData, svcOrgData, orgService, toastService, headerModel) {

        $scope.toasts = toastService.toasts;
        $scope.orgService = orgService;
        $scope.toastService = toastService;
        $scope.modalNewOrganization = modalNewOrganization;

        init();

        function init() {
            headerModel.setIsButtonVisible(false, false, false);

            if ($scope.publisherMode) {
                $scope.orgs = svcOrgData;
                $scope.memberOrgs = svcOrgData;
            } else {
                $scope.orgs = appOrgData;
                $scope.memberOrgs = appOrgData;
            }
        }

        $scope.$watch('searchText', function (newVal) {
            $scope.filteredOrgs = filterFilter($scope.orgs, {name: newVal});
        });

        function modalNewOrganization() {
            $modal.open({
                templateUrl: 'views/modals/organizationCreate.html',
                size: 'lg',
                controller: 'NewOrganizationCtrl as ctrl',
                resolve: {
                    publisherMode: function () {
                        return $scope.publisherMode;
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

    }

    /// ==== Organizations Overview & Search Controller
        function organizationsCtrl($scope, appOrgData, svcOrgData, orgService, SearchOrgs) {

            $scope.doSearch = doSearch;
            $scope.orgService = orgService;
            init();

            function init() {
                if ($scope.publisherMode) {
                    $scope.memberOrgs = svcOrgData;
                } else {
                    $scope.memberOrgs = appOrgData;
                }
            }

            function doSearch(searchString) {
                var search = {};
                search.filters = [{name: 'name', value: '%' + searchString + '%', operator: 'like'}];
                search.orderBy = {ascending: true, name: 'name'};
                search.paging = {page: 1, pageSize: 100};

                SearchOrgs.save(search, function (results) {
                    $scope.totalOrgs = results.totalSize;
                    $scope.orgs = results.beans;
                });
            }
        }

})();

