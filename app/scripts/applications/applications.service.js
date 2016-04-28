(function () {
    'use strict';

    angular.module('app.applications')
        .service('appService', appService);
    
    
    function appService(Application, ApplicationMetrics, ApplicationVersion) {
        this.getAppVersionDetails = getAppVersionDetails;
        this.getAppMetrics = getAppMetrics;
        this.updateAppDesc = updateAppDescription;
        
        function getAppVersionDetails(orgId, appId, versionId) {
            return ApplicationVersion.get({ orgId: orgId, appId: appId, versionId: versionId }).$promise;
        }
        
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
