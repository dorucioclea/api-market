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

            /* custom modules */
            'app.ctrls',
            'app.config',
            'app.constants',
            'app.directives',
            'app.services',
            'app.filters',
            'app.api',
            'app.apiEngine',
            'app.ctrl.auth.oauth',
            'app.ctrl.login',
            'app.ctrl.modals',
            'app.ctrl.modals.lifecycle',
            'app.ctrl.modals.support',
            'app.ctrl.plan',
            'app.ctrl.user',
            'app.administration',
            'app.applications',
            'app.contracts',
            'app.market',
            'app.members',
            'app.notifications',
            'app.organizations',
            'app.routes',
            'app.service',
            'app.swagger',
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
            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                event.preventDefault();
                if (angular.isObject(error)) {
                    switch (error.status) {
                        case 401: // Unauthorized
                            console.log('Unauthorized');
                            if (!loginHelper.checkJWTInUrl()) loginHelper.redirectToLogin();
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
                    if (config.url.indexOf('/oauth2/') > -1 ) {
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
                            loginHelper.redirectToLogin();
                        } else {
                            // Token is still valid, check if we need to refresh
                            var date = jwtHelper.getTokenExpirationDate($sessionStorage.jwt);
                            date.setMinutes(date.getMinutes() - 5);
                            if (date < new Date()) {
                                // do refresh, then return new jwt
                                console.log('Refreshing token');
                                var refreshUrl = CONFIG.AUTH.URL + '/login/idp/token/refresh';
                                return $http({
                                    url: refreshUrl,
                                    // This makes it so that this request doesn't send the JWT
                                    skipAuthorization: true,
                                    method: 'POST',
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
