var constants = require('../test_constants.js');

describe('Organization Service Creation', function() {

    it('can create a new service', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/');
        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/plans');

        element(by.id('services')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/services');

        element(by.linkText('New Service')).click();

        // Check if cancel works
        element(by.buttonText('Cancel')).click();

        element(by.linkText('New Service')).click();

        //Button should be disabled if no data has been entered
        expect(element(by.buttonText('Create Service')).isEnabled()).toBe(false);
        element(by.model('ctrl.service.name')).sendKeys(constants.SVC_NAME);
        element(by.model('ctrl.service.initialVersion')).sendKeys(constants.SVC_VERSION_INITIAL);
        element(by.model('ctrl.service.basepath')).sendKeys(constants.SVC_BASEPATH);
        // Button should be enabled now
        expect(element(by.buttonText('Create Service')).isEnabled()).toBe(true);

        // Try incorrect basepath
        element(by.model('ctrl.service.basepath')).clear();
        element(by.model('ctrl.service.basepath')).sendKeys('/' + constants.SVC_BASEPATH);
        expect(element(by.buttonText('Create Service')).isEnabled()).toBe(false);

        // Reset to correct basepath
        element(by.model('ctrl.service.basepath')).clear();
        element(by.model('ctrl.service.basepath')).sendKeys(constants.SVC_BASEPATH);
        expect(element(by.buttonText('Create Service')).isEnabled()).toBe(true);

        element(by.model('ctrl.service.description')).sendKeys(constants.SVC_DESC);
        // TODO Add test for category tags
        element(by.buttonText('Create Service')).click();

        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' + constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');
        expect(element(by.binding('status')).getText()).toBe('CREATED');
        expect(element(by.binding('value')).getText()).toBe(constants.SVC_DESC);
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.SVC_VERSION_INITIAL);
        expect(element(by.binding('endpoint')).getText()).toBe('/' + constants.SVC_BASEPATH);
    });

    it('can set the implementation endpoint', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');

        element(by.id('implementation')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/implementation');
        expect(element(by.model('updatedService.endpoint')).getText()).toBe('');
        expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
        element(by.model('updatedService.endpoint')).clear();
        element(by.model('updatedService.endpoint')).sendKeys(constants.SVC_IMPL_ENDPOINT);
        expect(element(by.buttonText('Save')).isEnabled()).toBe(true);
        element(by.buttonText('Save')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/definition');
    });

    it('can upload a definition file', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');

        element(by.id('definition')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/definition');

        expect(element(by.buttonText('Save')).isEnabled()).toBe(false);

        var path = require('path');
        var fileToUpload = '../test_definition.json',
            absolutePath = path.resolve(__dirname, fileToUpload);

        $('input[type="file"]').sendKeys(absolutePath);

        browser.sleep(1500); // Wait for processing to complete
        expect(element(by.buttonText('Save')).isEnabled()).toBe(true);
        element(by.buttonText('Save')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/plans');
    });

    it('can select a plan to use', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');

        element(by.id('plans')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/plans');

        expect(element.all(by.repeater('plan in plans')).count()).toBeGreaterThan(0);
        expect(element(by.buttonText('Save')).isEnabled()).toBe(false);

        function clicksvc() {
            var x = $('input[type="checkbox"]');
            x.click();
        }
        browser.executeScript(clicksvc);
        expect(element(by.buttonText('Save')).isEnabled()).toBe(true);
        element(by.buttonText('Save')).click();

        expect(element(by.binding('status')).getText()).toBe('READY');
    });

    it('can add a Rate Limiting policy to the service', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');

        element(by.id('policies')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/policies');

        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toBe(0);

        element(by.buttonText('Add Policy')).click();
        browser.waitForAngular();
        expect(element(by.id('add-policy')).isEnabled()).toBe(false);
        element(by.css('.btn.btn-primary.dropdown-toggle')).click();
        browser.sleep(500); // Wait for animation to complete
        element(by.css('.fa.fa-inline.fa-fw.fa-tachometer')).click();
        element(by.model('model[\'second\']')).sendKeys('10');
        expect(element(by.id('add-policy')).isEnabled()).toBe(true);
        element(by.id('add-policy')).click();
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(1);
    });

    it('can remove the newly added policy', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');

        element(by.id('policies')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/policies');

        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toBe(1);

        // Can remove a policy
        element(by.buttonText('Remove')).click();
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(0);
    });

    it('can add an OAuth2 policy', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');

        element(by.id('policies')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/policies');

        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toBe(0);

        element(by.buttonText('Add Policy')).click();
        browser.waitForAngular();
        expect(element(by.id('add-policy')).isEnabled()).toBe(false);
        element(by.css('.btn.btn-primary.dropdown-toggle')).click();
        browser.sleep(500); // Wait for animation to complete
        element(by.css('.fa.fa-inline.fa-fw.fa-sign-in')).click();
        element(by.id('scope')).sendKeys('full');
        element(by.id('scope_desc')).sendKeys('Complete access');
        element(by.model('model[\'mandatory_scope\']')).click();
        element(by.model('model[\'enable_implicit_grant\']')).click();
        element(by.model('model[\'enable_client_credentials\']')).click();
        expect(element(by.id('add-policy')).isEnabled()).toBe(true);
        element(by.id('add-policy')).click();
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(1);
    });

    it('can add some Service Terms', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');

        element(by.id('terms')).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/terms');
        browser.waitForAngular();
        expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
        element(by.model('html')).sendKeys('Service Terms' +
            'E2E Testing is really fun!' +
            'This service was created by the E2E tests for APIM. It does not actually do anything.' +
            'Here are some of Google\'s terms of service:' +
            'About Software in our Services' +
            'When a Service requires or includes downloadable software, this software may update automatically on your device once a new version or feature is available. Some Services may let you adjust your automatic update settings.' +
            'Google gives you a personal, worldwide, royalty-free, non-assignable and non-exclusive license to use the software provided to you by Google as part of the Services. This license is for the sole purpose of enabling you to use and enjoy the benefit of the Services as provided by Google, in the manner permitted by these terms. You may not copy, modify, distribute, sell, or lease any part of our Services or included software, nor may you reverse engineer or attempt to extract the source code of that software, unless laws prohibit those restrictions or you have our written permission.' +
            'Open source software is important to us. Some software used in our Services may be offered under an open source license that we will make available to you. There may be provisions in the open source license that expressly override some of these terms.');
        browser.sleep(500);
        expect(element(by.buttonText('Save')).isEnabled()).toBe(true);
        element(by.buttonText('Save')).click();
    });

    it('can publish the service', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');
        expect(element(by.buttonText('Publish')).isEnabled()).toBe(true);
        element(by.buttonText('Publish')).click();

        expect(element(by.buttonText('Confirm Publication')).isEnabled()).toBe(true);
        element(by.buttonText('Confirm Publication')).click();
        expect(element(by.binding('status')).getText()).toBe('PUBLISHED');
    });

    it('can retire the service', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');
        expect(element(by.buttonText('Retire')).isEnabled()).toBe(true);
        element(by.buttonText('Retire')).click();

        expect(element(by.buttonText('Retire Service')).isEnabled()).toBe(true);
        element(by.buttonText('Retire Service')).click();
        expect(element(by.binding('status')).getText()).toBe('RETIRED');
    });

    it('can create a new version of the service', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.SVC_VERSION_INITIAL);

        element(by.buttonText('New Version')).click();
        expect(element(by.buttonText('Create Version')).isEnabled()).toBe(false);
        expect(element(by.model('shouldClone')).isSelected()).toBeTruthy();

        element(by.model('newVersion')).sendKeys(constants.SVC_VERSION_SECOND);
        expect(element(by.buttonText('Create Version')).isEnabled()).toBe(true);
        element(by.buttonText('Create Version')).click();

        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_SECOND + '/overview');
        expect(element(by.binding('status')).getText()).toBe('CREATED');
        expect(element(by.binding('value')).getText()).toBe(constants.SVC_DESC);
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.SVC_VERSION_SECOND);
    });

    it('can switch between service versions', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_SECOND);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_SECOND + '/overview');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.SVC_VERSION_SECOND);

        element(by.binding('entityVersion.version')).click();
        element(by.linkText(constants.SVC_VERSION_INITIAL)).click();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_INITIAL + '/overview');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.SVC_VERSION_INITIAL);
    });

    it('can update the service description', function () {
        browser.get(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_SECOND);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe(constants.PUB_BASE_URL + '#/org/' + constants.ORG_NAME.replace(/ /g,'') + '/service/' +
            constants.SVC_NAME.replace(/ /g,'') + '/' + constants.SVC_VERSION_SECOND + '/overview');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(constants.SVC_VERSION_SECOND);

        //Clear description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).clear();
        element(by.css('span[ng-click="doSave()"]')).click();
        expect(element(by.binding('value')).getText()).toEqual('');

        //Update description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).sendKeys(constants.SVC_DESC);
        element(by.css('span[ng-click="doSave()"]')).click();
        expect(element(by.binding('value')).getText()).toEqual(constants.SVC_DESC);
    });
});
