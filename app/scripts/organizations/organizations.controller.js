(function () {
    'use strict';

    angular.module('app.organizations', [])
        .controller('MyOrganizationsCtrl', myOrganizationsCtrl)
        .controller('OrganizationsCtrl', organizationsCtrl);

    function myOrganizationsCtrl($scope, $modal, appOrgData, svcOrgData, orgService, toastService, headerModel) {

        $scope.toasts = toastService.toasts;
        $scope.orgService = orgService;
        $scope.toastService = toastService;
        $scope.modalNewOrganization = modalNewOrganization;

        init();

        function init() {
            headerModel.setIsButtonVisible(false, false, false);

            if ($scope.publisherMode) {
                $scope.orgs = svcOrgData;
            } else {
                $scope.orgs = appOrgData;
            }
            console.log($scope.orgs);
        }

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
        function organizationsCtrl($scope, orgService, Organization, SearchOrgs, CurrentUserAppOrgs, CurrentUserSvcOrgs,RequestMembership,toastService, TOAST_TYPES) {

            $scope.isMember = isMember;
            $scope.doSearch = doSearch;
            $scope.orgService = orgService;
            $scope.requestMembership = requestMembership;

            var userOrgIds = null;

            function isMember(org) {
                return userOrgIds.indexOf(org.id) > -1;
            }

            function requestMembership(org){
                RequestMembership.save({orgId:org.id},{}, function (reply) {
                    toastService.createToast(TOAST_TYPES.INFO, 'Mail notification has been sent to the organization owners. Wait for approval.', true);
                });
            }

            function doSearch(searchString) {
                if (userOrgIds === null) {
                    userOrgIds = [];
                    if ($scope.publisherMode) {
                        CurrentUserSvcOrgs.query({}, function (reply) {
                            addOrgs(reply);
                        });
                    } else {
                        CurrentUserAppOrgs.query({}, function (reply) {
                            addOrgs(reply);
                        });
                    }

                }

                var addOrgs = function (reply) {
                    angular.forEach(reply, function (org) {
                        userOrgIds.push(org.id);
                    });

                };

                var search = {};
                search.filters = [{name: 'name', value: '%' + searchString + '%', operator: 'like'}];
                search.orderBy = {ascending: true, name: 'name'};
                search.paging = {page: 1, pageSize: 100};

                SearchOrgs.save(search, function (results) {
                    $scope.totalOrgs = results.totalSize;
                    $scope.orgs = results.beans;
                    console.log($scope.orgs);
                });
            }
        }

})();

