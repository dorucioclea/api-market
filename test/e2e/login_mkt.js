var constants = require('./test_constants.js');

describe('Login sequence', function() {

    it('should store the api key for further use', function () {
        browser.get(constants.MKT_BASE_URL + '?apikey=ba7db8edb4f44c9acced40858e0ccc46');
    });
});