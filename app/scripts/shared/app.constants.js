;(function(angular) {
  "use strict";


  angular.module("app.constants", [])

    .constant('ACTIONS', {
      "LOCK": "lockPlan",
      "PUBLISH": "publishService",
      "RETIRE": "retireService",
      "REGISTER": "registerApplication",
      "UNREGISTER": "unregisterApplication"
    })

    .constant('ALERT_TYPES', {
      "SUCCESS": 'success',
      "INFO": 'info',
      "WARNING": 'warning',
      "DANGER": 'danger'
    })

    .constant('TOAST_TYPES', {
      "SUCCESS": 'success',
      "INFO": 'info',
      "WARNING": 'warning',
      "DANGER": 'danger'
    });


// #end
})(window.angular);
