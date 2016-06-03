(function () {
    'use strict';

    angular.module('app.swagger', ['swaggerUi'])
        .service('swaggerCurlGenerator', curlGenerator)
        .service('swaggerRequestTagger', requestTagger)
        .run(function (swaggerModules, swaggerCurlGenerator, swaggerRequestTagger) {
            swaggerModules.add(swaggerModules.BEFORE_EXPLORER_LOAD, swaggerRequestTagger);
            swaggerModules.add(swaggerModules.AFTER_EXPLORER_LOAD, swaggerCurlGenerator);
        });
    

    function curlGenerator($q) {
        /**
         * Module entry point
         */
        this.execute = function(options) {
            var deferred = $q.defer();
            deferred.resolve(true);
            return deferred.promise;
        };
    }    
    
    function requestTagger($q) {
        /**
         * Module entry point
         */
        this.execute = function(options) {
            var deferred = $q.defer();
            options.isSwaggerUIRequest = true;
            deferred.resolve(options);
            return deferred.promise;
        };
    }

})();