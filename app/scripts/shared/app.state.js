;(function() {
  "use strict";

  // App State

  /* To Track:

  * User
    --> Logged In
    --> Id

  * Organization
    --> Which one is currently selected

  * Service
    --> Which one is selected
    --> Which version is selected

  * Application
    --> Which one is selected
    --> Which version is selected


   End */

  angular.module("app.state", [])

    .service('userModel', function() {

      this.isLoggedIn = true;
      this.userName = 'admin';

      //TODO Make dynamic!

    })

    .service('orgModel', ['$rootScope', function($rootScope) {

      this.selectedOrgId = {};

      this.setSelectedOrgId = function (organizationId) {
        this.selectedOrgId = organizationId;
        console.log('Selected organization with id: ' + organizationId);
        $rootScope.$broadcast('orgModel::selectedOrgUpdated', organizationId);
      };

    }])


    .service('serviceModel', ['$rootScope', function($rootScope) {

      this.selectedServiceId = null;

      this.setSelectedSvcId = function(serviceId) {
        this.selectedServiceId = serviceId;
        $rootScope.$broadcast('serviceModel::selectedServiceUpdated', serviceId);
      };

    }])

    .service("appModel", [ '$rootScope', function($rootScope) {

      this.selectedAppId = null;

      this.setSelectedAppId = function (appId) {
        this.selectedAppId = appId;
        $rootScope.$broadcast('appModel::selectedApplicationUpdated', appId);
      };

    }]);

})();
