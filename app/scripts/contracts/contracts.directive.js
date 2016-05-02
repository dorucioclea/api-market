(function () {
    'use strict';

    angular.module('app.contracts')
        .directive('apimActiveContracts', activeContracts)
        .directive('apimPendingContracts', pendingContracts)
        .directive('apimPendingContractsForService', pendingContractsForSvc);


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
    
    function pendingContractsForSvc() {
        return {
            restrict: 'E',
            scope: {
                contracts: '='
            },
            templateUrl: 'views/templates/contracts/pending-contracts-for-svc.html',
            controller: function ($scope, contractService, toastService) {
                $scope.acceptContract = acceptContract;
                $scope.getPlanDetails = getPlanDetails;
                $scope.rejectContract = rejectContract;
                
                
                function acceptContract(contract) {
                    contractService.accept(contract).then(function () {
                        toastService.success('Contract with <b>' + contract.appDetails.application.name + ' '
                            +  contract.appDetails.version + '</b> accepted.');
                        $scope.contracts.splice($scope.contracts.indexOf(contract), 1);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not accept contract');
                    })
                }
                
                function getPlanDetails(contract) {
                    if (!contract.planDetails) contract.planDetails = angular.fromJson(contract.body);
                    return contract.planDetails;
                }
                
                function rejectContract(contract) {
                    contractService.reject(contract).then(function () {
                        toastService.info('Contract with <b>' + contract.appDetails.application.name + ' '
                            +  contract.appDetails.version + '</b> rejected.');
                        $scope.contracts.splice($scope.contracts.indexOf(contract), 1);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not reject contract');
                    })
                }
            }
        }
    }
})();
