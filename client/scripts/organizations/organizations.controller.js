(function () {
    'use strict';

    angular.module('app.organizations')

        .controller('MyOrganizationsCtrl', myOrganizationsCtrl)
        .controller('OrganizationsCtrl', organizationsCtrl)
        .controller('OrgDeleteCtrl', orgDeleteCtrl)
        .controller('OrgEditCtrl', orgEditCtrl);

    function myOrganizationsCtrl($scope, $stateParams, $uibModal, filterFilter, appOrgData, toastService, headerModel) {

        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.modalNewOrganization = modalNewOrganization;

        init();

        function init() {
            headerModel.setIsButtonVisible(false, false, false);

            $scope.orgs = appOrgData;
            $scope.orgs.forEach(function (org) {
                org.isMember = true;
            });

            if ($stateParams.mode && $stateParams.mode === 'create') {
                modalNewOrganization();
            }
        }

        $scope.$watch('searchText', function (newVal) {
            $scope.filteredOrgs = filterFilter($scope.orgs, {name: newVal});
        });

        function modalNewOrganization() {
            $uibModal.open({
                templateUrl: 'views/modals/organizationCreate.html',
                size: 'lg',
                controller: 'NewOrganizationCtrl as ctrl',
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

    }

    function organizationsCtrl($scope, appOrgData, orgs, pendingOrgs, orgService, toastService, _) {

        $scope.doSearch = doSearch;
        $scope.orgNameRegex = '\\w+';
        init();

        function init() {
            $scope.memberOrgs = appOrgData;
            $scope.pendingOrgs = pendingOrgs;
            $scope.orgs = processResults(orgs.beans);
            $scope.totalOrgs = orgs.totalSize;
        }

        function doSearch(searchString) {

            orgService.search(searchString).then(function (results) {
                $scope.totalOrgs = results.totalSize;
                results.beans.forEach(function (org) {
                    for (var i = 0; i < $scope.memberOrgs.length; i++) {
                        if ($scope.memberOrgs[i].id === org.id) {
                            org.isMember = true;
                        }
                    }
                    if(typeof pendingOrgs !== "undefined"){
                        for (var j = 0; j < $scope.pendingOrgs.length; j++) {
                            if ($scope.pendingOrgs[j].id === org.id) {
                                org.requestPending = true;
                            }
                        }
                    }
                });
                $scope.orgs = processResults(results.beans);
            }, function (error) {
                toastService.warning('<b>Could not complete search!</b><br><span class="small">An error occurred while executing the search. Please try again later.</span>');
            });
        }

        function processResults(orgs) {
            var processedOrgs = _.differenceWith(orgs, $scope.memberOrgs, function (a, b) {
                return a.id === b.id;
            });
            processedOrgs.forEach(function (org) {
                // check for pending membership
                for (var j = 0; j < $scope.pendingOrgs.length; j++){
                    if ($scope.pendingOrgs[j].id === org.id) {
                        org.requestPending = true;
                        break;
                    }
                }
            });
            return processedOrgs;
        }
    }

    function orgDeleteCtrl($scope, $uibModalInstance, org) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.org = org;

        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function ok() {
            $uibModalInstance.close();
        }
    }

    function orgEditCtrl($scope, $uibModalInstance, org) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.org = org;

        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function ok() {
            $uibModalInstance.close($scope.org);
        }
    }

})();

