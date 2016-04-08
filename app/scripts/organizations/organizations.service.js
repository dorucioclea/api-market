(function () {
    'use strict';

    angular.module('app.organizations')
        .service('orgService', orgService);
    
    
    function orgService(CONFIG) {
        
        this.name = nameIt;
        
        function nameIt(org) {
            if (CONFIG.APP.PUBLISHER_MODE) return org.name;
            else {
                if (CONFIG.APP.ORG_FRIENDLY_NAME_ENABLED) return org.friendlyName;
                else return org.name;
            }
        }
    }
    
})();
