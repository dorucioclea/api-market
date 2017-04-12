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

    function service($q, $uibModal, Service, ServiceEndpoint, ServiceTerms, ServiceVersion, ServiceVersionDefinition, Categories, DefaultTerms, BrandingService, _) {
        this.deleteService = deleteService;
        this.deleteServiceVersion = deleteServiceVersion;
        this.deprecateServiceVersion = deprecateServiceVersion;
        this.editDetails = editDetails;
        this.getServicesForOrg = getServicesForOrg;
        this.getServiceVersions = getServiceVersions;
        this.getDefinition = getDefinition;
        this.getEndpoint = getEndpoint;
        this.getVersion = getVersion;
        this.publishServiceVersion = publishServiceVersion;
        this.retireServiceVersion = retireServiceVersion;
        this.updateDefinition = updateDefinition;
        this.updateDescription = updateDescription;
        this.updateServiceVersion = updateServiceVersion;
        this.updateTerms = updateTerms;
        this.getDefaultTerms = getDefaultTerms;
        this.getAllCategories = getAllCategories;


        function deleteService(orgId, svcId, svcName) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/serviceDelete.html',
                size: 'lg',
                controller: 'DeleteServiceCtrl as ctrl',
                resolve: {
                    organizationId: function () {
                        return orgId;
                    },
                    serviceId: function () {
                        return svcId;
                    },
                    serviceName: function () {
                        return svcName;
                    }
                },
                backdrop : 'static'
            });

            return modalInstance.result;
        }

        function deleteServiceVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId}).$promise.then(function (reply) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modals/serviceVersionDelete.html',
                    size: 'lg',
                    controller: 'DeleteServiceVersionCtrl as ctrl',
                    resolve: {
                        svcVersion: function () {
                            return reply;
                        },
                        lastVersion: function () {
                            return ServiceVersion.query({ orgId: orgId, svcId: svcId}).$promise.then(function (reply) {
                                return reply.length === 1;
                            })
                        }
                    },
                    backdrop : 'static'
                });

                return modalInstance.result;
            });
        }

        function deprecateServiceVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise.then(function (reply) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modals/serviceDeprecate.html',
                    size: 'lg',
                    controller: 'DeprecateServiceCtrl as ctrl',
                    resolve: {
                        svcVersion: function () {
                            return reply;
                        }
                    },
                    backdrop : 'static'
                });

                return modalInstance.result;
            });
        }

        function editDetails(orgId, svcId) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/serviceEdit.html',
                size: 'lg',
                controller: 'ServiceEditCtrl as ctrl',
                resolve: {
                    svc: function () {
                        return Service.get({ orgId: orgId, svcId: svcId }).$promise;
                    },
                    branding: function () {
                        return BrandingService.getBrandings();
                    }
                },
                backdrop : 'static'
            });
            modalInstance.result.then(function(updatedSvc) {
                var updateObj = {
                    name: updatedSvc.name,
                    description: updatedSvc.description,
                    categories: _.map(updatedSvc.categories, 'text')
                };

                if (_.has(updatedSvc, 'selectedBranding')) {
                    // the selected branding was changed

                    if (_.has(updatedSvc.selectedBranding, 'id')) {
                        // a new branding was selected, remove old one and apply new one
                        // check for existing branding
                        if (_.isEmpty(updatedSvc.brandings)) {
                            // no existing branding, add new one
                            BrandingService.addBrandingToService(orgId, svcId, updatedSvc.selectedBranding).then(function () {
                                deferred.resolve(Service.update({ orgId: orgId, svcId: svcId }, updateObj).$promise);
                            })
                        } else {
                            // already has branding, remove it first
                            BrandingService.removeBrandingFromService(orgId, svcId, updatedSvc.brandings[0].id).then(function () {
                                BrandingService.addBrandingToService(orgId, svcId, updatedSvc.selectedBranding).then(function () {
                                    deferred.resolve(Service.update({ orgId: orgId, svcId: svcId }, updateObj).$promise);
                                });
                            })
                        }

                    } else {
                        // user has opted to apply no branding, remove existing
                        if (!_.isEmpty(updatedSvc.brandings)) {
                            BrandingService.removeBrandingFromService(orgId, svcId, updatedSvc.brandings[0].id).then(function () {
                                deferred.resolve(Service.update({ orgId: orgId, svcId: svcId }, updateObj).$promise);
                            })
                        }
                    }


                } else {
                    deferred.resolve(Service.update({ orgId: orgId, svcId: svcId }, updateObj).$promise);
                }
            }, function () {
                deferred.resolve('canceled');
            });
            return deferred.promise;
        }

        function getDefaultTerms() {
            return DefaultTerms.get().$promise;
        }

        function getAllCategories() {
            return Categories.query().$promise;
        }

        function getServicesForOrg(orgId) {
            return Service.query({ orgId: orgId }).$promise;
        }

        function getServiceVersions(orgId, svcId) {
            return ServiceVersion.query({ orgId: orgId, svcId: svcId }).$promise;
        }

        function getDefinition(orgId, svcId, versionId) {
            return ServiceVersionDefinition.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }

        function getEndpoint(orgId, svcId, versionId) {
            return ServiceEndpoint.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }

        function publishServiceVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise.then(function (reply) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modals/servicePublish.html',
                    size: 'lg',
                    controller: 'PublishServiceCtrl as ctrl',
                    resolve: {
                        svcVersion: function () {
                            return reply;
                        }
                    },
                    backdrop: 'static'
                });

                return modalInstance.result;
            });
        }

        function retireServiceVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise.then(function (reply) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modals/serviceRetire.html',
                    size: 'lg',
                    controller: 'RetireServiceCtrl as ctrl',
                    resolve: {
                        svcVersion: function () {
                            return reply;
                        }
                    },
                    backdrop : 'static'
                });

                return modalInstance.result;
            });
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



})();
