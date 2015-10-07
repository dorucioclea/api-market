;(function(angular) {
    'use strict';

    angular.module('app.ctrl.auth.oauth', [])

        .controller('OAuthCtrl', ['$scope', '$http', '$window','$stateParams', 'oAuthService',
            'alertService', 'ALERT_TYPES',
            function ($scope, $http, $window, $stateParams, oAuthService,
                      alertService, ALERT_TYPES) {
                alertService.resetAllAlerts();
                $scope.isValid = false;
                if ($stateParams.scopes) {
                    $scope.requestedScopes = $stateParams.scopes.split(',');
                    $scope.isValid = true;
                } else {
                    $scope.requestedScopes = [];
                }
                $scope.doCancel = doCancel;
                $scope.doGrant = doGrant;
                $scope.closeAlert = alertService.closeAlert;

                $scope.appOAuthInfo = {};
                $scope.alerts = alertService.alerts;
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
                    alertService.resetAllAlerts();
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
                            $window.location.go(value.data.redirect_uri);
                        }, function (error) {
                            alertService.addAlert(ALERT_TYPES.DANGER,
                                '<b>Uh-oh...</b> Something went wrong, we could not complete the grant process.');
                        });
                }
            }]);

    // #end
})(window.angular);
