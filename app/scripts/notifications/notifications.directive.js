(function () {
    'use strict';

    angular.module('app.notifications')
        .directive('apimNotification', notification)
        .directive('apimNotifContractAccepted', contractAccepted)
        .directive('apimNotifContractPending', contractPending)
        .directive('apimNotifContractRejected', contractRejected)
        .directive('apimNotifMembershipGranted', membershipGranted)
        .directive('apimNotifMembershipPending', membershipPending)
        .directive('apimNotifMembershipRejected', membershipRejected);


    function contractAccepted() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/contract-accepted.html',
            controller: function ($scope) {
                $scope.clear = clear;

                function clear($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.clearFunction()($scope.notification);
                }
            }
        }
    }
    
    function contractPending() {
        return {
            restrict: 'E',
            scope: {
                notification: '='
            },
            templateUrl: 'views/templates/notification/partials/contract-pending.html',
            controller: function () {

            }
        }
    }
    
    function contractRejected() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/contract-rejected.html',
            controller: function ($scope) {
                $scope.clear = clear;

                function clear($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.clearFunction()($scope.notification);
                }
            }
        }
    }
    
    function notification() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/notification.html',
            controller: function ($scope, NOTIFICATIONS) {
                $scope.clear = clear;
                init();

                function init() {
                    switch ($scope.notification.type) {
                        case NOTIFICATIONS.MEMBERSHIP_GRANTED.toUpperCase():
                            $scope.membershipGranted = true;
                            break;
                        case NOTIFICATIONS.MEMBERSHIP_REJECTED.toUpperCase():
                            $scope.membershipRejected = true;
                            break;
                        case NOTIFICATIONS.MEMBERSHIP_PENDING.toUpperCase():
                            $scope.membershipPending = true;
                            break;
                        case NOTIFICATIONS.CONTRACT_PENDING.toUpperCase():
                            $scope.contractPending = true;
                            break;
                        case NOTIFICATIONS.CONTRACT_ACCEPTED.toUpperCase():
                            $scope.contractAccepted = true;
                            break;
                        case NOTIFICATIONS.CONTRACT_REJECTED.toUpperCase():
                            $scope.contractRejected = true;
                            break;
                    }
                }

                function clear(notification) {
                    $scope.clearFunction()(notification);
                }
            }
        }
    }
    
    function membershipGranted() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-granted.html',
            controller: function ($scope) {
                $scope.clear = clear;
                $scope.org = $scope.notification.orgDetails;

                function clear($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.clearFunction()($scope.notification);
                }
                
            }
        }
    }    
    
    function membershipPending() {
        return {
            restrict: 'E',
            scope: {
                notification: '='
            },
            templateUrl: 'views/templates/notification/partials/membership-pending.html',
            controller: function () {
                
            }
        }
    }    
    
    function membershipRejected() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-rejected.html',
            controller: function ($scope) {
                $scope.clear = clear;
                $scope.org = $scope.notification.orgDetails;

                function clear($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.clearFunction()($scope.notification);
                }
            }
        }
    }
})();
