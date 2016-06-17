(function () {
    'use strict';

    angular.module('app.core.login', [])
        .service('loginHelper', loginHelper);
    

    function loginHelper($q, $http, $sessionStorage, $state, $location, CONFIG) {
        this.checkLoggedIn = checkLoggedIn;
        this.checkLoginRequiredForState = checkLoginRequiredForState;
        this.checkJWTInSession = checkJWTInSession;
        this.checkJWTInUrl = checkJWTInUrl;
        this.extractJWTFromUrl = extractJWTFromUrl;
        this.logout = logout;
        this.redirectToLogin = redirectToLogin;

        function checkLoggedIn() {
            return checkJWTInSession();
        }

        function checkJWTInSession() {
            return !!$sessionStorage.jwt;
        }

        function checkJWTInUrl() {
            var jwt = $location.search().jwt;
            return (jwt && jwt.length > 0);
        }

        function checkLoginRequiredForState(currentState) {
            switch (currentState.name) {
                case '':
                case 'error':
                case 'oauth':
                case 'logout':
                case 'root.apis.grid':
                case 'root.apis.list':
                case 'root.api':
                case 'root.api.announcements':
                case 'root.api.documentation':
                case 'root.api.plans':
                case 'root.api.scopes':
                case 'root.api.support':
                case 'root.api.terms':
                case 'root.search':
                    return false;
                default:
                    return true;
            }
        }

        function extractJWTFromUrl() {
            var deferred = $q.defer();

            var jwt = $location.search().jwt;
            if (jwt && jwt.length > 0) {
                console.log('jwt found');
                $sessionStorage.jwt = jwt;
                delete $sessionStorage.loginInProgress;
                // if ($sessionStorage.redirect) {
                //     var redirect = $sessionStorage.redirect;
                // }
                delete $sessionStorage.redirect;
                // if (redirect)
                // window.location.href = 'http://localhost:9000/';
                // else
                window.location.href = window.location.origin;
                console.log('logged in');
                deferred.resolve("Logged In");
            } else {
                // return false;
            }
            return deferred.promise;
        }

        function logout() {
            currentUser.getInfo().then(function (info) {
                var logOutObject = {
                    idpUrl: CONFIG.SECURITY.IDP_URL,
                    spName: CONFIG.SECURITY.SP_NAME,
                    username: info.username
                };
                LogOutRedirect.save({}, logOutObject, function (reply) {
                    console.log(reply);
                    var string = '';
                    angular.forEach(reply, function (value) {
                        if (typeof value === 'string') {
                            string += value;
                        }
                    });
                    console.log(string);
                    if (jwtHelper.isTokenExpired($sessionStorage.jwt)) {
                        $state.go('logout');
                    } else {
                        window.location.href = string;
                    }
                    delete $sessionStorage.jwt;
                    delete $sessionStorage.redirect;
                    delete $sessionStorage.loginInProgress;
                });
            })

        }

        function redirectToLogin(redirectUrl) {
            if (!$sessionStorage.loginInProgress) {
                // WSO2 Fix -- WSO2 has race condition when multiple redirect requests are sent with same SAML
                // Setting this boolean prevents additional requests from being sent
                if (CONFIG.SECURITY.WSO2_LOGIN_FIX) {
                    $sessionStorage.loginInProgress = true;
                }
                if (!$sessionStorage.redirect) {
                    if (redirectUrl) $sessionStorage.redirect = redirectUrl;
                    else $sessionStorage.redirect = window.location.href;
                }
                var url = CONFIG.AUTH.URL + CONFIG.SECURITY.REDIRECT_URL;
                var data = '{"idpUrl": "' + CONFIG.SECURITY.IDP_URL + '", "spUrl": "' +
                    CONFIG.SECURITY.SP_URL + '", "spName": "' + CONFIG.SECURITY.SP_NAME +
                    '", "clientAppRedirect": "' + $sessionStorage.redirect + '", "token": "' +
                    CONFIG.SECURITY.CLIENT_TOKEN + '"}';

                return $http({
                    method: 'POST',
                    skipAuthorization: true,
                    url: url,
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    responseType: 'text'
                }).then(function (result) {
                    console.log("redirect result: "+JSON.stringify(result));
                    window.location.href = result.data;
                }, function (error) {
                    $state.go('accessdenied');
                    console.log('Request failed with error code: ', error.status);
                    console.log(error);
                });
            }
        }
    }

}());
