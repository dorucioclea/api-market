describe('My Organizations Page', function() {

    it('should be able to navigate to the Protractor org by clicking the link', function () {
        browser.get('http://mkt.t1t.be/#/my-organizations');
        element(by.linkText('Protractor')).click();

        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toContain('#/org/Protractor/applications');
    });
});
