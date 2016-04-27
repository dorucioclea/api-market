(function () {
    'use strict';

    angular.module('app.applications')
        .service('appService', appService);
    
    
    function appService(Application, ApplicationMetrics) {
        this.getAppMetrics = getAppMetrics;
        this.updateAppDesc = updateAppDescription;
        
        
        function getAppMetrics(orgId, appId, versionId, fromDt, toDt, interval) {
            return ApplicationMetrics.get({orgId: orgId, appId: appId,
                    versionId: versionId,
                    from: fromDt, to: toDt, interval: interval}).$promise;    
        }
        
        function updateAppDescription(orgId, appId, newDescription) {
            return Application.update({orgId: orgId, appId: appId}, {description: newDescription}).$promise;
        }
    }


})();
