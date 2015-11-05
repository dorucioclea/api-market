var constants = require('../test_constants.js');

describe('Organization Page', function() {

    it('should be able to navigate to the test org by clicking the link', function () {
        browser.get(constants.PUB_BASE_URL + '#/my-organizations');
        element(by.linkText(constants.ORG_NAME)).click();

        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toContain('#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/');
    });

    it('can update the org description', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/');
        browser.waitForAngular();

        //Clear description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).clear();
        element(by.css('span[ng-click="doSave()"]')).click();
        expect(element(by.binding('value')).getText()).toEqual('');

        //Update description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).sendKeys(constants.ORG_DESC);
        element(by.css('span[ng-click="doSave()"]')).click();

        expect(element(by.binding('value')).getText()).toEqual(constants.ORG_DESC);
    });

    it('can switch between tabs', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/');
        browser.waitForAngular();

        expect(browser.getCurrentUrl()).toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plans');
        element(by.id('services')).click();
        expect(browser.getCurrentUrl()).toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/services');
        element(by.id('members')).click();
        expect(browser.getCurrentUrl()).toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/members');
        element(by.id('plans')).click();
        expect(browser.getCurrentUrl()).toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plans');
    });
});
