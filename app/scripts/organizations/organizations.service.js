(function () {
    'use strict';

    angular.module('app.organizations')
        .service('orgService', orgService);
    
    
    function orgService(Organization) {
        
        this.name = nameIt;
        this.orgInfo = orgInfo;


        function nameIt(org) {
            return org.name;
        }
        
        function orgInfo(orgId) {
            return Organization.get({ id: orgId }).$promise;
        }
    }
    
})();
