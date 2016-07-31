(function () {
    'use strict';

    angular.module('app.policies')
        .controller('PolicyDetailsCtrl', policyDetailsCtrl);


    function policyDetailsCtrl($scope, policy) {
        console.log(policy);
        $scope.policy = policy;
        $scope.modalClose = modalClose;

        function modalClose() {
            $scope.$close();	// this method is associated with $uibModal scope which is this.
        }
    }

})();
