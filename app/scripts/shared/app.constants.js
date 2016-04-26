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
            'MEMBER_LIST_UPDATED': 'member-list-updated'
        })

        .constant('PERMISSIONS', {
            'APP': {'ADMIN': 'appAdmin', 'EDIT': 'appEdit', 'VIEW': 'appView'},
            'ORG': {'ADMIN': 'orgAdmin', 'EDIT': 'orgEdit', 'VIEW': 'orgView'},
            'PLAN': {'ADMIN': 'planAdmin', 'EDIT': 'planEdit', 'VIEW': 'planView'},
            'SVC': {'ADMIN': 'svcAdmin', 'EDIT': 'svcEdit', 'VIEW': 'svcView'}
        })

        .constant('REGEX', {
            'BASEPATH': /^[a-z\-]+$/,
            'IMPLEMENTATION': /^(?:http|ftp)s?:\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/gi,
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
