;(function() {
    'use strict';

    angular.module('app.core.components', [])
        .component('apimHeader', header);


    function header() {
        return {
            templateUrl: 'heroDetail.html',
            controller: headerController,
            bindings: {
                hero: '='
            }
        }
    }

    function headerController() {
        
    }

    })();
