exports.config = {
    framework: 'jasmine2',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['e2e/login_pub.js', 'e2e/organizations.js', 'e2e/pub/*.js', 'e2e/login_mkt.js', 'e2e/mkt/*.js']
};