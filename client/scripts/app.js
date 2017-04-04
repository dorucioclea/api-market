(function () {
    'use strict';

    let module = angular.module('app', [
        /* Angular modules */
        'ngAnimate',
        'ngResource',
        'ngSanitize',
        'ngAria',
        'ngMaterial',
        'uiSwitch',

        /* 3rd party modules */
        'ui.router',
        'ngStorage',
        'ui.bootstrap',
        'angular-loading-bar',
        'matchMedia',
        'ngTagsInput',
        'schemaForm',
        'angular-clipboard',
        'flow',
        'gridshore.c3js.chart',
        'textAngular',
        'relativeDate',
        'angular-jwt',
        'angular-ladda',
        'btford.markdown',
        'swaggerUi',
        'smart-table',
        'ngFileSaver',

        /* custom modules */
        'app.ctrls',
        'app.config',
        'app.constants',
        'app.directives',
        'app.services',
        'app.filters',
        'app.api',
        'app.apiEngine',
        'app.core.components',
        'app.core.login',
        'app.core.routes',
        'app.core.util',
        'app.ctrl.auth.oauth',
        'app.ctrl.login',
        'app.ctrl.modals',
        'app.ctrl.modals.lifecycle',
        'app.ctrl.modals.support',
        'app.administration',
        'app.applications',
        'app.branding',
        'app.contracts',
        'app.market',
        'app.members',
        'app.notifications',
        'app.organizations',
        'app.plan',
        'app.plugin.lodash',
        'app.policies',
        'app.service',
        'app.swagger',
        'app.tour',
        'app.ui',
        'app.user'

    ]);

    // disable spinner in loading-bar
    module.config(function (cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.latencyThreshold = 100;
    });

        // ngStorage key config
    module.config(function ($localStorageProvider, CONFIG) {
            $localStorageProvider.setKeyPrefix(CONFIG.STORAGE.LOCAL_STORAGE);
        });
    module.config(function ($sessionStorageProvider, CONFIG) {
            $sessionStorageProvider.setKeyPrefix(CONFIG.STORAGE.SESSION_STORAGE);
        });

    module.run(function($state, $rootScope, loginHelper, CONFIG) {
            // TODO improve/fix this mess
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
                if (!loginHelper.checkLoggedIn()) {
                    if (!loginHelper.checkJWTInUrl()) {
                        if (!loginHelper.isTransitioningToError()) {
                            if (loginHelper.checkLoginError()) {
                                if (CONFIG.APP.PUBLISHER_MODE) event.preventDefault();
                            }
                            else if (loginHelper.checkLoginRequiredForState(toState)) {
                                event.preventDefault();
                                loginHelper.redirectToLogin($state.href(toState.name, toParams, {absolute: true}));
                            }
                        } else {
                            if (loginHelper.checkLoginRequiredForState(toState)) event.preventDefault();
                        }
                    } else {
                        loginHelper.extractJWTFromUrl();
                    }
                }
            });

            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                event.preventDefault();
                if (angular.isObject(error)) {
                    switch (error.status) {
                        case 401: // Unauthorized
                            console.log('Unauthorized');
                            if (!loginHelper.checkJWTInUrl() && !loginHelper.checkLoginError()) {
                                console.log('stateChangeError redirect');
                                loginHelper.redirectToLogin();
                            }
                            break;
                        default:
                            $state.get('root.error').error = error;
                            $state.go('root.error');
                            break;
                    }
                }
                else {
                    // unexpected error
                    $state.go('root.error');
                }
            });
        });

    module.config(function ($provide) {
            $provide.decorator('$exceptionHandler', extendExceptionHandler);

            function extendExceptionHandler($delegate) {
                return function(exception, cause) {
                    var errorData = {
                        exception: exception,
                        cause: cause
                    };
                    // TODO custom error handling
                    // console.log(errorData);
                    $delegate(exception, cause);
                };
            }
        });

    module.factory('httpErrorInterceptor', function ($q, $rootScope, EVENTS, _) {
            return {
                response: function (response) {
                    return response;
                },
                responseError: function (response) {
                    // TODO expand HTTP error handler
                    if (!_.isEmpty(response) && response.status === 503) {
                        if (!_.isEmpty(response.data) && response.data.errorCode === 20001) {
                            $rootScope.$broadcast(EVENTS.MAINTENANCE_MODE_ERROR, { code: response.data.errorCode, msg: response.data.message });
                        }
                    }
                    return $q.reject(response);
                }
            };
        });

    module.config(function ($httpProvider, jwtInterceptorProvider) {
            // We're annotating the function so that the $injector works when the file is minified (known issue)
            // jwtInterceptorProvider.tokenGetter = ['$sessionStorage', '$state', '$http', 'jwtHelper', 'loginHelper',
            //     'config', 'CONFIG',
            //     function($sessionStorage, $state, $http, jwtHelper, loginHelper, config, CONFIG) {
            //         // Skip authentication for any requests ending in .html
            //         if (config.url.substr(config.url.length - 5) == '.html') {
            //             return null;
            //         }
            //         // Skip authentication for oauth requests
            //         if (config.url.indexOf('/oauth2/') > -1 &&
            //             config.url.indexOf('/oauth2/reissue') === -1 &&
            //             config.url.indexOf('/currentuser/') === -1 &&
            //             config.url.indexOf('/security/') === -1 &&
            //             config.url.indexOf('/organizations/') === -1) {
            //             return null;
            //         }
            //
            //         // Skip authentication for Swagger UI requests
            //         if (config.isSwaggerUIRequest) {
            //             return null;
            //         }
            //
            //         if ($sessionStorage.jwt) {
            //             if (jwtHelper.isTokenExpired($sessionStorage.jwt)) {
            //                 // Token is expired, user needs to relogin
            //                 console.log('Token expired, redirect to login');
            //                 delete $sessionStorage.jwt;
            //                 console.log('tokenGetter redirect');
            //                 loginHelper.redirectToLogin();
            //             } else {
            //                 // Token is still valid, check if we need to refresh
            //                 var date = jwtHelper.getTokenExpirationDate($sessionStorage.jwt);
            //                 date.setMinutes(date.getMinutes() - 15);
            //                 if (date < new Date()) {
            //                     // do refresh, then return new jwt
            //                     console.log('Refreshing token');
            //                     var refreshUrl = 'auth/login/idp/token/refresh';
            //                     return $http({
            //                         url: refreshUrl,
            //                         // This makes it so that this request doesn't send the JWT
            //                         skipAuthorization: true,
            //                         method: 'POST',
            //                         headers: { 'Content-Type': 'application/json', 'apikey': CONFIG.SECURITY.API_KEY },
            //                         data: {
            //                             originalJWT: $sessionStorage.jwt
            //                         }
            //                     }).then(function(response) {
            //                         $sessionStorage.jwt = response.data.jwt;
            //                         return $sessionStorage.jwt;
            //                     });
            //                 } else {
            //                     return $sessionStorage.jwt;
            //                 }
            //             }
            //         }
            //     }];

            // Http interceptor to handle session timeouts and basic errors
            $httpProvider.interceptors.push('httpErrorInterceptor');
            // $httpProvider.interceptors.push('jwtInterceptor');
    });

    // let auth = {};
    // let logout = function () {
    //     console.log('*** LOGOUT');
    //     auth.loggedIn = false;
    //     auth.authz = null;
    //     window.location = auth.logoutUrl;
    // };
    //
    // angular.element(document).ready(function () {
    //     let keycloakAuth = new Keycloak('../keycloak.json');
    //     auth.loggedIn = false;
    //     keycloakAuth.init({ onLoad: 'check-sso'}).success(function () {
    //         if (keycloakAuth.authenticated) {
    //             auth.loggedIn = true;
    //             auth.authz = keycloakAuth;
    //             angular.bootstrap(document, ["app"]);
    //         } else {
    //             keycloakAuth.init({onLoad: 'login-required'}).success(function () {
    //                 auth.loggedIn = true;
    //                 auth.authz = keycloakAuth;
    //                 angular.bootstrap(document, ["app"]);
    //             }).error(function () {
    //                 console.log('*** ERROR');
    //                 window.location.reload();
    //             });
    //         }
    //     });
    // });
    //
    // module.factory('Auth', function () {
    //     return auth;
    // });
    //
    // // Keycloak interceptor will be used for all requests
    // module.factory('authInterceptor', function ($q, $rootScope, Auth, SIGNBOX) {
    //     return {
    //         request: function (config) {
    //             var deferred = $q.defer();
    //             if (Auth.authz.token) {
    //                 Auth.authz.updateToken(300).success(function () {
    //                     config.headers = config.headers || {};
    //                     config.headers['X-Consumer-JWT'] = Auth.authz.token;
    //                     deferred.resolve(config);
    //                 }).error(function () {
    //                     Auth.authz.clearToken();
    //                     deferred.reject('Failed to refresh token');
    //                     console.log('refresh fail');
    //                     $rootScope.doLogout();
    //                 });
    //             } else {
    //                 // No token found, need to redirect to login
    //                 console.log('no token found');
    //                 $rootScope.doLogout();
    //             }
    //             config.headers.apikey = SIGNBOX.KEY;
    //             return deferred.promise;
    //         }
    //     };
    // });

}());
