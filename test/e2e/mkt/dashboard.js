describe('My Organizations Page', function() {

    it('should be able to navigate to the Protractor org by clicking the link', function () {
        browser.get('http://mkt.t1t.be/#/my-organizations');
        element.all(by.repeater('org in orgs')).filter(function(org) {
            org.element(by.binding('name')).getText().then(function (txt) {
                return txt === 'Protractor';
            });
        }).click();

        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toContain('#/org/Protractor/applications');
    });
});
