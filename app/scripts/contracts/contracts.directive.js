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
    
    function contractListCtrl($scope, contractService, toastService) {
        console.log('contractListCtrl');
        console.log($scope.contracts);
        $scope.breakContract = breakContract;

        function breakContract(contract) {
            contractService.break(contract.appOrganizationId, contract.appId, contract.appVersion, contract.contractId)
                .then(function () {
                    $scope.contracts.splice($scope.contracts.indexOf(contract), 1);
                    toastService.success('Contract was between <b>' + contract.appName + ' ' + contract.appVersion +
                        '</b> and <b>' + contract.serviceName + ' ' +  contract.serviceVersion + '</b> was nullified.');
                });
        }
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
