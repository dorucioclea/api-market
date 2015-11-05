;(function(angular){
"use strict";

angular.module('app.config', [])

.constant('CONFIG', {BASE:{URL:'http://rasu076.rte.antwerpen.local/rte/apiengine/v1',API_KEY_NAME:'apikey'},AUTH:{URL:'http://rasu076.rte.antwerpen.local/rte/apiengineauth/v1'},STORAGE:{LOCAL_STORAGE:'apim-',SESSION_STORAGE:'apim_session-'},SECURITY:{REDIRECT_URL:'/users/idp/redirect',API_KEY:'229e2ea08ba94919c9d221cdf3be1f7d',IDP_URL:'https://identityserver-a.antwerpen.be/samlsso',SP_URL:'http://rasu073.rte.antwerpen.local/API-Engine-web/v1/users/idp/callback',SP_NAME:'apiengine',CLIENT_TOKEN:'opaque'}})

; 

})(window.angular);