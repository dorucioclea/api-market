;(function() {
  "use strict";


  angular.module("app.services", [])

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
