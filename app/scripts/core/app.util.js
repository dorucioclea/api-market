(function () {
    'use strict';

    angular.module('app.core.util', [])
        .controller('ErrorModalCtrl', errorModalCtrl)
        .service('errorHelper', errorHelper);


    function errorModalCtrl($scope, $uibModalInstance, code, msg) {
        $scope.close = close;
        $scope.code = code;
        $scope.msg = msg;

        function close() {
            $uibModalInstance.dismiss();
        }
    }

    function errorHelper($uibModal, $rootScope, EVENTS) {
        // this.showErrorModal = showErrorModal;
        this.showLoginErrorModal = showLoginErrorModal;

        $rootScope.$on(EVENTS.MAINTENANCE_MODE_ERROR, function (event, args) {
            showErrorModal(args.code, args.msg);
        });

        function showErrorModal(code, msg) {
            $uibModal.open({
                templateUrl: 'views/modals/errors/maintenance.html',
                size: 'lg',
                controller: 'ErrorModalCtrl',
                resolve: {
                    code: function () {
                        return code;
                    },
                    msg: function () {
                        return msg;
                    }
                },
                windowClass: 'error-modal warning'
            });
        }

        function showLoginErrorModal(code, msg) {
            $uibModal.open({
                templateUrl: 'views/modals/errors/maintenanceLogin.html',
                size: 'lg',
                controller: 'ErrorModalCtrl',
                resolve: {
                    code: function () {
                        return code;
                    },
                    msg: function () {
                        return msg;
                    }
                },
                windowClass: 'error-modal'
            });
        }
    }

}());
