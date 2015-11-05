var constants = require('../test_constants.js');

describe('Organization Plan Creation', function() {

    it('can create a new plan', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/');
        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toBe(constants.PUB_BASE_URL + '#/org/' +
            constants.ORG_NAME.replace(/ /g,'') + '/plans');

        element(by.linkText('New Plan')).click();
        //Button should be disabled if no data has been entered
        expect(element(by.buttonText('Create Plan')).isEnabled()).toBe(false);
        element(by.model('ctrl.plan.name')).sendKeys(constants.PLAN_NAME);
        element(by.model('ctrl.plan.initialVersion')).sendKeys(constants.PLAN_VERSION_INITIAL);
        // Button should be enabled now
        expect(element(by.buttonText('Create Plan')).isEnabled()).toBe(true);

        // Check if cancel works
        element(by.buttonText('Cancel')).click();

        // Actually create a plan this time
        element(by.linkText('New Plan')).click();
        element(by.model('ctrl.plan.name')).sendKeys(constants.PLAN_NAME);
        element(by.model('ctrl.plan.initialVersion')).sendKeys(constants.PLAN_VERSION_INITIAL);
        element(by.model('ctrl.plan.description')).sendKeys(constants.PLAN_DESC);
        element(by.buttonText('Create Plan')).click();

        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
                constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_INITIAL + '/policies');
        expect(element(by.binding('status')).getText()).toBe('CREATED');
        expect(element(by.binding('value')).getText()).toBe(constants.PLAN_DESC);
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_INITIAL);
    });

    it('can lock a plan with no policies defined', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_INITIAL + '/policies');

        element(by.buttonText('Lock Plan')).click();
        // Check if confirmation modal pops up
        expect(element(by.buttonText('Cancel')).isEnabled()).toBe(true);
        element(by.id('lock')).click();
        expect(element(by.binding('status')).getText()).toBe('LOCKED');
    });

    it('can create a new version of the plan', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_INITIAL + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_INITIAL);

        element(by.buttonText('New Version')).click();
        expect(element(by.buttonText('Create Version')).isEnabled()).toBe(false);
        expect(element(by.model('shouldClone')).isSelected()).toBeTruthy();

        element(by.model('newVersion')).sendKeys(constants.PLAN_VERSION_SECOND);
        expect(element(by.buttonText('Create Version')).isEnabled()).toBe(true);
        element(by.buttonText('Create Version')).click();

        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/policies');
        expect(element(by.binding('status')).getText()).toBe('CREATED');
        expect(element(by.binding('value')).getText()).toBe(constants.PLAN_DESC);
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_SECOND);
    });

    it('can add a Rate Limiting policy to the plan', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_SECOND);
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(0);

        element(by.buttonText('Add Policy')).click();
        browser.waitForAngular();
        expect(element(by.id('add-policy')).isEnabled()).toBe(false);
        element(by.css('.btn.btn-primary.dropdown-toggle')).click();
        browser.sleep(500); // Wait for animation to complete
        element(by.css('.fa.fa-inline.fa-fw.fa-tachometer')).click();
        element(by.model('model[\'minute\']')).sendKeys('6');
        expect(element(by.id('add-policy')).isEnabled()).toBe(true);
        element(by.id('add-policy')).click();
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(1);
    });

    it('can remove the Rate Limiting policy', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_SECOND);
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(1);

        // Can remove a policy
        element(by.buttonText('Remove')).click();
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(0);
    });

    it('can re-add the same policy and lock the plan', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_SECOND);
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(0);

        element(by.buttonText('Add Policy')).click();
        browser.waitForAngular();
        expect(element(by.id('add-policy')).isEnabled()).toBe(false);
        element(by.css('.btn.btn-primary.dropdown-toggle')).click();
        browser.sleep(500); // Wait for animation to complete
        element(by.css('.fa.fa-inline.fa-fw.fa-tachometer')).click();
        element(by.model('model[\'minute\']')).sendKeys('6');
        expect(element(by.id('add-policy')).isEnabled()).toBe(true);
        element(by.id('add-policy')).click();
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(1);

        element(by.buttonText('Lock Plan')).click();
        // Check if confirmation modal pops up
        expect(element(by.buttonText('Cancel')).isEnabled()).toBe(true);
        element(by.id('lock')).click();
        expect(element(by.binding('status')).getText()).toBe('LOCKED');
    });

    it('can switch between plan versions', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_SECOND);

        element(by.binding('entityVersion.version')).click();
        element(by.linkText(constants.PLAN_VERSION_INITIAL)).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_INITIAL + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_INITIAL);
    });

    it('can switch between tabs', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_SECOND);

        element(by.id('activity')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/activity');
        element(by.id('policies')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/policies');
    });

    it('can update the plan description', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plan/' +
            constants.PLAN_NAME.replace(/ /g,'') + '/' + constants.PLAN_VERSION_SECOND + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.PLAN_VERSION_SECOND);

        //Clear description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).clear();
        element(by.css('span[ng-click="doSave()"]')).click();
        expect(element(by.binding('value')).getText()).toEqual('');

        //Update description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).sendKeys(constants.PLAN_DESC);
        element(by.css('span[ng-click="doSave()"]')).click();
        expect(element(by.binding('value')).getText()).toEqual(constants.PLAN_DESC);
    });
});
