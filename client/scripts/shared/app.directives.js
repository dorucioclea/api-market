;(function(angular) {
    'use strict';

    angular.module('app.directives', [])

        .directive('collapseNavAccordion', ['$rootScope', function($rs) {
            return {
                restrict: 'A',
                link: function(scope, el, attrs) {
                    var lists = el.find('ul').parent('li'), 	// target li which has sub ul
                        a = lists.children('a'),
                        aul = lists.find('ul a'),
                        listsRest = el.children('li').not(lists),
                        aRest = listsRest.children('a'),
                        stopClick = 0;

                    a.on('click', function(e) {
                        if (!scope.navHorizontal) {
                            if (e.timeStamp - stopClick > 300) {
                                var self = $(this),
                                    parent = self.parent('li');
                                // remove `open` class from all
                                lists.not(parent).removeClass('open');
                                parent.toggleClass('open');
                                stopClick = e.timeStamp;
                            }
                            e.preventDefault();
                        }
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    });

                    aul.on('touchend', function(e) {
                        if (scope.isMobile) {
                            $rs.navOffCanvas = $rs.navOffCanvas ? false : true;
                        }
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    });

                    aRest.on('touchend', function(e) {
                        if (scope.isMobile) {
                            $rs.navOffCanvas = $rs.navOffCanvas ? false : true;
                        }
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    });

                    // slide up nested nav when clicked on aRest
                    aRest.on('click', function(e) {
                        if (!scope.navHorizontal) {
                            var parent = aRest.parent('li');
                            lists.not(parent).removeClass('open');

                        }
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    });

                }
            };
        }])

        // highlight active nav
        .directive('highlightActive', function($location) {
            return {
                restrict: 'A',
                link: function(scope, el, attrs) {
                    var links = el.find('a'),
                        path = function() {return $location.path();},
                        highlightActive = function(links, path) {
                            var path = '#' + path;
                            angular.forEach(links, function(link) {
                                var link = angular.element(link),
                                    li = link.parent('li'),
                                    href = link.attr('href');

                                if (li.hasClass('active')) {
                                    li.removeClass('active');
                                }
                                if (path.indexOf(href) === 0) {
                                    li.addClass('active');
                                }
                            });
                        };

                    highlightActive(links, $location.path());
                    scope.$watch(path, function(newVal, oldVal) {
                        if (newVal === oldVal) {return;}
                        highlightActive(links, $location.path());
                    });
                }
            };
        })

        // perfect-scrollbar simple directive
        .directive('customScrollbar', function($interval) {
            return {
                restrict: 'A',
                link: function(scope, el, attrs) {
                    // if(!scope.$isMobile) // not initialize for mobile
                    // {
                    el.perfectScrollbar({
                        suppressScrollX: true
                    });

                    $interval(function() {
                        if (el[0].scrollHeight >= el[0].clientHeight) {
                            el.perfectScrollbar('update');
                        }
                    }, 400);	// late update means more performance.
                    // }

                }
            };
        })

        // Authentication directives
        .directive('authAccordionGroup', function () {
            return {
                scope: {title: '@heading'},
                transclude: true,
                templateUrl: '/views/templates/auth/accordion-group.html'
            };
        })

        .directive('oauth2', function() {
            return {
                scope: {
                    clientId: '=',
                    clientSecret: '=',
                    scopes: '='
                },
                templateUrl: '/views/templates/auth/oauth2.html'
            };
        })

        .directive('basicAuth', function() {
            return {
                templateUrl: '/views/templates/auth/basic.html'
            };
        })

        .directive('keyAuth', function() {
            return {
                templateUrl: '/views/templates/auth/key.html'
            };
        })

        .directive('queryAuth', function() {
            return {
                templateUrl: '/views/templates/auth/query.html'
            };
        })

        .directive('overview', function () {
            return {
                restrict: 'E',
                scope: {
                    entityVersion: '=',
                    type: '@'
                },
                transclude: true,
                templateUrl: '/views/templates/overview/overview.html'
            };
        })

        .directive('activityList', function () {
            return {
                restrict: 'E',
                scope: {
                    type: '@',
                    activities: '='
                },
                templateUrl: '/views/templates/activity.html'
            };
        })

        .directive('definitionSelect', function ($parse) {
            return {
                restrict: 'A',
                scope: false,
                link: function(scope, element, attrs) {
                    var fn = $parse(attrs.definitionSelect);

                    element.on('change', function(onChangeEvent) {
                        var reader = new FileReader();

                        reader.onload = function(onLoadEvent) {
                            scope.$apply(function() {
                                fn(scope, {$fileContent:onLoadEvent.target.result});
                            });
                        };

                        reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                    });
                }
            };
        })

        .directive('overviewHeader', function () {
            return {
                restrict: 'E',
                scope: {
                    name: '@',
                    hasLogo: '@',
                    base64logo: '@',
                    description: '@',
                    icon: '@',
                    entityVersion: '=',
                    versions: '=',
                    selectVersion: '&',
                    newVersion: '&',
                    endpoint: '@',
                    save: '=',
                    editPermission: '='
                },
                transclude: true,
                templateUrl: '/views/templates/overview/overview-header.html'
            };
        })

        .directive('overviewStatus', function () {
            return {
                restrict: 'E',
                scope: {
                    createdOn: '@',
                    createdBy: '@',
                    status: '@'
                },
                templateUrl: '/views/templates/overview/overview-status.html'
            };
        })

        .directive('overviewTabs', function () {
            return {
                restrict:'E',
                transclude: true,
                templateUrl: '/views/templates/overview/overview-tabs.html',
                controller: function ($scope, alertService) {
                    $scope.alerts = alertService.alerts;
                    $scope.closeAlert = closeAlert;

                    function closeAlert(index) {
                        alertService.closeAlert(index);
                    }
                }
            };
        })

        .directive('policyList', function () {
            return {
                restrict: 'E',
                scope: {
                    policies: '=',
                    policyConfiguration: '=',
                    canEdit: '=',
                    remove: '=removeFunction',
                    reorder: '=reorderFunction',
                    type: '@',
                    org: '@orgId',
                    id: '@pageId',
                    version: '@'
                },
                controller: function($scope) {
                    $scope.policyListOptions = {
                        containerPositioning: 'relative',

                        orderChanged: function(event) {
                            $scope.ctrl.reorder($scope.ctrl.policies);
                        }
                    };

                    $scope.pluginName = $scope.$parent.pluginName;
                },
                templateUrl: 'views/templates/policyList.html'
            };
        })

        .directive('printDiv', function () {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    element.bind('click', function(evt){
                        evt.preventDefault();
                        PrintElem(attrs.printDiv);
                    });

                    function PrintElem(elem) {
                        PrintWithIframe($(elem).html());
                    }

                    function PrintWithIframe(data) {
                        if ($('iframe#printf').size() == 0) {
                            $('html').append('<iframe id="printf" name="printf"></iframe>');  // an iFrame is added to the html content, then your div's contents are added to it and the iFrame's content is printed

                            var mywindow = window.frames["printf"];
                            mywindow.document.write('<html><head><title></title><style>@page {margin: 25mm 25mm 25mm 25mm}</style>'  // Your styles here, I needed the margins set up like this
                                + '</head><body><div>'
                                + data
                                + '</div></body></html>');

                            $(mywindow.document).ready(function(){
                                mywindow.print();
                                setTimeout(function(){
                                        $('iframe#printf').remove();
                                    },
                                    2000);  // The iFrame is removed 2 seconds after print() is executed, which is enough for me, but you can play around with the value
                            });
                        }
                    }
                }
            };
        })

        .directive('scrollToBottom', function ($timeout) {
            return {
                restrict: 'A',
                scope: {
                    prop: '='  
                },
                link: function (scope, element, attrs) {
                    var raw = element[0];

                    // Give the browser a little time to complete rendering
                    $timeout(function () {
                        if (raw.scrollTop === 0 && raw.offsetHeight > raw.scrollHeight) {
                            scope.prop = true;
                            element.addClass('at-bottom')
                        }
                    }, 50);

                    element.bind('scroll', function () {
                        if (raw.scrollTop + raw.offsetHeight > raw.scrollHeight) { //at the bottom
                            scope.prop = true;
                            element.addClass('at-bottom');
                        }
                    })
                }
            }
        })

        .directive('base64Logo', function () {
            return {
                restrict: 'E',
                scope: {
                    logo: '@',
                    logoClass: '@',
                    editable: '@'
                },
                templateUrl: 'views/templates/base64logo.html',
                controller: 'EditLogoCtrl'
            };
        })

        .directive('clickToEdit', function() {
            var editorTemplate = '<div class="click-to-edit">' +
                '<div ng-hide="view.editorEnabled">' +
                '{{value}} ' +
                '<a id="clickToEdit" href class="fa fa-pencil" ng-click="enableEditor()"></a>' +
                '</div>' +
                '<div ng-show="view.editorEnabled">' +
                '<input class="form-control" ng-model="view.editableValue">' +
                '<span class="btn btn-xs fa fa-check" id="clickToSave" ng-click="doSave()"></span>' +
                '<span class="btn btn-xs fa fa-ban" id="clickToCancel" ng-click="disableEditor()"></span>' +
                '</div>' +
                '</div>';

            return {
                restrict: 'A',
                replace: true,
                template: editorTemplate,
                scope: {
                    value: '=',
                    saveFunction: '&'
                },
                controller: function($scope) {
                    $scope.view = {
                        editableValue: $scope.value,
                        editorEnabled: false
                    };

                    $scope.enableEditor = function() {
                        $scope.view.editorEnabled = true;
                        $scope.view.editableValue = $scope.value;
                    };

                    $scope.disableEditor = function() {
                        $scope.view.editorEnabled = false;
                    };

                    $scope.doSave = function() {
                        $scope.value = $scope.view.editableValue;
                        $scope.saveFunction()($scope.value);
                        $scope.disableEditor();
                    };
                }
            };
        })

        .directive('statusLabel', function () {
            return {
                restrict: 'E',
                scope: {status: '@'},
                template: '<label class=\"label text-uppercase\" ' +
                'data-ng-class=\"{\'label-success\': status === \'Published\' || status === \'Registered\'' +
                ' || status === \'Locked\' || status === \'OPEN\',' +
                '\'label-warning\': status === \'Ready\' || status === \'Deprecated\', ' +
                '\'label-purple\': status === \'Created\', ' +
                '\'label-danger\': status === \'CLOSED\', ' +
                '\'label-muted\': status === \'Retired\'}\">' +
                '{{status}}</label>'
            };
        })

        .directive('statusText', function () {
            return {
                restrict: 'E',
                scope: {
                    status: '@'
                },
                template: '<span class="text-uppercase" ' +
                'data-ng-class=\"{\'text-success\': status === \'Published\' || status === \'Registered\'' +
                ' || status === \'Locked\' || status === \'OPEN\',' +
                '\'text-warning\': status === \'Ready\' || status === \'Deprecated\', ' +
                '\'text-purple\': status === \'Created\', ' +
                '\'text-danger\': status === \'CLOSED\', ' +
                '\'text-muted\': status === \'Retired\'}\">' +
                '{{status}}</span>'
            }
        })

        .directive('apiList', function () {
            return {
                restrict: 'E',
                scope: {
                    apis: '='
                },
                controller: function ($scope, currentUserModel, followerService, CONFIG) {
                    $scope.followAction = followAction;
                    $scope.userIsFollowing = userIsFollowing;
                    $scope.useFriendlyNames = CONFIG.APP.ORG_FRIENDLY_NAME_ENABLED;

                    function followAction(api) {
                        if (userIsFollowing(api)) {
                            // Already following, so unfollow
                            followerService.removeFollower(api);

                        } else {
                            // Not yet following, so add follower
                            followerService.addFollower(api);
                        }
                    }

                    function userIsFollowing(api) {
                        return (api.service.followers.indexOf(currentUserModel.currentUser.username) > -1);
                    }
                },
                templateUrl: 'views/templates/apilist.html'
            };
        })

        .directive('apiGrid', function () {
            return {
                restrict: 'E',
                scope: {
                    apis: '='
                },
                controller: function ($scope, currentUserModel, followerService, CONFIG) {
                    $scope.followAction = followAction;
                    $scope.useFriendlyNames = CONFIG.APP.ORG_FRIENDLY_NAME_ENABLED;
                    $scope.userIsFollowing = userIsFollowing;

                    function followAction(api) {
                        if (userIsFollowing(api)) {
                            // Already following, so unfollow
                            followerService.removeFollower(api);

                        } else {
                            // Not yet following, so add follower
                            followerService.addFollower(api);
                        }
                    }

                    function userIsFollowing(api) {
                        return (api.service.followers.indexOf(currentUserModel.currentUser.username) > -1);
                    }
                },
                templateUrl: 'views/templates/apigrid.html'
            };
        })

        .directive('supportList', function () {
            return {
                restrict: 'E',
                scope: {
                    currentUser: '=',
                    tickets: '=',
                    serviceVersion: '='
                },
                controller:
                    function ($scope, $uibModal, loginHelper) {
                        $scope.modalNewTicketOpen = modalNewTicketOpen;
                        $scope.loggedIn = loginHelper.checkLoggedIn();

                        function modalNewTicketOpen() {
                            $uibModal.open({
                                templateUrl: 'views/modals/ticketCreate.html',
                                size: 'lg',
                                controller: 'CreateSupportTicketCtrl',
                                resolve: {
                                    serviceVersion: $scope.serviceVersion
                                },
                                backdrop : 'static',
                                windowClass: $scope.modalAnim	// Animation Class put here.
                            });
                        }
                    },
                templateUrl: 'views/templates/support/supportlist.html'
            };
        })
        .directive('supportTicket', function () {
            return {
                restrict: 'E',
                scope: {
                    ticket: '=',
                    currentUser: '=',
                    serviceVersion: '='
                },
                controller:
                    function ($scope, $uibModal, Users, ServiceTicketComments) {
                        $scope.openTicket = openTicket;
                        $scope.user = {};
                        $scope.comments = [];

                        Users.get({userId: $scope.ticket.createdBy}, function (reply) {
                            $scope.user = reply;
                        });

                        ServiceTicketComments.query({supportId: $scope.ticket.id},
                            function (reply) {
                                $scope.comments = reply;
                            }
                        );

                        function openTicket() {
                            $uibModal.open({
                                templateUrl: 'views/modals/ticketView.html',
                                size: 'lg',
                                controller: 'ViewSupportTicketCtrl',
                                resolve: {
                                    currentUser: $scope.currentUser,
                                    ticket: $scope.ticket,
                                    user: $scope.user,
                                    serviceVersion: $scope.serviceVersion
                                },
                                backdrop : 'static',
                                windowClass: $scope.modalAnim
                            });
                        }
                    },
                templateUrl: 'views/templates/support/ticket.html'
            };
        })
        .directive('commentList', function () {
            return {
                restrict: 'E',
                scope: {
                    comments: '=',
                    currentUser: '=',
                    serviceVersion: '='
                },
                controller:
                    function ($scope, $modal, ServiceTicketComments, toastService, TOAST_TYPES) {
                        this.deleteComment = deleteComment;
                        this.isOwnComment = isOwnComment;
                        this.isServiceOwner = isServiceOwner;
                        this.saveComment = saveComment;

                        function isOwnComment(comment) {
                            return comment.createdBy === $scope.currentUser.currentUser.username;
                        }

                        function isServiceOwner() {
                            return $scope.serviceVersion.createdBy === $scope.currentUser.currentUser.username;
                        }

                        function deleteComment(comment) {
                            ServiceTicketComments.remove({supportId: comment.supportId, commentId: comment.id},
                                function (reply) {
                                    for (var i = 0; i < $scope.comments.length; i++) {
                                        var checkedComment = $scope.comments[i];
                                        if (checkedComment.id === comment.id) {
                                            $scope.comments.splice(i, 1);
                                            break;
                                        }
                                    }
                                    toastService.createToast(TOAST_TYPES.WARNING, '<b>Comment deleted.</b>', true);
                                }, function (error) {
                                    toastService.createErrorToast(error, 'Could not delete comment');
                                });
                        }

                        function saveComment(comment) {
                            var updatedCommentObject = {
                                comment: comment.comment
                            };
                            ServiceTicketComments.update({supportId: comment.supportId, commentId: comment.id},
                                updatedCommentObject,
                                function (reply) {
                                    for (var i = 0; i < $scope.comments.length; i++) {
                                        var checkedComment = $scope.comments[i];
                                        if (checkedComment.id === comment.id) {
                                            $scope.comments[i] = comment;
                                            break;
                                        }
                                    }
                                    toastService.createToast(TOAST_TYPES.INFO, '<b>Comment updated.</b>', true);
                                }, function (error) {
                                    toastService.createErrorToast(error, 'Could not update comment');
                                });
                        }
                    },
                templateUrl: 'views/templates/support/commentlist.html'
            };
        })
        .directive('supportTicketComment', function () {
            return {
                restrict: 'E',
                require: '^commentList',
                scope: {
                    comment: '='
                },
                link: function ($scope, iElement, iAttrs, commentListCtrl) {
                    $scope.deleteComment = function (comment) {
                        commentListCtrl.deleteComment(comment);
                    };
                    $scope.ownComment = commentListCtrl.isOwnComment($scope.comment);
                    $scope.isServiceOwner = commentListCtrl.isServiceOwner();
                    $scope.saveComment = function (comment) {
                        commentListCtrl.saveComment(comment);
                        $scope.editMode = !$scope.editMode;
                    };
                },
                controller:
                    function ($scope, $uibModal, Users) {
                        $scope.user = {};
                        $scope.editMode = false;
                        $scope.editComment = editComment;

                        Users.get({userId: $scope.comment.createdBy}, function (reply) {
                            $scope.user = reply;
                        });

                        function editComment() {
                            $scope.editMode = !$scope.editMode;
                        }
                    },
                templateUrl: 'views/templates/support/comment.html'
            };
        })

        /**
         * AngularJS directive to improve the user experience for forms.  When the user has stopped activity in a field, validation errors can be displayed.
         * @version v0.0.1 - 2014-01-22
         * @link https://github.com/calendee/val-on-timeout
         * @author Justin Noel
         * @license MIT License, http://www.opensource.org/licenses/MIT
         */
        .directive('validateOnTimeout', ['$timeout', function($timeout) {

            return {
                restrict    : 'AC',
                require     : 'ngModel',
                link        : function(scope, elem, attrs, ctrl) {
                    var timer, typingLimit, focusLimit, blurLimit;
                    ctrl.$timedout = false;
                    if(attrs.hasOwnProperty('typingLimit')) typingLimit = parseInt(attrs.typingLimit, 10); else typingLimit = 1000;
                    if(attrs.hasOwnProperty('focusLimit')) focusLimit = parseInt(attrs.focusLimit, 10); else focusLimit = 5000;
                    if(attrs.hasOwnProperty('blurLimit')) blurLimit = parseInt(attrs.blurLimit, 10); else blurLimit = 500;

                    /**
                     * Start timer for specified period.  If not cancelled before triggered, the 'timeout' property will
                     * be added to the field.
                     *
                     * @param timeLimit
                     */
                    var startTimer = function(timeLimit) {

                        timer = $timeout(function(){

                            scope.$apply( function() {
                                ctrl.$timedout = true;
                            });

                        }, timeLimit);

                    };

                    /**
                     * Cancel any existing timer.
                     */
                    var cancelTimer = function() {

                        $timeout.cancel(timer);

                    };

                    /**
                     * Will start a timer after focus event fired for field.
                     * Used to detect when field receives focus but typing never starts
                     */
                    if( attrs.hasOwnProperty('focusLimit')) {

                        elem.bind('focus', function(){
                            // If the field has already timedout, don't change it.
                            if(ctrl.$timedout) return;
                            // If timer is already running, kill it
                            if(timer) cancelTimer();
                            // Start the timer
                            startTimer(focusLimit);
                        })
                    }

                    /**
                     * Will start a timer after blur event fired for field
                     */
                    if( attrs.hasOwnProperty('blurLimit')) {

                        elem.bind('blur', function(){
                            // If the field has already timedout, don't change it.
                            if(ctrl.$timedout) return;
                            // If timer is already running, kill it
                            if(timer) cancelTimer();
                            // Start the timer
                            startTimer(blurLimit);
                        })
                    }

                    /**
                     * Will start a timer after each keypress to detect when typing stops
                     */
                    elem.bind('keydown', function() {
                        // If the field has already timedout, don't change it.
                        if(ctrl.$timedout) return;
                        // If timer is already running, kill it
                        if(timer) cancelTimer();
                        // Start the timer
                        startTimer(typingLimit);
                    });
                }
            }
        }])

        // add full body class for custom pages.
        .directive('customPage', function($location) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    var path = function() {return $location.path(); };
                    var addBg = function(path) {
                        scope.bodyFull = false;
                        switch (path) {
                            case '/404': case '/pages/404' : case '/pages/signin' :
                            case '/pages/signup' : case '/pages/forget-pass' :
                            case '/pages/lock-screen':
                                scope.bodyFull = true;
                        }

                    };
                    addBg(path());

                    scope.$watch(path, function(newVal, oldVal) {
                        if (angular.equals(newVal, oldVal)) { return; }
                        addBg(path());
                    });

                }
            };

        });

}(window.angular));

