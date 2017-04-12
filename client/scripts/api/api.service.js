(function () {
    'use strict';

    angular.module('app.api')
        .service('apiService', apiService)
        .service('service', service)
        .service('svcTab', svcTab);


    function apiService(SearchLatestServiceVersions, PublishedCategories, ServicePolicies, ServicePlans,
                        ServiceSupportTickets, ServiceAnnouncementsAll, ServiceVersionPolicy,
                        ServiceEndpoint, ServiceVersion, ServiceVersionDefinition, SearchLatestPublishedSvcsInCategories,
                        MktSearchLatestServiceVersions, MktPublishedCategories, MktServicePolicies, MktServicePlans,
                        MktServiceSupportTickets, MktServiceAnnouncementsAll, MktServiceAvailability,
                        MktServiceVersionPolicy, ServiceVersionContracts, MktServiceEndpoint, MktServiceVersion,
                        MktServiceVersionDefinition, MktSearchLatestPublishedSvcsInCategories, loginHelper) {
        this.getMarketplaceApis = getMarketplaceApis;
        this.getMarketplaceApisInCategories = getMarketplaceApisInCategories;
        this.getPublishedCategories = getPublishedCategories;
        this.getServiceAnnouncements = getServiceAnnouncements;
        this.getServiceAvailability = getServiceAvailability;
        this.getServiceEndpoint = getServiceEndpoint;
        this.getServicePlans = getServicePlans;
        this.getServicePolicies = getServicePolicies;
        this.getServiceVersion = getServiceVersion;
        this.getServiceVersions = getServiceVersions;
        this.getServiceVersionContracts = getServiceVersionContracts;
        this.getServiceVersionDefinition = getServiceVersionDefinition;
        this.getServiceVersionPolicies = getServiceVersionPolicies;
        this.getServiceVersionPolicy = getServiceVersionPolicy;
        this.getServiceSupportTickets = getServiceSupportTickets;
        this.searchMarketplaceApis = searchMarketplaceApis;


        function getMarketplaceApis() {
            if (loginHelper.checkLoggedIn()) {
                return SearchLatestServiceVersions.query({},
                    {filters: [{name: "status", value: "Published", operator: 'eq'}]}
                ).$promise;
            } else {
                return MktSearchLatestServiceVersions.query({},
                    {filters: [{name: "status", value: "Published", operator: 'eq'}]}
                ).$promise;
            }
        }
        
        function getMarketplaceApisInCategories(categoriesArray) {
            if (loginHelper.checkLoggedIn()) return SearchLatestPublishedSvcsInCategories.query({ categories: categoriesArray }).$promise;
            else return MktSearchLatestPublishedSvcsInCategories.query({ categories: categoriesArray }).$promise;
        }

        function getPublishedCategories() {
            if (loginHelper.checkLoggedIn()) return PublishedCategories.query().$promise;
            else return MktPublishedCategories.query().$promise;
        }
        
        function searchMarketplaceApis(query) {
            if (loginHelper.checkLoggedIn()) {
                return SearchLatestServiceVersions.query({},
                    {filters: [{name: 'name', value: '%' + query + '%', operator: 'like'},
                        {name: 'status', value: 'Published', operator: 'eq'}]}
                ).$promise;
            } else {
                return MktSearchLatestServiceVersions.query({},
                    {filters: [{name: 'name', value: '%' + query + '%', operator: 'like'},
                        {name: 'status', value: 'Published', operator: 'eq'}]}
                ).$promise;
            }
        }
        
        function getServiceAnnouncements(orgId, svcId) {
            if (loginHelper.checkLoggedIn()) return ServiceAnnouncementsAll.query({ orgId: orgId, svcId: svcId }).$promise;
            else return MktServiceAnnouncementsAll.query({orgId: orgId, svcId: svcId}).$promise;
        }
        
        function getServiceAvailability(orgId, svcId, versionId) {
            return MktServiceAvailability.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }
        
        function getServiceEndpoint(orgId, svcId, versionId) {
            if (loginHelper.checkLoggedIn()) return ServiceEndpoint.get({ orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
            else return MktServiceEndpoint.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getServicePlans(orgId, svcId, versionId) {
            if (loginHelper.checkLoggedIn()) return ServicePlans.query({ orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
            else return MktServicePlans.query({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }
        
        function getServiceVersionContracts(orgId, svcId, versionId) {
            return ServiceVersionContracts.query({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }
        
        function getServiceVersionDefinition(orgId, svcId, versionId) {
            if (loginHelper.checkLoggedIn()) return ServiceVersionDefinition.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
            else return MktServiceVersionDefinition.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getServicePolicies(orgId, svcId, versionId) {
            if (loginHelper.checkLoggedIn()) return ServicePolicies.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
            else return MktServicePolicies.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }
        
        function getServiceVersion(orgId, svcId, versionId) {
            if (loginHelper.checkLoggedIn()) return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
            else return MktServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }

        function getServiceVersions(orgId, svcId) {
            if (loginHelper.checkLoggedIn()) return ServiceVersion.query({ orgId: orgId, svcId: svcId }).$promise;
            else return MktServiceVersion.query({ orgId: orgId, svcId: svcId }).$promise;
        }

        function getServiceVersionPolicies(orgId, svcId, versionId) {
            if (loginHelper.checkLoggedIn()) return ServiceVersionPolicy.query({ orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
            else return MktServiceVersionPolicy.query({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getServiceVersionPolicy(orgId, svcId, versionId, policyId) {
            if (loginHelper.checkLoggedIn()) return ServiceVersionPolicy.get({orgId: orgId, svcId: svcId, versionId: versionId, policyId: policyId}).$promise;
            else return MktServiceVersionPolicy.get({orgId: orgId, svcId: svcId, versionId: versionId, policyId: policyId}).$promise;
        }
        
        function getServiceSupportTickets(orgId, svcId) {
            if (loginHelper.checkLoggedIn()) return ServiceSupportTickets.query({ orgId: orgId, svcId: svcId }).$promise;
            else return MktServiceSupportTickets.query({orgId: orgId, svcId: svcId}).$promise;
        }
    }

    function svcTab() {

        this.selectedTab = 'Documentation';

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

    }

    function service(ServiceEndpoint, ServiceVersion, DefaultTerms) {
        this.getServiceVersions = getServiceVersions;
        this.getEndpoint = getEndpoint;
        this.getVersion = getVersion;
        this.getDefaultTerms = getDefaultTerms; //TODO move this somewhere else (admin service?)


        function getDefaultTerms() {
            return DefaultTerms.get().$promise;
        }

        function getServiceVersions(orgId, svcId) {
            return ServiceVersion.query({ orgId: orgId, svcId: svcId }).$promise;
        }

        function getEndpoint(orgId, svcId, versionId) {
            return ServiceEndpoint.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }
    }



})();
