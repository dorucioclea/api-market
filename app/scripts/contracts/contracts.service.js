(function () {
    'use strict';

    angular.module('app.contracts')
        .service('contractService', contractService);


    function contractService($q, appService, ApplicationContract, ContractRequests) {
        this.accept = accept;
        this.break = breakContract;
        this.getPendingForApp = getPendingForApp;
        this.getPendingForSvc = getPendingForSvc;
        this.reject = reject;
        
        function accept(contract) {
            // TODO backend implementation
            return $q.when('mocked, not yet implemented');
        }

        function breakContract(orgId, appId, versionId, contractId) {
            return ApplicationContract
                .delete({orgId: orgId, appId: appId, versionId: versionId, contractId: contractId}).$promise;
        }
        
        function getPendingForApp(appId) {
            // TODO backend implementation
            return $q.when('Not yet implemented');
        }

        function getPendingForSvc(orgId, svcId, versionId) {
            // TODO backend implementation
            var deferred = $q.defer();
            ContractRequests.query({ orgId: orgId }, function (requests) {
                var contracts = [];
                var applicationDetPromises = [];

                requests.forEach(function (req) {
                    var identifier = req.destinationId.split('.');
                    if (identifier.indexOf(svcId) > -1 && identifier.indexOf(versionId) > -1) {
                        var appIdent = req.originId.split('.');
                        applicationDetPromises.push(appService.getAppVersionDetails(appIdent[0], appIdent[1], appIdent[2])
                            .then(function (appVersion) {
                                req.appDetails = appVersion;
                                contracts.push(req);
                            }));
                    }
                });

                $q.all(applicationDetPromises).then(function() {
                    deferred.resolve(contracts);
                })
            });
            return deferred.promise;
        }

        function reject(contract) {
            // TODO backend implementation
            return $q.when('Not yet implemented');
        }

    }

})();
