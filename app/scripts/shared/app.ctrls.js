;(function(angular) {
    'use strict';

    angular.module('app.ctrls', [])

        // Root Controller
        .controller('AppCtrl', ['$rootScope', '$scope', '$state', '$uibModal', '$timeout',
            'Action', 'ACTIONS', 'currentUserModel', 'toastService', 'TOAST_TYPES', 'docTester', '$sessionStorage', 'CONFIG',
            function($rs, $scope, $state, $uibModal, $timeout,
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

                $scope.toasts = toastService.toasts;

                $scope.togglePublisher = function () {
                    $scope.publisherMode = !$scope.publisherMode;
                    setHeader();
                };

                var setHeader = function () {
                    $scope.header = 'ACPAAS - API ' + ($scope.publisherMode ? 'Publisher' : 'Store');
                };
                setHeader();

                $scope.navFull = false;

                $scope.toggleNav = function() {
                    $scope.navFull = $scope.navFull ? false : true;
                    $rs.navOffCanvas = $rs.navOffCanvas ? false : true;

                    $timeout(function() {
                        $rs.$broadcast('c3.resize');
                    }, 260);	// adjust this time according to nav transition
                };

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
                        navFull: $scope.navFull
                    };
                // console.log(savedStates);
                if (sQuery) {
                    $scope.navFull = sQuery.navFull;
                }

                $scope.onNavFull = function() {
                    sQuery.navFull = $scope.navFull;
                    statesQuery.put(sQuery);

                    $timeout(function() {
                        $rs.$broadcast('c3.resize');
                    }, 260);

                };

                $scope.modalNewVersion = function() {
                    $uibModal.open({
                        templateUrl: '/views/modals/versionCreate.html',
                        size: 'lg',
                        controller: 'NewVersionCtrl as ctrl',
                        resolve: function() {},
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                };
            }])

        .controller('EditLogoCtrl', function($scope, $uibModal) {

            $scope.modalEditLogo = modalEditLogo;

            function modalEditLogo() {
                $uibModal.open({
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
        })

        .controller('AccessDeniedCtrl', function ($scope, $state) {
            $scope.error = $state.current.error;
            console.log($scope.error);
        })

        .controller('HeadCtrl',
            function($scope, $uibModal, $state, $localStorage, $sessionStorage, CONFIG, docTester,
                     currentUserInfo, notifications, pendingNotifications, currentUser,
                     currentUserModel, headerModel, orgScreenModel, notificationService,
                     toastService, jwtHelper, loginHelper, EVENTS) {
                
                var controller = this;
                $scope.currentUserModel = currentUserModel;
                $scope.orgScreenModel = orgScreenModel;
                $scope.notifications = notifications;
                $scope.pendingNotifications = pendingNotifications;
                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.clearNotification = clearNotification;
                $scope.clearAllNotifications = clearAllNotifications;
                $scope.doLogOut = doLogOut;
                $scope.toggleFloatingSidebar = toggleFloatingSidebar;
                $scope.toApis = toApis;
                $scope.toAccessDenied = toAccessDenied;
                $scope.toLogin = toLogin;
                $scope.toMarketDash = toMarketDash;
                controller.appNeededLater = appNeededLater;
                controller.appNeededOk = appNeededOk;
                controller.appNeededOkForOrg = appNeededOkForOrg;
                controller.orgNeededLater = orgNeededLater;
                controller.orgNeededOk = orgNeededOk;


                init();

                function init() {
                    $scope.loggedIn = loginHelper.checkLoggedIn();
                    $scope.title = CONFIG.APP.PUBLISHER_MODE ? 'API Publisher' : 'API Store';

                    checkIsEmailPresent();
                    checkFirstVisit();
                    checkNeedsPopover();

                    $scope.$on(EVENTS.NOTIFICATIONS_UPDATED, function () {
                        notificationService.getNotificationsForUser().then(function (notifs) {
                            $scope.notifications = notifs;
                            notificationService.getPendingNotificationsForUser().then(function (pending) {
                                $scope.pendingNotifications = pending;
                            })
                        })
                    });

                    $scope.$on(EVENTS.API_DETAILS_PAGE_OPENED, function () {
                        $scope.onApiPage = true;
                        checkNeedsPopover();
                    })
                }

                function checkIsEmailPresent() {
                    if ($scope.loggedIn && !$scope.User.currentUser.email) {
                        console.log('no email!');

                        $uibModal.open({
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

                function checkFirstVisit() {
                    if (!$scope.loggedIn && !$scope.publisherMode && !loginHelper.checkIsFirstVisit()) {
                        console.log('first visit!');

                        $uibModal.open({
                            templateUrl: 'views/modals/firstVisit.html',
                            size: 'lg',
                            controller: 'FirstVisitCtrl',
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

                function checkNeedsPopover() {
                    if ($scope.loggedIn && !$scope.publisherMode) {
                        currentUser.checkStatus().then(function (status) {
                            $scope.status = status;
                            if (!$scope.status.hasOrg && !$localStorage.orgPopupSeen) controller.orgPopoverOpen = true;
                            if ($scope.status.hasOrg && !$scope.status.hasApp && !$localStorage.appPopupSeen) controller.appPopoverOpen = true;
                        });
                    }
                }

                function clearNotification(notification) {
                    $scope.notifications.splice($scope.notifications.indexOf(notification), 1);
                    notificationService.clear(notification).then(function () {
                        toastService.info('<b>Notification cleared!</b>');
                    })
                }

                function clearAllNotifications() {
                    $scope.notifications = [];
                    notificationService.clearAll().then(function () {
                        toastService.info('<b>Notifications cleared!</b>');
                    });
                }

                function doLogOut() {
                    loginHelper.logout();
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

                function toLogin() {
                    console.log('login button redirect');
                    loginHelper.redirectToLogin();
                }

                function toMarketDash() {
                    if ($scope.orgScreenModel.organization === undefined) {
                        $state.go('root.myOrganizations');
                    } else {
                        $state.go('root.market-dash', {orgId: $scope.orgScreenModel.organization.id});
                    }
                }

                function appNeededLater() {
                    controller.appPopoverOpen = false;
                    $localStorage.appPopupSeen = true;
                }

                function appNeededOk() {
                    currentUser.getUserAppOrgs().then(function (orgs) {
                        if (orgs.length > 1) {
                            controller.multipleOrgs = orgs;
                        } else {
                            controller.appPopoverOpen = false;
                            $localStorage.appPopupSeen = true;
                            $state.go('root.market-dash', { orgId: orgs[0].id, mode: 'create' });
                        }
                    });
                }

                function appNeededOkForOrg(org) {
                    controller.appPopoverOpen = false;
                    $localStorage.appPopupSeen = true;
                    $state.go('root.market-dash', { orgId: org.id, mode: 'create' });
                }

                function orgNeededLater() {
                    controller.orgPopoverOpen = false;
                    $localStorage.orgPopupSeen = true;
                }

                function orgNeededOk() {
                    controller.orgPopoverOpen = false;
                    $localStorage.orgPopupSeen = true;
                    $state.go('root.myOrganizations', { mode: 'create' });
                }
            })

        .controller('EmailPromptCtrl', function($scope, $uibModalInstance, currentInfo, currentUserModel, toastService, currentUser) {
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

                currentUser.update(updateObject).then(function () {
                    currentUserModel.refreshCurrentUserInfo(currentUserModel).then(function () {
                        toastService.createToast('success', 'Email address updated!', true);
                        $uibModalInstance.close('Updated');
                    });
                }, function (error) {
                    toastService.createErrorToast(error, 'Could not update your email address. Please try again later.');
                });
            }
        })
        
        .controller('FirstVisitCtrl', function ($scope, $uibModalInstance, $localStorage, loginHelper) {
            $scope.login = login;
            $scope.later = later;
            
            function login() {
                $localStorage.hasVisited = true;
                console.log('first Visit redirect');
                loginHelper.redirectToLogin();
            }
            
            function later() {
                $localStorage.hasVisited = true;
                $uibModalInstance.dismiss('later');
            }
        })

        .controller('LogoutCtrl', function($scope, $state, $timeout) {
            $scope.secondsRemaining = 5;

            countDownSecond();

            function countDownSecond() {
                $timeout(function () {
                    $scope.secondsRemaining--;
                    if ($scope.secondsRemaining > 0) {
                        countDownSecond();
                    } else {
                        if ($scope.publisherMode) $state.go('root.myOrganizations');
                        else $state.go('root.apis.grid');
                    }
                }, 1000);
            }
        });

    // #end
})(window.angular);
