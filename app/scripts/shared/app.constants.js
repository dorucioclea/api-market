;(function(angular) {
    'use strict';

    angular.module('app.constants', [])

        .constant('ACTIONS', {
            'DEPRECATE': 'deprecateService',
            'LOCK': 'lockPlan',
            'PUBLISH': 'publishService',
            'RETIRE': 'retireService',
            'REGISTER': 'registerApplication',
            'UNREGISTER': 'unregisterApplication'
        })

        .constant('ALERT_TYPES', {
            'SUCCESS': 'success',
            'INFO': 'info',
            'WARNING': 'warning',
            'DANGER': 'danger'
        })
        
        .constant('EVENTS', {
            'MEMBER_LIST_UPDATED': 'member-list-updated',
            'NOTIFICATIONS_UPDATED': 'notifications-updated',
            'API_DETAILS_PAGE_OPENED': 'api-details-page-opened',
            'APPLICATION_DETAILS_UPDATED': 'application-details-updated'
        })

        .constant('NOTIFICATIONS', {
            'MEMBERSHIP_PENDING': 'membership_pending',
            'MEMBERSHIP_GRANTED': 'membership_granted',
            'MEMBERSHIP_REJECTED': 'membership_rejected',
            'CONTRACT_PENDING': 'contract_pending',
            'CONTRACT_ACCEPTED': 'contract_accepted',
            'CONTRACT_REJECTED': 'contract_rejected'
        })

        .constant('PERMISSIONS', {
            'APP': {'ADMIN': 'appAdmin', 'EDIT': 'appEdit', 'VIEW': 'appView'},
            'ORG': {'ADMIN': 'orgAdmin', 'EDIT': 'orgEdit', 'VIEW': 'orgView'},
            'PLAN': {'ADMIN': 'planAdmin', 'EDIT': 'planEdit', 'VIEW': 'planView'},
            'SVC': {'ADMIN': 'svcAdmin', 'EDIT': 'svcEdit', 'VIEW': 'svcView'}
        })

        .constant('REGEX', {
            'BASEPATH': /^[a-z\-]+$/,
            'IMPLEMENTATION': /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S)?@)?(?:(?:.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){3}(?:.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)[a-z\u00a1-\uffff0-9]+)(?:.(?:[a-z\u00a1-\uffff0-9]+-?)[a-z\u00a1-\uffff0-9]+)(?:.(?:[a-z\u00a1-\uffff]{2,}))*)(?::\d{1,5})?(?:\/[^\s]*)?$/i,
            'APPLICATION_NAME': /^([a-zA-Z0-9-_]+\s)*[a-zA-Z0-9-_]+$/,
            'ORG_NAME': /^([a-zA-Z0-9-_]+\s)*[a-zA-Z0-9-_]+$/,
            'PLAN_NAME': /^([a-zA-Z0-9-_]+\s)*[a-zA-Z0-9-_]+$/,
            'SERVICE_NAME': /^([a-zA-Z0-9-_]+\s)*[a-zA-Z0-9-_]+$/,
            'VERSION': /^[0-9\-]+$/
        })

        .constant('TOAST_TYPES', {
            'SUCCESS': 'success',
            'INFO': 'info',
            'WARNING': 'warning',
            'DANGER': 'danger'
        });

    // #end
})(window.angular);
