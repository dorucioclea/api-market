;(function(angular) {
    'use strict';

    angular.module('app.constants', [])

    .constant('ACTIONS', {
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

    .constant('PERMISSIONS', {
        'APP': {'ADMIN': 'appAdmin', 'EDIT': 'appEdit', 'VIEW': 'appView'},
        'ORG': {'ADMIN': 'orgAdmin', 'EDIT': 'orgEdit', 'VIEW': 'orgView'},
        'PLAN': {'ADMIN': 'planAdmin', 'EDIT': 'planEdit', 'VIEW': 'planView'},
        'SVC': {'ADMIN': 'svcAdmin', 'EDIT': 'svcEdit', 'VIEW': 'svcView'}
    })

    .constant('TOAST_TYPES', {
        'SUCCESS': 'success',
        'INFO': 'info',
        'WARNING': 'warning',
        'DANGER': 'danger'
    });

    // #end
})(window.angular);
