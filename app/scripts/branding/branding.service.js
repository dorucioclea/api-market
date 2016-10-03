(function () {
    'use strict';

    angular.module('app.branding')
        .service('BrandingService', brandingService);


    function brandingService(Branding) {
        this.createBranding = createBranding;
        this.deleteBranding = deleteBranding;
        this.getBranding = getBranding;
        this.getBrandings = getBrandings;
        
        
        function createBranding(brandingName) {
            return Branding.save({}, { name: brandingName}).$promise;
        }
        
        function deleteBranding(brandingId) {
            return Branding.delete({ brandingId: brandingId }).$promise;
        }

        function getBranding(brandingId) {
            return Branding.get({ brandingId: brandingId }).$promise;
        }

        function getBrandings() {
            return Branding.query().$promise;
        }
    }

})();
