(function () {
    'use strict';

    angular.module('app.organizations')
        .service('orgService', orgService);
    
    
    function orgService(Organization, CONFIG) {
        
        this.name = nameIt;
        this.orgInfo = orgInfo;


        function nameIt(org) {
            if (CONFIG.APP.PUBLISHER_MODE) return org.name;
            else {
                if (CONFIG.APP.ORG_FRIENDLY_NAME_ENABLED) return org.friendlyName;
                else return org.name;
            }
        }
        
        function orgInfo(orgId) {
            return Organization.get({ id: orgId }).$promise;
        }
    }
    
})();
