(function () {
    'use strict';

    angular.module('app.notifications')
        .service('notificationService', notificationService);


    function notificationService($q, contractService, orgService, UserIncomingNotifications, UserOutgoingNotifications, NOTIFICATIONS) {
        this.clear = clear;
        this.getNotificationsForUser = getNotificationsForUser;

        function clear(notification) {
            // TODO implement backend
            return $q.when('Not yet implemented');
        }
        
        function getNotificationsForUser() {
            var notifications = [];
            
            return $q.all([UserIncomingNotifications.query().$promise, UserOutgoingNotifications.query().$promise])
                .then(function (results) {
                    console.log(results);
                    angular.forEach(results, function (result) {
                        console.log(result);
                        result.forEach(function (res) {
                            switch (res.type) {
                                case NOTIFICATIONS.MEMBERSHIP_GRANTED.toUpperCase():
                                case NOTIFICATIONS.MEMBERSHIP_REJECTED.toUpperCase:
                                    console.log('granted');
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
    }

})();
