(function () {
    'use strict';

    angular.module('app.notifications')
        .service('notificationService', notificationService);


    function notificationService($q, orgService, PendingNotifications, Notifications,
                                 UserIncomingNotifications, UserOutgoingNotifications,
                                 OrgIncomingNotifications, OrgOutgoingNotifications,
                                 NOTIFICATIONS) {
        this.clear = clear;
        this.clearAll = clearAll;
        this.getIncomingForOrg = getIncomingForOrg;
        this.getNotificationsForUser = getNotificationsForUser;
        this.getOrgsWithPendingRequest = getOrgsWithPendingRequest;
        this.getPendingNotificationsForUser = getPendingNotificationsForUser;
        this.getOutgoingForOrg = getOutgoingForOrg;
        
        function clear(notification) {
            switch (notification.type) {
                case NOTIFICATIONS.CONTRACT_ACCEPTED.toUpperCase():
                case NOTIFICATIONS.CONTRACT_REJECTED.toUpperCase():
                    return OrgIncomingNotifications.delete({ orgId: notification.applicationOrgId, notificationId: notification.id }).$promise;
                case NOTIFICATIONS.MEMBERSHIP_GRANTED.toUpperCase():
                case NOTIFICATIONS.MEMBERSHIP_REJECTED.toUpperCase():
                    return UserIncomingNotifications.delete({ notificationId: notification.id }).$promise;
            }
        }

        function clearAll() {
            return UserIncomingNotifications.delete({}).$promise;
        }

        function getIncomingForOrg(orgId) {
            return OrgIncomingNotifications.query({ orgId: orgId }).$promise;
        }
        
        function getNotificationsForUser() {
            return Notifications.query().$promise;
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

        function getPendingNotificationsForUser() {
            return PendingNotifications.query().$promise;
        }

        function getOutgoingForOrg(orgId) {
            return OrgOutgoingNotifications.query({ orgId: orgId }).$promise;
        }
    }

})();
