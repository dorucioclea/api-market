(function () {
    'use strict';

    angular.module('app.core.login', [])
        .service('loginHelper', loginHelper);
    

    function loginHelper($q, $http, $localStorage, $sessionStorage, $state, $location, $window, resourceUtil, currentUser, LogOutRedirect, CONFIG, errorHelper, _) {
        this.checkIsFirstVisit = checkIsFirstVisit;
        this.checkLoginError = checkLoginError;
        this.checkLoggedIn = checkLoggedIn;
        this.checkLoginRequiredForState = checkLoginRequiredForState;
        this.checkJWTInSession = checkJWTInSession;
        this.checkJWTInUrl = checkJWTInUrl;
        this.extractJWTFromUrl = extractJWTFromUrl;
        this.isTransitioningToError = isTransitioningToError;
        this.logout = logout;
        this.redirectToLogin = redirectToLogin;

        var transitionToError = false;
        var LOGIN_ERROR_CODE = '20002';

        function isTransitioningToError() {
            return transitionToError;
        }
        
        function checkIsFirstVisit() {
            return !!$localStorage.hasVisited;
        }

        function checkLoginError() {
            if (checkErrorInUrl()) {
                var error = $location.search().errorcode;
                var msg = $location.search().errormessage;
                if (error === LOGIN_ERROR_CODE) {
                    if (CONFIG.APP.PUBLISHER_MODE) {
                        transitionToError = true;
                        $state.get('root.maintenance').error = angular.copy(msg);
                        $state.go('root.maintenance').then(function () {
                            transitionToError = false;
                        });
                    } else {
                        errorHelper.showLoginErrorModal(error, msg);
                    }
                }
                $location.search('errormessage', null);
                $location.search('errorcode', null);
                return true;
            }
            return false;
        }

        function checkLoggedIn() {
            return checkJWTInSession();
        }

        function checkJWTInSession() {
            return !!$sessionStorage.jwt;
        }

        function checkErrorInUrl() {
            return !_.isEmpty($location.search().errorcode);
        }

        function checkJWTInUrl() {
            var jwt = $location.search().jwt;
            return !_.isEmpty(jwt);
        }

        function checkLoginRequiredForState(currentState) {
            switch (currentState.name) {
                case '':
                case 'accessdenied':
                case 'root.error':
                case 'root.maintenance':
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
                $sessionStorage.jwt = jwt;
                delete $sessionStorage.loginInProgress;
                $location.search('jwt', null);
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
                    username: info.username,
                    relayState: $window.location.origin
                };
                LogOutRedirect.save({}, logOutObject, function (reply) {
                    var cleanReply = resourceUtil.cleanResponse(reply);
                    var string = '';
                    angular.forEach(cleanReply, function (letter) {
                        string += letter;
                    });
                    logoutRedirect();
                    $window.location.href = string;
                }, function () {
                    logoutRedirect();
                });

                function logoutRedirect() {
                    // $state.go('logout');
                    delete $sessionStorage.jwt;
                    delete $sessionStorage.loginInProgress;
                }
            })

        }

        function redirectToLogin(redirectUrl) {
            if (!$sessionStorage.loginInProgress) {
                // WSO2 Fix -- WSO2 has race condition when multiple redirect requests are sent with same SAML
                // Setting this boolean prevents additional requests from being sent
                if (CONFIG.SECURITY.WSO2_LOGIN_FIX) {
                    $sessionStorage.loginInProgress = true;
                }
                var redirect = window.location.href;
                if (redirectUrl) redirect = redirectUrl;
                var url = CONFIG.AUTH.URL + CONFIG.SECURITY.REDIRECT_URL;
                var data = '{"idpUrl": "' + CONFIG.SECURITY.IDP_URL + '", "spUrl": "' +
                    CONFIG.SECURITY.SP_URL + '", "spName": "' + CONFIG.SECURITY.SP_NAME +
                    '", "clientAppRedirect": "' + redirect + '", "token": "' +
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
                    window.location.href = result.data;
                }, function () {
                    $state.go('accessdenied');
                });
            }
        }
    }

}());
