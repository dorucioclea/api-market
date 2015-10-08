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
                $scope.isSelected = isSelected;
                $scope.toggle = toggle;
                $scope.closeAlert = alertService.closeAlert;

                $scope.selectedScopes = [];
                // Initially all requested scopes will be selected
                angular.forEach($scope.requestedScopes, function (value) {
                    $scope.selectedScopes.push(value);
                });
                $scope.appOAuthInfo = {};
                $scope.alerts = alertService.alerts;

                oAuthService.getAppOAuthInfo($stateParams.client_id,
                    $stateParams.org_id,
                    $stateParams.service_id,
                    $stateParams.version)
                    .then(function (value) {
                        $scope.appOAuthInfo = value;
                    });

                function toggle(scope) {
                    var found = false;
                    for (var i = 0; i < $scope.selectedScopes.length; i++) {
                        var selectedScope = $scope.selectedScopes[i];
                        if (selectedScope === scope) {
                            $scope.selectedScopes.splice(i,1);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        $scope.selectedScopes.push(scope);
                    }
                }

                function isSelected(scope) {
                    for (var i = 0; i < $scope.selectedScopes.length; i++) {
                        var selectedScope = $scope.selectedScopes[i];
                        if (selectedScope === scope) {
                            return true;
                        }
                    }
                    return false;
                }

                function doCancel() {
                    $window.location.href = $scope.appOAuthInfo.consumerResponse.redirectUri + '?error=cancelled';
                }
                function doGrant() {
                    alertService.resetAllAlerts();
                    oAuthService.grant(
                        $scope.appOAuthInfo.authorizationUrl,
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
