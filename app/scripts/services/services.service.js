(function () {
    'use strict';

    angular.module('app.service')
        .service('service', service)
        .service('svcScreenModel', svcScreenModel)
        .service('svcTab', svcTab);

    function service(Service, ServiceTerms, ServiceVersion, ServiceVersionDefinition, ServiceVersionPolicy) {
        this.getDefinition = getDefinition;
        this.getVersion = getVersion;
        this.removePolicy = removePolicy;
        this.updateDefinition = updateDefinition;
        this.updateDescription = updateDescription;
        this.updateServiceVersion = updateServiceVersion;
        this.updateTerms = updateTerms;

        
        function getDefinition(orgId, svcId, versionId) {
            return ServiceVersionDefinition.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }

        function getVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }

        function removePolicy(orgId, svcId, versionId, policyId) {
            return ServiceVersionPolicy.delete({ orgId: orgId, svcId: svcId, versionId: versionId, policyId: policyId }).$promise;
        }

        function updateDefinition(orgId, svcId, versionId, updatedDefininitionObject) {
            return ServiceVersionDefinition.update({ orgId: orgId, svcId: svcId, versionId: versionId},
                updatedDefininitionObject).$promise;
        }
        
        function updateDescription(orgId, svcId, newDescription) {
            return Service.update({ orgId: orgId, svcId: svcId }, { description: newDescription }).$promise;
        }
        
        function updateServiceVersion(orgId, svcId, versionId, updateObject) {
            return ServiceVersion.update({ orgId: orgId, svcId: svcId, versionId: versionId }, updateObject).$promise
        }

        function updateTerms(orgId, svcId, termsObject) {
            return ServiceTerms.update({ orgId: orgId, svcId: svcId }, termsObject).$promise;
        }
    }
    
    function svcTab() {

        this.selectedTab = 'Documentation';

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

    }

    function svcScreenModel() {
        this.selectedTab = 'Overview';
        this.service = {};
        this.tabStatus = {
            hasImplementation: false,
            hasDefinition: false
        };

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

        this.updateService = function (newSvc) {
            this.service = newSvc;
            this.tabStatus.hasImplementation = newSvc.endpoint !== null;
        };

        this.setHasImplementation = function (bool) {
            this.tabStatus.hasImplementation = bool;
        };

        this.setHasDefinition = function (bool) {
            this.tabStatus.hasDefinition = bool;
        };
    }

})();
