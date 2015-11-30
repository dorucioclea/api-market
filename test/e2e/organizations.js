var constants = require('./test_constants.js');

describe('My Organizations Page', function() {

    it('should have at least one organization listed', function () {
        browser.get(constants.PUB_BASE_URL + '#/my-organizations');

        var orgs = element.all(by.repeater('org in orgs'));
        expect(orgs.count()).toBeGreaterThan(0);

        element.all(by.repeater('org in orgs')).then(function(orgs) {
            var orgElement = orgs[0].element(by.binding('name'));
            expect(orgElement.getText()).toEqual('Digipolis');
        });
    });

    it('should create a E2E Testing org if it does not exist', function () {
        var alreadyCreated = false;
        var newlyCreated = false;

        browser.get(constants.PUB_BASE_URL + '#/my-organizations');
        element.all(by.repeater('org in orgs')).then(function (orgs) {
            var promises = [];
            for (var i = 0; i < orgs.length; i++) {
                promises.push(orgs[i].element(by.binding('name')).getText());
            }

            return protractor.promise.all(promises).then(function(results) {
                for (var j = 0; j < results.length; j++) {
                    if (results[j] === constants.ORG_NAME) {
                        alreadyCreated = true;
                        break;
                    }
                }

                if (!alreadyCreated) {
                    element(by.buttonText('New Organization')).click();
                    expect(element(by.buttonText('Create Organization')).isEnabled()).toBe(false);
                    element(by.model('ctrl.organization.name')).sendKeys(constants.ORG_NAME);
                    element(by.model('ctrl.organization.description')).sendKeys(constants.ORG_DESC);
                    expect(element(by.buttonText('Create Organization')).isEnabled()).toBe(true);
                    element(by.buttonText('Create Organization')).click();
                    browser.sleep(1000);
                    expect(browser.getCurrentUrl()).toBe(constants.PUB_BASE_URL + '#/org/' +
                        constants.ORG_NAME + '/plans');
                    browser.get(constants.PUB_BASE_URL + '#/my-organizations');
                    element.all(by.repeater('org in orgs')).then(function (orgs) {
                        var promises = [];
                        for (var i = 0; i < orgs.length; i++) {
                            promises.push(orgs[i].element(by.binding('name')).getText());
                        }
                        return protractor.promise.all(promises).then(function(results) {
                            for (var j = 0; j < results.length; j++) {
                                if (results[j] === constants.ORG_NAME) {
                                    newlyCreated = true;
                                    break;
                                }
                            }
                            expect(newlyCreated).toBe(true);
                        });
                    });
                }
            });
        });
    });
});
