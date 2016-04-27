(function () {
    'use strict';

    angular.module('app.contracts')
        .service('contractService', contractService);


    function contractService($q, ApplicationContract) {
        this.breakContract = breakContract;
        this.getPendingForApp = getPendingForApp
        
        
        function breakContract(orgId, appId, versionId, contractId) {
            return ApplicationContract
                .delete({orgId: orgId, appId: appId, versionId: versionId, contractId: contractId}).$promise;
        }
        
        function getPendingForApp(appId) {
            // TODO backend implementation
            return $q.when('Not yet implemented')
        }

    }

})();
