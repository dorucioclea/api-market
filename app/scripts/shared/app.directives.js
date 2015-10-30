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
            bindToController: true,
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
                editPermission: '@'
            },
            bindToController: true,
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
            templateUrl: '/views/templates/overview/overview-tabs.html'
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
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'views/templates/policyList.html'
        };
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
            '\'label-warning\': status === \'Ready\' || status === \'Created\', ' +
            '\'label-danger\': status === \'CLOSED\',' +
            '\'label-muted\': status === \'Retired\'}\">' +
            '{{status}}</label>'
        };
    })

        .directive('apiList', function () {
            return {
                retrict: 'E',
                scope: {
                    apis: '=',
                    stats: '='
                },
                controller: function ($scope, currentUserModel, followerService) {
                    $scope.followAction = followAction;
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
                templateUrl: 'views/templates/apilist.html'
            };
        })

        .directive('apiGrid', function () {
            return {
                restrict: 'E',
                scope: {
                    apis: '=',
                    stats: '='
                },
                controller: function ($scope, currentUserModel, followerService) {
                        $scope.followAction = followAction;
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
                    serviceVersion: '=',
                    publisherMode: '='
                },
                controller:
                    function ($scope, $modal) {
                        $scope.modalNewTicketOpen = modalNewTicketOpen;

                        function modalNewTicketOpen() {
                            $modal.open({
                                templateUrl: 'views/modals/ticketCreate.html',
                                size: 'lg',
                                controller: 'CreateSupportTicketCtrl',
                                resolve: {
                                    serviceVersion: $scope.serviceVersion
                                },
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
                    publisherMode: '=',
                    currentUser: '=',
                    serviceVersion: '='
                },
                controller:
                    function ($scope, $modal, Users, ServiceTicketComments) {
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
                            $modal.open({
                                templateUrl: 'views/modals/ticketView.html',
                                size: 'lg',
                                controller: 'ViewSupportTicketCtrl',
                                resolve: {
                                    currentUser: $scope.currentUser,
                                    ticket: $scope.ticket,
                                    user: $scope.user,
                                    publisherMode: $scope.publisherMode,
                                    serviceVersion: $scope.serviceVersion
                                },
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
                    publisherMode: '=',
                    serviceVersion: '='
                },
                controller:
                    function ($scope, $modal, ServiceTicketComments, CurrentUserInfo,
                              toastService, TOAST_TYPES) {
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
                    comment: '=',
                    publisherMode: '='
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
                    function ($scope, $modal, Users) {
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

