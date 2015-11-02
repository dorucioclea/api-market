describe('Organization Plan Creation', function() {

    // Plan to test with
    var planName = 'End To End Three';
    var planInitialVersion = 'v1';
    var planSecondVersion = 'v2';
    var planDescription = 'Plan created by E2E tests';

    it('can create a new plan', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/');
        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toBe('http://pub.t1t.be/#/org/Protractor/plans');

        element(by.linkText('New Plan')).click();
        //Button should be disabled if no data has been entered
        expect(element(by.buttonText('Create Plan')).isEnabled()).toBe(false);
        element(by.model('ctrl.plan.name')).sendKeys(planName);
        element(by.model('ctrl.plan.initialVersion')).sendKeys(planInitialVersion);
        // Button should be enabled now
        expect(element(by.buttonText('Create Plan')).isEnabled()).toBe(true);

        // Check if cancel works
        element(by.buttonText('Cancel')).click();

        // Actually create a plan this time
        element(by.linkText('New Plan')).click();
        element(by.model('ctrl.plan.name')).sendKeys(planName);
        element(by.model('ctrl.plan.initialVersion')).sendKeys(planInitialVersion);
        element(by.model('ctrl.plan.description')).sendKeys(planDescription);
        element(by.buttonText('Create Plan')).click();

        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' + planName.replace(/ /g,'') + '/' + planInitialVersion + '/policies');
        expect(element(by.binding('status')).getText()).toBe('CREATED');
        expect(element(by.binding('value')).getText()).toBe(planDescription);
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planInitialVersion);
    });

    it('can lock a plan with no policies defined', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planInitialVersion);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planInitialVersion + '/policies');

        element(by.buttonText('Lock Plan')).click();
        // Check if confirmation modal pops up
        expect(element(by.buttonText('Cancel')).isEnabled()).toBe(true);
        element(by.id('lock')).click();
        expect(element(by.binding('status')).getText()).toBe('LOCKED');
    });

    it('can create a new version of the plan', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planInitialVersion);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planInitialVersion + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planInitialVersion);

        element(by.buttonText('New Version')).click();
        expect(element(by.buttonText('Create Version')).isEnabled()).toBe(false);
        expect(element(by.model('shouldClone')).isSelected()).toBeTruthy();

        element(by.model('newVersion')).sendKeys(planSecondVersion);
        expect(element(by.buttonText('Create Version')).isEnabled()).toBe(true);
        element(by.buttonText('Create Version')).click();

        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/policies');
        expect(element(by.binding('status')).getText()).toBe('CREATED');
        expect(element(by.binding('value')).getText()).toBe(planDescription);
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planSecondVersion);
    });

    it('can add a Rate Limiting policy to the plan', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planSecondVersion);
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
        browser.get('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planSecondVersion);
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(1);

        // Can remove a policy
        element(by.buttonText('Remove')).click();
        expect(element.all(by.repeater('policy in ctrl.policies')).count()).toEqual(0);
    });

    it('can re-add the same policy and lock the plan', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planSecondVersion);
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
        browser.get('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planSecondVersion);

        element(by.binding('entityVersion.version')).click();
        element(by.linkText(planInitialVersion)).click();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planInitialVersion + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planInitialVersion);
    });

    it('can switch between tabs', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planSecondVersion);

        element(by.id('activity')).click();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/activity');
        element(by.id('policies')).click();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/policies');
    });

    it('can update the plan description', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion);
        browser.waitForAngular();
        expect(browser.getCurrentUrl())
            .toBe('http://pub.t1t.be/#/org/Protractor/plan/' +
            planName.replace(/ /g,'') + '/' + planSecondVersion + '/policies');
        expect(element(by.binding('entityVersion.version')).getText()).toContain(planSecondVersion);

        //Clear description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).clear();
        element(by.css('span[ng-click="doSave()"]')).click();
        expect(element(by.binding('value')).getText()).toEqual('');

        //Update description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).sendKeys(planDescription);
        element(by.css('span[ng-click="doSave()"]')).click();
        expect(element(by.binding('value')).getText()).toEqual(planDescription);
    });
});
