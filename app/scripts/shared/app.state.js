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

      this.selectedOrgId = 'FedEx';
      this.selectedOrg = {
        id: "FedEx",
        name: "FedEx",
        description: "Shipping company",
        createdBy: "admin",
        createdOn: 1439894816000,
        modifiedBy: "admin",
        modifiedOn: 1439894816000
      };

      this.setSelectedOrgId = function (organizationId) {
        this.selectedOrgId = organizationId;
        console.log('Selected organization with id: ' + organizationId);
        $rootScope.$broadcast('orgModel::selectedOrgUpdated', organizationId);
      };

      this.setSelectedOrg = function (organization) {
        this.selectedOrg = organization;
        console.log('Selected organization with id: ' + organization.id);
        $rootScope.$broadcast('orgModel::selectedOrgUpdated');
      }

    }])


    .service('svcModel', ['$rootScope', function($rootScope) {

      this.selectedService =     {
        organizationId: "FedEx",
        organizationName: "FedEx",
        id: "PackageTrackingService",
        name: "Package Tracking Service",
        description: "Track your packages via tracking number",
        createdOn: 1439900026000
      };

      this.setSelectedSvc = function (service) {
        this.selectedService = service;
        console.log('Selected service with id: ' + service.id);
        $rootScope.$broadcast('svcModel::selectedSvcUpdated');
      }

    }])

    .service("appModel", [ '$rootScope', function($rootScope) {

      this.selectedApp = null;

      this.setSelectedApp = function (app) {
        this.selectedApp = app;
        console.log('Selected application with id: ' + app.id);
        $rootScope.$broadcast('appModel::selectedAppUpdated');
      }

    }]);

})();
