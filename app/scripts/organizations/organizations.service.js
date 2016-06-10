(function () {
    'use strict';

    angular.module('app.organizations')
        .service('orgService', orgService);
    
    
    function orgService(Organization, SearchOrgs) {
        
        this.name = nameIt;
        this.orgInfo = orgInfo;
        this.search = search;


        function nameIt(org) {
            return org.name;
        }
        
        function orgInfo(orgId) {
            return Organization.get({ id: orgId }).$promise;
        }

        function search(searchString) {
            var search = {};
            searchString = searchString||'*';
            search.filters = [{name: 'name', value: '%' + searchString + '%', operator: 'like'}];
            search.orderBy = {ascending: true, name: 'name'};
            // TODO enable paging
            // search.paging = {page: 1, pageSize: 100};
            return SearchOrgs.save(search).$promise;
        }
    }
    
})();
