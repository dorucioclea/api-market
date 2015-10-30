describe('Organization Page', function() {

    it('should be able to navigate to the Protractor org by clicking the link', function () {
        browser.get('http://pub.t1t.be/#/my-organizations');
        element(by.linkText('Protractor')).click();

        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toContain('#/org/Protractor/');
    });

    it('can update the org description', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/');
        browser.waitForAngular();

        //Clear description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).clear();
        element(by.css('span[ng-click="doSave()"]')).click();
        expect(element(by.binding('value')).getText()).toEqual('');

        //Update description
        element(by.css('.fa.fa-pencil')).click();
        element(by.model('view.editableValue')).sendKeys('E2E Testing Organization');
        element(by.css('span[ng-click="doSave()"]')).click();

        expect(element(by.binding('value')).getText()).toEqual('E2E Testing Organization');
    });

    it('can switch between tabs', function () {
        browser.get('http://pub.t1t.be/#/org/Protractor/');
        browser.waitForAngular();

        expect(browser.getCurrentUrl()).toBe('http://pub.t1t.be/#/org/Protractor/plans');
        element(by.id('services')).click();
        expect(browser.getCurrentUrl()).toBe('http://pub.t1t.be/#/org/Protractor/services');
        element(by.id('members')).click();
        expect(browser.getCurrentUrl()).toBe('http://pub.t1t.be/#/org/Protractor/members');
        element(by.id('plans')).click();
        expect(browser.getCurrentUrl()).toBe('http://pub.t1t.be/#/org/Protractor/plans');
    })
});
