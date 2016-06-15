(function () {
    'use strict';

    angular.module('app.api', [])
        .service('apiService', apiService);


    function apiService(MarketplaceSearchLatestServiceVersions, MarketplacePublishedCategories) {
        this.getMarketplaceApis = getMarketplaceApis;
        this.getPublishedCategories = getPublishedCategories;


        function getMarketplaceApis() {
            return MarketplaceSearchLatestServiceVersions.query({},
                {filters: [{name: "status", value: "Published", operator: 'eq'}]}
            ).$promise;
        }

        function getPublishedCategories() {
            return MarketplacePublishedCategories.query().$promise;
        }
    }

})();
