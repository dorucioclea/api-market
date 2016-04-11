(function () {
    'use strict';

    angular.module('app.service')
        .service('svcScreenModel', svcScreenModel)
        .service('svcTab', svcTab);

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
