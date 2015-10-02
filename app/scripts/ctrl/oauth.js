;(function(angular) {
    'use strict';

    angular.module('app.ctrl.auth.oauth', [])

        .controller('OAuthCtrl', ['$scope', '$http', '$window','$stateParams', 'oAuthService',
            function ($scope, $http, $window, $stateParams, oAuthService) {
                $scope.requestedScopes = $stateParams.scopes.split(',');
                $scope.doCancel = doCancel;
                $scope.doGrant = doGrant;
                $scope.appOAuthInfo = {};
                oAuthService.getAppOAuthInfo($stateParams.client_id,
                    $stateParams.org_id,
                    $stateParams.service_id,
                    $stateParams.version)
                    .then(function (value) {
                        $scope.appOAuthInfo = value;
                    });

                function doCancel() {
                    $window.location.href = $scope.appOAuthInfo.consumerResponse.redirectUri + '?error=cancelled';
                }
                function doGrant() {
                    console.log('Granting...');
                    oAuthService.grant(
                        $stateParams.org_id,
                        $stateParams.service_id,
                        $stateParams.version,
                        $scope.appOAuthInfo.consumerResponse.clientId,
                        $scope.appOAuthInfo.consumerResponse.clientSecret,
                        $stateParams.response_type,
                        $stateParams.scopes,
                        $scope.appOAuthInfo.serviceProvisionKey,
                        $stateParams.authenticatedUserId
                    ).then(function (value) {
                            console.log(value);
                        });
                }
            }]);

    // #end
})(window.angular);
