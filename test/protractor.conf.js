exports.config = {
    framework: 'jasmine2',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['e2e/*.js', 'e2e/mkt/*.js', 'e2e/pub/*.js']
};