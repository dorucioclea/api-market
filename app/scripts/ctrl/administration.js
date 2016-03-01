;(function(angular) {
    'use strict';

    angular.module('app.ctrl.administration', [])

        /// ==== Administration Controller
        .controller('AdministrationCtrl',
            function ($scope, $state, $stateParams, screenSize, toastService, TOAST_TYPES) {

                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.xs = screenSize.on('xs', function(match) {
                    $scope.xs = match;
                });
            })

        /// ==== Members Controller
        .controller('AdminStatusCtrl',
            function ($scope, $state, $modal, $stateParams, toastService, TOAST_TYPES) {

            })

        /// ==== Members Controller
        .controller('AdminUsersCtrl',
            function ($scope, $state, $modal, $stateParams, toastService, TOAST_TYPES) {
/*                $scope.addMember = addMember;
                $scope.grantRoleToMember = grantRoleToMember;
                $scope.members = memberData;
                $scope.memberDetails = memberDetails;
                $scope.removeMember = removeMember;
                $scope.roles = roleData;
                $scope.transferOwnership = transferOwnership;

                orgScreenModel.updateTab('Members');

                function addMember() {
                    memberHelper.addMember($scope.org, $scope.roles);
                }

                function grantRoleToMember(role, member) {
                    memberHelper.grantRoleToMember($scope.org, role, $scope.User.currentUser, member);
                }

                function removeMember(member) {
                    memberHelper.removeMember($scope.org, member);
                }

                function transferOwnership(member) {
                    memberHelper.transferOwnership($scope.org, $scope.User.currentUser, member);
                }*/

            });
})(window.angular);
