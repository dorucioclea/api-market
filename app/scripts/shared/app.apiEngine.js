;(function() {
  "use strict";


  angular.module("app.apiEngine", [])

    .service('apiEngine', function($http, $q) {

      // API Root URL
      var baseUrl = 'http://localhost:8080/API-Engine-web/v1/';

      this.createNewOrganization = function(org) {
          $http.post(baseUrl + 'organizations', org)
            .then( function (response) {
              return {
                id: response.data.id,
                name: response.data.name,
                description: response.data.description,
                createdBy: response.data.createdBy,
                createdOn: response.data.createdOn,
                modifiedBy: response.data.modifiedBy,
                modifiedOn: response.data.modifiedOn
              };
            },
            function (httpError) {
              // translate the error
              throw httpError.status + " : " +
              httpError.data;
            });
        };
    });
})();
