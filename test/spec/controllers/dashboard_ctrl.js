'use strict';

describe('Controller: DashboardCtrl', function () {

    // load the controller's module
    beforeEach(module('app'));

    var MainCtrl,
      scope;

    // Initialize the controller and a mock scope
    //beforeEach(inject(function ($controller, $rootScope) {
    //    scope = $rootScope.$new();
    //    MainCtrl = $controller('DashboardCtrl', {
    //        $scope: scope,
    //        $state: {},
    //        svcData: {},
    //        categories: {},
    //        headerModel: {},
    //        toastService: {}
    //    });
    //}));

    it('should return true', function () {
        expect(true).toBe(true);
    });
});
