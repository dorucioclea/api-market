describe('My Organizations Page', function() {

    it('should have at least one organization listed', function () {
        browser.get('http://mkt.t1t.be/#/my-organizations');

        var orgs = element.all(by.repeater('org in orgs'));
        expect(orgs.count()).toBeGreaterThan(0);

        element.all(by.repeater('org in orgs')).then(function(orgs) {
            var orgElement = orgs[0].element(by.binding('name'));
            expect(orgElement.getText()).toEqual('Digipolis');
        });
    });

    it('should create a Protractor org if none exists', function () {
        browser.get('http://mkt.t1t.be/#/my-organizations');
        var originalCount =  element.all(by.repeater('org in orgs')).count();
        var alreadyCreated = false;

        element.all(by.repeater('org in orgs')).then(function (orgs) {
            var promises = [];
            for (var i = 0; i < orgs.length; i++) {
                promises.push(orgs[i].element(by.binding('name')).getText());
            }

            return protractor.promise.all(promises).then(function(results){
                for (var j = 0; j < results.length; j++) {
                    if (results[j] === 'Protractor') {
                        alreadyCreated = true;
                        break;
                    }
                }

                if (!alreadyCreated) {
                    element(by.buttonText('New Organization')).click();
                    element(by.model('ctrl.organization.name')).sendKeys('Protractor');
                    element(by.model('ctrl.organization.description')).sendKeys('E2E test organization');
                    element(by.buttonText('Create Organization')).click();

                    browser.get('http://mkt.t1t.be/#/my-organizations');
                    var newOrgs = element.all(by.repeater('org in orgs'));
                    var newCount = newOrgs.count();

                    expect(originalCount).toBeLessThan(newCount);
                    expect(newCount).toEqual(originalCount + 1);
                }
            });
        });
    });
});
