(function () {
    'use strict';

    angular.module('app.notifications')
        .service('notificationService', notificationService);


    function notificationService($q) {
        this.clear = clear;

        function clear(notification) {
            // TODO implement backend
            return $q.when('Not yet implemented');
        }
    }

})();
