(function () {
    'use strict';

    angular.module('app', [
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

        ])

        // disable spinner in loading-bar
        .config(function (cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.latencyThreshold = 100;
        })

        // ngStorage key config
        .config(function ($localStorageProvider, CONFIG) {
            $localStorageProvider.setKeyPrefix(CONFIG.STORAGE.LOCAL_STORAGE);
        })
        .config(function ($sessionStorageProvider, CONFIG) {
            $sessionStorageProvider.setKeyPrefix(CONFIG.STORAGE.SESSION_STORAGE);
        })

        .run(function($state, $rootScope, loginHelper) {
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
                if (!loginHelper.checkLoggedIn()) {
                    if (!loginHelper.checkJWTInUrl()) {
                        if (loginHelper.checkLoginRequiredForState(toState)) {
                            event.preventDefault();
                            loginHelper.redirectToLogin($state.href(toState.name, toParams, {absolute: true}));
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
                            if (!loginHelper.checkJWTInUrl()) {
                                console.log('stateChangeError redirect');
                                loginHelper.redirectToLogin();
                            }
                            break;
                        default:
                            $state.get('error').error = error;
                            $state.go('error');
                            break;
                    }
                }
                else {
                    // unexpected error
                    $state.go('error');
                }
            });
        })

        .factory('apikeyInjector', function(CONFIG) {
            return {
                request: function (config) {
                    // Add API key header, unless the request originates from Swagger UI
                    if (!config.isSwaggerUIRequest) config.headers.apikey = CONFIG.SECURITY.API_KEY;
                    return config;
                }
            };
        })

        .config(function ($httpProvider, jwtInterceptorProvider) {
            // We're annotating the function so that the $injector works when the file is minified (known issue)
            jwtInterceptorProvider.tokenGetter = ['$sessionStorage', '$state', '$http', 'jwtHelper', 'loginHelper',
                'config', 'CONFIG',
                function($sessionStorage, $state, $http, jwtHelper, loginHelper, config, CONFIG) {
                    // Skip authentication for any requests ending in .html
                    if (config.url.substr(config.url.length - 5) == '.html') {
                        return null;
                    }
                    // Skip authentication for oauth requests
                    if (config.url.indexOf('/oauth2/') > -1 &&
                        config.url.indexOf('/oauth2/reissue') === -1 &&
                        config.url.indexOf('/currentuser/') === -1 &&
                        config.url.indexOf('/security/') === -1 &&
                        config.url.indexOf('/organizations/') === -1) {
                        return null;
                    }

                    // Skip authentication for Swagger UI requests
                    if (config.isSwaggerUIRequest) {
                        return null;
                    }

                    if ($sessionStorage.jwt) {
                        if (jwtHelper.isTokenExpired($sessionStorage.jwt)) {
                            // Token is expired, user needs to relogin
                            console.log('Token expired, redirect to login');
                            delete $sessionStorage.jwt;
                            console.log('tokenGetter redirect');
                            loginHelper.redirectToLogin();
                        } else {
                            // Token is still valid, check if we need to refresh
                            var date = jwtHelper.getTokenExpirationDate($sessionStorage.jwt);
                            date.setMinutes(date.getMinutes() - 15);
                            if (date < new Date()) {
                                // do refresh, then return new jwt
                                console.log('Refreshing token');
                                var refreshUrl = CONFIG.AUTH.URL + '/login/idp/token/refresh';
                                return $http({
                                    url: refreshUrl,
                                    // This makes it so that this request doesn't send the JWT
                                    skipAuthorization: true,
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'apikey': CONFIG.SECURITY.API_KEY },
                                    data: {
                                        originalJWT: $sessionStorage.jwt
                                    }
                                }).then(function(response) {
                                    $sessionStorage.jwt = response.data.jwt;
                                    return $sessionStorage.jwt;
                                });
                            } else {
                                return $sessionStorage.jwt;
                            }
                        }
                    }
                }];
            $httpProvider.interceptors.push('jwtInterceptor');
            $httpProvider.interceptors.push('apikeyInjector');
        })

}());
