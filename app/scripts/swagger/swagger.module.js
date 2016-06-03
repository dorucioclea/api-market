(function () {
    'use strict';

    angular.module('app.swagger', ['swaggerUi'])
        .service('swaggerCurlGenerator', curlGenerator)
        .run(function (swaggerModules, swaggerCurlGenerator) {
            swaggerModules.add(swaggerModules.AFTER_EXPLORER_LOAD, swaggerCurlGenerator)
        });


    function curlGenerator($q) {
        /**
         * Module entry point
         */
        this.execute = function(options) {
            console.log('curlGenerator');
            var deferred = $q.defer();
            deferred.resolve(true);
            return deferred.promise;
        };
    }

})();