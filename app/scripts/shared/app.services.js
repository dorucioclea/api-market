;(function() {
  "use strict";


  angular.module("app.services", [])

    .service('orgTab', function () {

      this.selectedTab = 'Plans';

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
