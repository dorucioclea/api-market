(function () {
    'use strict';

    angular.module('app.notifications')
        .service('notificationService', notificationService);


    function notificationService($q, contractService, orgService, UserIncomingNotifications, UserOutgoingNotifications, NOTIFICATIONS) {
        this.clear = clear;
        this.getNotificationsForUser = getNotificationsForUser;
        this.getOrgsWithPendingRequest = getOrgsWithPendingRequest;

        function clear(notification) {
            // TODO implement backend
            return $q.when('Not yet implemented');
        }
        
        function getNotificationsForUser() {
            // TODO rework to reduce number of backend calls
            var notifications = [];
            
            return $q.all([UserIncomingNotifications.query().$promise, UserOutgoingNotifications.query().$promise])
                .then(function (results) {
                    angular.forEach(results, function (result) {
                        result.forEach(function (res) {
                            switch (res.type) {
                                case NOTIFICATIONS.MEMBERSHIP_GRANTED.toUpperCase():
                                case NOTIFICATIONS.MEMBERSHIP_REJECTED.toUpperCase:
                                    orgService.orgInfo(res.originId).then(function (orgInfo) {
                                        res.orgDetails = orgInfo;
                                    });
                                    break;
                                case NOTIFICATIONS.MEMBERSHIP_PENDING.toUpperCase():
                                    orgService.orgInfo(res.destinationId).then(function (orgInfo) {
                                        res.orgDetails = orgInfo;
                                    });
                                    break;
                            }
                            notifications.push(res);
                        });
                    });
                    return notifications;
                })
        }

        function getOrgsWithPendingRequest() {
            // TODO rework to reduce number of backend calls
            return UserOutgoingNotifications.query().$promise.then(function (notifications) {
                var orgPromises = [];
                notifications.forEach(function (res) {
                    orgPromises.push(orgService.orgInfo(res.destinationId))
                });

                return $q.all(orgPromises).then(function (results) {
                    return results;
                })
            });
        }
    }

})();
