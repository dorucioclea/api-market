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

    .service('appTab', function () {

      this.selectedTab = 'Overview';

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      }

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
