;(function() {
  "use strict";


  angular.module("app.services", [])

    .service('orgScreenModel', function () {

      this.selectedTab = 'Plans';
      this.organization = {};

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };

      this.updateOrganization = function (org) {
        this.organization = org;
      };

    })

    .service('svcTab', function () {

      this.selectedTab = 'Documentation';

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      }

    })

    .service('svcScreenModel', function () {
      this.selectedTab = 'Overview';
      this.service = {};

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };

      this.updateService = function (newSvc) {
        this.service = newSvc;
      };
    })

    .service('selectedApp', function () {
      this.appId = '';
      this.appOrgId = '';
      this.appVersion = '';

      this.updateApplication = function (newApp) {
        this.appId = newApp.id;
        this.appOrgId = newApp.organizationId;
        this.appVersion = newApp.version;
      }
    })

    .service('appScreenModel', function () {
      this.selectedTab = 'Overview';

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };
    })

    .service('planScreenModel', function () {
      this.selectedTab = 'Overview';
      this.plan = {};

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };

      this.updatePlan = function (plan) {
        this.plan = plan;
      };
    })

    .service('svcModel', function () {

      var service = null;

      this.setService = function (serv) {
        service = serv;
      };

      this.getService = function () {
        return service;
      };

    });

})();
