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
            function ($scope, $state, $modal, $stateParams, adminData, toastService, TOAST_TYPES, adminHelper) {
                $scope.admins = adminData;
                console.log($scope.admins);
                $scope.addAdmin = addAdmin;
                $scope.removeAdmin = removeAdmin;
                function addAdmin() {
                    adminHelper.addAdmin('someadmin');
                }

                function removeAdmin(admin) {
                    adminHelper.removeAdmin(admin);
                }

            });
})(window.angular);
