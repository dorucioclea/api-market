var constants = require('../test_constants.js');

describe('My Organizations Page', function() {

    it('should be able to navigate to the Protractor org by clicking the link', function () {
        browser.get(constants.MKT_BASE_URL + '#/my-organizations');
        element(by.linkText(constants.ORG_NAME.replace(/ /g,''))).click();

        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toContain('#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/applications');
    });
});
