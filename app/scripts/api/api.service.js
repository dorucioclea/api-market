(function () {
    'use strict';

    angular.module('app.api')
        .service('apiService', apiService);


    function apiService(MktSearchLatestServiceVersions, MktPublishedCategories, MktServicePolicies, MktServicePlans,
                        MktServiceSupportTickets, MktServiceAnnouncementsAll, MktServiceAvailability,
                        MktServiceVersionPolicy, MktServiceVersionContracts, MktServiceEndpoint, MktServiceVersion,
                        MktServiceVersionDefinition) {
        this.getMarketplaceApis = getMarketplaceApis;
        this.getPublishedCategories = getPublishedCategories;
        this.getServiceAnnouncements = getServiceAnnouncements;
        this.getServiceAvailability = getServiceAvailability;
        this.getServiceEndpoint = getServiceEndpoint;
        this.getServicePlans = getServicePlans;
        this.getServicePolicies = getServicePolicies;
        this.getServiceVersion = getServiceVersion;
        this.getServiceVersionContracts = getServiceVersionContracts;
        this.getServiceVersionDefinition = getServiceVersionDefinition;
        this.getServiceVersionPolicies = getServiceVersionPolicies;
        this.getServiceVersionPolicy = getServiceVersionPolicy;
        this.getServiceSupportTickets = getServiceSupportTickets;
        this.searchMarketplaceApis = searchMarketplaceApis;


        function getMarketplaceApis() {
            return MktSearchLatestServiceVersions.query({},
                {filters: [{name: "status", value: "Published", operator: 'eq'}]}
            ).$promise;
        }

        function getPublishedCategories() {
            return MktPublishedCategories.query().$promise;
        }
        
        function searchMarketplaceApis(query) {
            return MktSearchLatestServiceVersions.query({},
                {filters: [{name: 'name', value: '%' + query + '%', operator: 'like'},
                    {name: 'status', value: 'Published', operator: 'eq'}]}
            ).$promise;
        }
        
        function getServiceAnnouncements(orgId, svcId) {
            return MktServiceAnnouncementsAll.query({orgId: orgId, svcId: svcId}).$promise;
        }
        
        function getServiceAvailability(orgId, svcId, versionId) {
            return MktServiceAvailability.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }
        
        function getServiceEndpoint(orgId, svcId, versionId) {
            return MktServiceEndpoint.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getServicePlans(orgId, svcId, versionId) {
            return MktServicePlans.query({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }
        
        function getServiceVersionContracts(orgId, svcId, versionId) {
            return MktServiceVersionContracts.query({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }
        
        function getServiceVersionDefinition(orgId, svcId, versionId) {
            return MktServiceVersionDefinition.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getServicePolicies(orgId, svcId, versionId) {
            return MktServicePolicies.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }
        
        function getServiceVersion(orgId, svcId, versionId) {
            return MktServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }

        function getServiceVersionPolicies(orgId, svcId, versionId) {
            return MktServiceVersionPolicy.query({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getServiceVersionPolicy(orgId, svcId, versionId, policyId) {
            return MktServicePolicies.get({orgId: orgId, svcId: svcId, versionId: versionId, policyId: policyId}).$promise;
        }
        
        function getServiceSupportTickets(orgId, svcId) {
            return MktServiceSupportTickets.query({orgId: orgId, svcId: svcId}).$promise;
        }
    }

})();
