(function () {
    'use strict';

    angular.module('app.contracts')
        .service('contractService', contractService);


    function contractService($q, appService, ContractRequests, RequestContract) {
        this.accept = accept;
        this.break = breakContract;
        this.getPendingForApp = getPendingForApp;
        this.getPendingForSvc = getPendingForSvc;
        this.reject = reject;
        this.request = requestContract;
        
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
                    if (req.serviceId === svcId && req.serviceVersion === versionId) {
                        applicationDetPromises.push(appService.getAppVersionDetails(req.appOrg, req.appId, req.appVersion)
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

        function requestContract(svcOrgId, svcId, svcVersion, planId, appOrgId, appId, appVersion) {
            var requestObj = {
                applicationOrg: appOrgId,
                applicationId: appId,
                applicationVersion: appVersion,
                planId: planId
            };
            return RequestContract.save({ orgId: svcOrgId, svcId: svcId, versionId: svcVersion}, requestObj).$promise;
        }

    }

})();
