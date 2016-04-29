;(function(angular) {
    'use strict';

    angular.module('app.ctrls', [])

        // Root Controller
        .controller('AppCtrl', ['$rootScope', '$scope', '$state', '$modal', '$timeout',
            'Action', 'ACTIONS', 'currentUserModel', 'toastService', 'TOAST_TYPES', 'docTester', '$sessionStorage', 'CONFIG',
            function($rs, $scope, $state, $modal, $timeout,
                     Action, ACTIONS, currentUserModel, toastService, TOAST_TYPES, docTester, $sessionStorage, CONFIG) {
                var mm = window.matchMedia('(max-width: 767px)');

                $rs.isMobile = mm.matches ? true : false;

                $rs.safeApply = function(fn) {
                    var phase = this.$root.$$phase;
                    if (phase === '$apply' || phase === '$digest') {
                        if (fn && (typeof(fn) === 'function')) {
                            fn();
                        }
                    } else {
                        this.$apply(fn);
                    }
                };

                $rs.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error) {
                    if (error === 'Not Authorized') {
                        console.log('not authorized');
                        toastService.createToast(TOAST_TYPES.DANGER, 'You are not authorized to perform this action', true);
                    }
                });

                mm.addListener(function(m) {
                    $rs.safeApply(function() {
                        $rs.isMobile = (m.matches) ? true : false;
                    });
                });

                $scope.publisherMode = CONFIG.APP.PUBLISHER_MODE;

                //Make currentUserModel available to all child controllers
                $scope.User = currentUserModel;

                $scope.togglePublisher = function () {
                    $scope.publisherMode = !$scope.publisherMode;
                    setHeader();
                };

                var setHeader = function () {
                    $scope.header = 'ACPAAS - API ' + ($scope.publisherMode ? 'Publisher' : 'Marketplace');
                };
                setHeader();

                $scope.loadSwaggerUi = function(spec, domId, endpoint, disableTryout) {
                    $scope.swaggerUi = new SwaggerUi({
                        spec: spec,
                        dom_id: domId,
                        showRequestHeaders: true,
                        url: (endpoint === undefined || endpoint === null) ? '/' : endpoint.managedEndpoint,
                        supportedSubmitMethods: (disableTryout || endpoint === undefined || endpoint === null) ?
                            [] : ['get', 'post', 'put', 'delete', 'patch'],
                        validatorUrl: null,
                        apisSorter: 'alpha',
                        operationsSorter: 'alpha',
                        docExpansion: 'none',
                        onComplete: function() {
                            $('#' + domId).find('a').each(function(idx, elem) {
                                    var href = $(elem).attr('href');
                                    if (href[0] === '#') {
                                        $(elem).removeAttr('href');
                                    }
                                })
                                .find('div.sandbox_header').each(function(idx, elem) {
                                    $(elem).remove();
                                })
                                .find('li.operation div.auth').each(function(idx, elem) {
                                    $(elem).remove();
                                })
                                .find('li.operation div.access').each(function(idx, elem) {
                                $(elem).remove();
                            });
                            $scope.$apply(function(error) {
                                $scope.definitionStatus = 'complete';
                            });
                            addApiKeyAuthorization();
                        },
                        onFailure: function() {
                            $scope.$apply(function(error) {
                                $scope.definitionStatus = 'error';
                                $scope.hasError = true;
                                $scope.error = error;
                            });
                        }
                    });
                    function addApiKeyAuthorization() {
                        //Add API key
                        var key;
                        if (docTester.preferredContract) {
                            key = docTester.apikey;
                        } else {
                            key = encodeURIComponent(CONFIG.SECURITY.API_KEY);
                        }
                        if (key && key.trim() !== '') {
                            $scope.swaggerUi.api.clientAuthorizations.add('key',
                                new SwaggerClient.ApiKeyAuthorization('apikey', key, 'header'));
                        }
                    }
                    $scope.swaggerUi.load();
                };

                $scope.updateSwaggerApiKeyHeader = function () {
                    $scope.swaggerUi.api.clientAuthorizations.add('key',
                        new SwaggerClient.ApiKeyAuthorization('apikey', docTester.apikey, 'header'));
                };

                $scope.addJWTHeader = function () {
                    // Add JWT
                    var jwt = encodeURIComponent($sessionStorage.jwt);
                    if (jwt && jwt.trim() !== '') {
                        $scope.swaggerUi.api.clientAuthorizations.add('jwt',
                            new SwaggerClient.ApiKeyAuthorization('Authorization', 'Bearer ' + jwt, 'header'));
                    }
                };

                $scope.addCustomSwaggerHeader = function (header) {
                    $scope.swaggerUi.api.clientAuthorizations.add(header.name,
                        new SwaggerClient.ApiKeyAuthorization(header.name, header.value, 'header'));
                };

                $scope.navFull = true;
                $scope.toggleNav = function() {
                    $scope.navFull = $scope.navFull ? false : true;
                    $rs.navOffCanvas = $rs.navOffCanvas ? false : true;

                    $timeout(function() {
                        $rs.$broadcast('c3.resize');
                    }, 260);	// adjust this time according to nav transition
                };

                // ======= Site Settings
                $scope.toggleSettingsBox = function() {
                    $scope.isSettingsOpen = $scope.isSettingsOpen ? false : true;
                };

                $scope.themeActive = 'theme-zero';	// first theme

                $scope.fixedHeader = true;
                $scope.navHorizontal = false;	// this will access by other directive, so in rootScope.

                // === saving states
                var SETTINGS_STATES = '_setting-states';
                var statesQuery = {
                    get : function() {
                        return JSON.parse(localStorage.getItem(SETTINGS_STATES));
                    },
                    put : function(states) {
                        localStorage.setItem(SETTINGS_STATES, JSON.stringify(states));
                    }
                };

                // initialize the states
                var sQuery = statesQuery.get() || {
                        navHorizontal: $scope.navHorizontal,
                        fixedHeader: $scope.fixedHeader,
                        //navFull: $scope.navFull,
                        themeActive: $scope.themeActive
                    };
                // console.log(savedStates);
                if (sQuery) {
                    $scope.navHorizontal = sQuery.navHorizontal;
                    $scope.fixedHeader = sQuery.fixedHeader;
                    //$scope.navFull = sQuery.navFull;
                    $scope.themeActive = sQuery.themeActive;
                }

                // putting the states
                $scope.onNavHorizontal = function() {
                    sQuery.navHorizontal = $scope.navHorizontal;
                    statesQuery.put(sQuery);
                };

                $scope.onNavFull = function() {
                    sQuery.navFull = $scope.navFull;
                    statesQuery.put(sQuery);

                    $timeout(function() {
                        $rs.$broadcast('c3.resize');
                    }, 260);

                };

                $scope.onFixedHeader = function() {
                    sQuery.fixedHeader = $scope.fixedHeader;
                    statesQuery.put(sQuery);
                };

                $scope.onThemeActive = function() {
                    sQuery.themeActive = $scope.themeActive;
                    statesQuery.put(sQuery);
                };

                $scope.onThemeChange = function(theme) {
                    $scope.themeActive = theme;
                    $scope.onThemeActive();
                };

                $scope.modalNewVersion = function() {
                    $modal.open({
                        templateUrl: '/views/modals/versionCreate.html',
                        size: 'lg',
                        controller: 'NewVersionCtrl as ctrl',
                        resolve: function() {},
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                };
            }])

        .controller('EditLogoCtrl', function($scope, $modal) {

            $scope.modalEditLogo = modalEditLogo;

            function modalEditLogo() {
                $modal.open({
                    templateUrl: 'views/modals/logoEdit.html',
                    size: 'lg',
                    controller: 'EditImgCtrl as ctrl',
                    resolve: function() {},
                    backdrop : 'static',
                    windowClass: $scope.modalAnim	// Animation Class put here.
                });
            }
        })

        .controller('ErrorCtrl', function ($scope, $state) {
            $scope.error = $state.current.error;
            if($scope.error.message === 'JWT must have 3 parts'){
                $state.go('accessdenied',$scope.error);
            }
            console.log($scope.error.message);
        })

        .controller('AccessDeniedCtrl', function ($scope, $state) {
            $scope.error = $state.current.error;
            console.log($scope.error);
        })

        .controller('HeadCtrl',
            function($scope, $modal, $state, $sessionStorage, LogOutRedirect, CONFIG, docTester,
                     currentUser, notifications, currentUserModel, headerModel, orgScreenModel, jwtHelper) {
                $scope.showExplore = headerModel.showExplore;
                $scope.showDash = headerModel.showDash;
                $scope.currentUserModel = currentUserModel;
                $scope.orgScreenModel = orgScreenModel;
                currentUserModel.setCurrentUserInfo(currentUser);
                $scope.notifications = notifications;
                console.log($scope.notifications);
                $scope.doSearch = doSearch;
                $scope.doLogOut = doLogOut;
                $scope.toggleFloatingSidebar = toggleFloatingSidebar;
                $scope.toApis = toApis;
                $scope.toAccessDenied = toAccessDenied;
                $scope.toMarketDash = toMarketDash;

                checkIsEmailPresent();

                function checkIsEmailPresent() {
                    if (!$scope.User.currentUser.email) {
                        console.log('no email!');

                        $modal.open({
                            templateUrl: 'views/modals/emailPrompt.html',
                            // size: 'lg',
                            controller: 'EmailPromptCtrl as ctrl',
                            backdrop: 'static',
                            keyboard: false,
                            resolve: {
                                currentInfo: function() {
                                    return $scope.User.currentUser;
                                }
                            },
                            windowClass: $scope.modalAnim	// Animation Class put here.
                        });
                    }
                }

                function doSearch(query) {
                    $state.go('root.search', {query: query});
                }

                function doLogOut() {
                    var logOutObject = {
                        idpUrl: CONFIG.SECURITY.IDP_URL,
                        spName: CONFIG.SECURITY.SP_NAME,
                        username: $scope.User.currentUser.username
                    };
                    LogOutRedirect.save({}, logOutObject, function (reply) {
                        var string = '';
                        angular.forEach(reply, function (value) {
                            if (typeof value === 'string') {
                                string += value;
                            }
                        });
                        if (jwtHelper.isTokenExpired($sessionStorage.jwt)) {
                            $state.go('logout');
                        } else {
                            window.location.href = string;
                        }
                        delete $sessionStorage.jwt;
                    });
                }

                function toggleFloatingSidebar() {
                    $scope.floatingSidebar = $scope.floatingSidebar ? false : true;
                }

                function toApis() {
                    docTester.reset();
                    $state.go('root.apis.grid');
                }

                function toAccessDenied(){
                    $state.go('accessdenied');
                }

                function toMarketDash() {
                    if ($scope.orgScreenModel.organization === undefined) {
                        $state.go('root.myOrganizations');
                    } else {
                        $state.go('root.market-dash', {orgId: $scope.orgScreenModel.organization.id});
                    }
                }

                $scope.$on('buttonToggle', function (event, data) {
                    $scope.showExplore = headerModel.showExplore;
                    $scope.showDash = headerModel.showDash;
                    $scope.showSearch = headerModel.showSearch;
                });

            })

        .controller('EmailPromptCtrl', function($scope, $modalInstance, currentInfo, currentUserModel, toastService, CurrentUserInfo) {
            $scope.updateEmail = updateEmail;
            $scope.username = currentInfo.fullName;

            function updateEmail(newEmail) {
                var updateObject = {
                    fullName: currentInfo.fullName,
                    company: currentInfo.company,
                    location: currentInfo.location,
                    bio: currentInfo.bio,
                    website: currentInfo.website,
                    email: newEmail,
                    pic: currentInfo.base64pic
                };

                CurrentUserInfo.update({}, updateObject, function (reply) {
                    currentUserModel.updateCurrentUserInfo(currentUserModel).then(function () {
                        toastService.createToast('success', 'Email address updated!', true);
                        $modalInstance.close('Updated');
                    });
                }, function (error) {
                    toastService.createErrorToast(error, 'Could not update your email address. Please try again later.');
                });
            }
        });

    // #end
})(window.angular);
