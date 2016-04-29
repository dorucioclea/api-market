(function () {
    'use strict';

    angular.module('app.notifications')
        .directive('apimNotification', notification);


    function notification() {
        return {
            restrict: 'E',
            scope: {
                notification: '='
            },
            templateUrl: 'views/templates/notification/notification.html',
            controller: function ($scope, notificationService) {
                $scope.clear = clear;
                
                
                function clear(notification) {
                    notificationService.clear(notification).then(function () {
                        // TODO Notify user of success
                    })
                }
            }
        }
    }
})();
