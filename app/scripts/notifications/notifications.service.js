(function () {
    'use strict';

    angular.module('app.notifications')
        .service('notificationService', notificationService);


    function notificationService($q, orgService, UserIncomingNotifications, UserOutgoingNotifications,
                                 OrgIncomingNotifications, OrgOutgoingNotifications,
                                 NOTIFICATIONS) {
        this.clear = clear;
        this.getIncomingForOrg = getIncomingForOrg;
        this.getNotificationsForUser = getNotificationsForUser;
        this.getOrgsWithPendingRequest = getOrgsWithPendingRequest;
        this.getOutgoingForOrg = getOutgoingForOrg;
        
        function clear(notification) {
            return UserIncomingNotifications.delete({ notificationId: notification.id }).$promise;
        }

        function getIncomingForOrg(orgId) {
            return OrgIncomingNotifications.query({ orgId: orgId }).$promise;
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
                                case NOTIFICATIONS.MEMBERSHIP_REJECTED.toUpperCase():
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

        function getOutgoingForOrg(orgId) {
            return OrgOutgoingNotifications.query({ orgId: orgId }).$promise;
        }
    }

})();
