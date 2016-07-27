;(function() {
    'use strict';

    angular.module('app.policies')

        .constant('POLICIES', {
            'OAUTH2': 'OAuth2',
            'GALILEO': 'Analytics',
            'RATE_LIMIT': 'RateLimiting',
            'REQ_TRANSFORM': 'RequestTransformer',
            'RES_TRANSFORM': 'ResponseTransformer',
            'JWT': 'JWT',
            'KEY_AUTH': 'KeyAuthentication',
            'CORS': 'CORS',
            'IP_RESTRICT': 'IpRestriction',
            'TCP_LOG': 'TCPLog',
            'UDP_LOG': 'UDPLog',
            'REQ_SIZE_LIMIT': 'RequestSizeLimiting'
        });

})();
