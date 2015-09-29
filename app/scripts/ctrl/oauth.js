;(function(angular) {
    'use strict';

    angular.module('app.ctrl.auth.oauth', [])

        .controller('OAuthCtrl', ['$scope', function ($scope) {
            $scope.doCancel = doCancel;
            $scope.doGrant = doGrant;

            function doCancel() {
                console.log('Canceling...');
                window.history.back();
                //TODO what happens when a user cancels?
            }
            function doGrant() {
                console.log('Granting...');
            }
        }]);

    // #end
})(window.angular);
