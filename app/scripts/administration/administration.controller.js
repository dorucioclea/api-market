;(function() {
    'use strict';

    angular.module('app.administration', [])
        .controller('AdministrationCtrl', administrationCtrl)
        .controller('AdminStatusCtrl', adminStatusCtrl)
        .controller('AdminUsersCtrl', adminUsersCtrl);

    /// ==== Administration Controller
    function administrationCtrl($scope, $state, $stateParams, screenSize, toastService, TOAST_TYPES) {

        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.xs = screenSize.on('xs', function(match) {
            $scope.xs = match;
        });
    }

    /// ==== Members Controller
    function adminStatusCtrl($scope, $state, $modal, $stateParams, toastService, TOAST_TYPES) {

    }

    /// ==== Members Controller
    function adminUsersCtrl($scope, $state, $modal, $stateParams, adminData, toastService, TOAST_TYPES, adminHelper) {
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

    }
})();
