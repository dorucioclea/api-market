(function () {
    'use strict';

    angular.module('app.organizations')
        .service('orgService', orgService);
    
    
    function orgService($q, $uibModal, Organization, SearchOrgs) {

        this.delete = deleteOrg;
        this.name = nameIt;
        this.orgInfo = orgInfo;
        this.search = search;
        this.updateDescription = updateDescription; 


        function deleteOrg(orgId) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/organizationDelete.html',
                size: 'lg',
                controller: 'OrgDeleteCtrl as ctrl',
                resolve: {
                    org: function () {
                        return Organization.get({ id: orgId }).$promise;
                    }
                },
                backdrop : 'static'
            });
            modalInstance.result.then(function() {
                deferred.resolve(Organization.delete({ id: orgId }).$promise);
            }, function () {
                deferred.resolve('canceled');
            });
            return deferred.promise;
        }

        function nameIt(org) {
            return org.name;
        }
        
        function orgInfo(orgId) {
            return Organization.get({ id: orgId }).$promise;
        }

        function search(searchString) {
            var search = {};
            searchString = searchString||'*';
            search.filters = [{name: 'name', value: '%' + searchString + '%', operator: 'like'},
                // Currently we only allow searching for public organizations
                { name: 'organizationPrivate', value: false, operator: 'bool_eq' }];
            search.orderBy = {ascending: true, name: 'name'};
            // TODO enable paging
            // search.paging = {page: 1, pageSize: 100};
            return SearchOrgs.save(search).$promise;
        }
        
        function updateDescription(orgId, newDesc) {
            return Organization.update({ id: orgId }, { description: newDesc }).$promise;
        }
    }
    
})();
