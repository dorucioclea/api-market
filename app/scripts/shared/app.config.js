;(function(angular) {
    'use strict';

    angular.module('app.config', [])

    .constant('CONFIG', {
            BASE: {
                URL:'http://dev.apim.t1t.be:8000/dev/apiengine/v1',
                API_KEY_NAME:'apikey'
            },
            AUTH: {
                URL: 'http://dev.apim.t1t.be:8000/dev/apiengineauth/v1'
            },
            STORAGE: {
                LOCAL_STORAGE: 'apim-',
                SESSION_STORAGE: 'apim_session-'
            },
            SECURITY: {
                REDIRECT_URL: '/users/idp/redirect',
                API_KEY: '6b8406cc81fe4ca3cc9cd4a0abfb97c2',
                IDP_URL: 'https://dev.idp.t1t.be:9443/samlsso',
                SP_URL: 'http://dev.api.t1t.be/API-Engine-web/v1/users/idp/callback',
                SP_NAME: 'apimarket',
                CLIENT_TOKEN: 'opaque'
            }
        });

})(window.angular);
