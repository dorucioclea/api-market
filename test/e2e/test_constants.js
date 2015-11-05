(function() {
    'use strict';

    var TestConstants = function() {
        // Testing Base URL's
        this.PUB_BASE_URL = 'http://dev.pub.t1t.be/';
        this.MKT_BASE_URL = 'http://dev.mkt.t1t.be/';

        // Organization Constants
        this.ORG_NAME = 'E2E Testing';
        this.ORG_DESC = 'E2E Test Organization';

        // Service
        this.SVC_NAME = 'End To End Test';
        this.SVC_VERSION_INITIAL = 'v1';
        this.SVC_VERSION_SECOND = 'v2';
        this.SVC_BASEPATH = 'endtoend';
        this.SVC_DESC = 'Service created by E2E tests';
        this.SVC_IMPL_ENDPOINT = 'http://rest.visireg.com/VisiREGServer-web/rest/v1';

        // Plan
        this.PLAN_NAME = 'End To End Test';
        this.PLAN_VERSION_INITIAL = 'v1';
        this.PLAN_VERSION_SECOND = 'v2';
        this.PLAN_DESC = 'Plan created by E2E tests';
    };

    // get the instance you want to export
    var constants = new TestConstants();

    // if module.export is available ( NodeJS? ) go for it,
    // otherwise append it to the global object
    if (module && module.exports) {
        module.exports = constants;
    } else {
        window.constants = constants;
    }

})();
