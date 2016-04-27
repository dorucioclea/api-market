(function () {
    'use strict';

    angular.module('app.contracts')
        .directive('apimActiveContracts', activeContracts)
        .directive('apimPendingContracts', pendingContracts);


    function activeContracts() {
        return {
            retstrict: 'E',
            scope: {
                contracts: '='
            },
            templateUrl: 'views/templates/contracts/active-contracts-table.html',
            controller: contractListCtrl
        }
    }
    
    function contractListCtrl($scope) {
        console.log('contractListCtrl');
        console.log($scope.contracts);
    }
    
    function pendingContracts() {
        return {
            restrict: 'E',
            scope: {
                contracts: '=',
                userCanBreak: '@'
            },
            templateUrl: 'views/templates/contracts/pending-contracts-table.html',
            controller: contractListCtrl
        }
    }
})();
